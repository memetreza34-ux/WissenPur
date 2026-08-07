import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Coins,
  Flame,
  FolderOpen,
  LayoutGrid,
  Library,
  LogIn,
  LogOut,
  Medal,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  Trophy,
  User,
  X,
  Zap,
} from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { CATEGORIES, QUESTIONS } from './data';
import { BrainVisualizer } from './components/BrainVisualizer';
import { DailySpinWheel } from './components/DailySpinWheel';
import { Button, Card, ProgressBar } from './components/UI';
import { Flashcards } from './pages/Flashcards';
import { auth, logout, signInWithGoogle } from './firebase';
import { generateQuestions } from './services/geminiService';
import {
  claimServerDailyReward,
  getCallableErrorMessage,
  purchaseServerShopItem,
  revealSecureRankedQuizSession,
  ServerEconomyStats,
  startSecureRankedQuizSession,
  submitRankedQuizSession,
} from './services/economyService';
import { getLeaderboard, syncUserStats } from './services/firebaseService';
import { getStats, saveStats } from './storage';
import {
  CategoryId,
  CustomQuiz,
  Difficulty,
  getLevelInfo,
  LeaderboardEntry,
  Question,
  UserStats,
} from './types';

type ReleaseScreen =
  | 'today'
  | 'learn'
  | 'library'
  | 'progress'
  | 'profile'
  | 'leaderboard'
  | 'ai-create'
  | 'shop'
  | 'quiz'
  | 'result'
  | 'flashcards';

type ReleaseStats = UserStats & {
  economyVersion?: number;
  lastDailyChallengeDate?: string | null;
  lastSpinDate?: string | null;
};

type DisplayQuestion = Omit<Question, 'correctAnswer'> & {
  correctAnswer?: number;
};

type QuizMode = 'standard' | 'daily' | 'blitz' | 'practice' | 'review';

interface ActiveQuiz {
  title: string;
  category: string;
  mode: QuizMode;
  ranked: boolean;
  sessionId?: string;
  questions: DisplayQuestion[];
  perQuestionSeconds: number;
  globalSeconds?: number;
}

interface QuizResult {
  ranked: boolean;
  title: string;
  correct: number;
  total: number;
  pointsEarned: number;
  coinsEarned: number;
  answers: number[];
  reveals: Record<string, { correctAnswer: number; explanation: string }>;
  error?: string;
}

const NAV_ITEMS: Array<{ id: ReleaseScreen; label: string; icon: typeof Play }> = [
  { id: 'today', label: 'Heute', icon: Play },
  { id: 'learn', label: 'Lernen', icon: LayoutGrid },
  { id: 'library', label: 'Bibliothek', icon: Library },
  { id: 'progress', label: 'Fortschritt', icon: Brain },
  { id: 'profile', label: 'Profil', icon: User },
];

const DIFFICULTIES: Array<{ id: Difficulty | 'all'; label: string }> = [
  { id: 'all', label: 'Gemischt' },
  { id: 'leicht', label: 'Leicht' },
  { id: 'mittel', label: 'Mittel' },
  { id: 'schwer', label: 'Schwer' },
];

const SHOP_ITEMS = [
  { id: 'fiftyFifty', title: '50:50 Joker', cost: 50, description: 'Entfernt zwei falsche Optionen.' },
  { id: 'timeFreeze', title: 'Zeit-Freeze', cost: 75, description: 'Friert den Übungstimer ein.' },
  { id: 'secondChance', title: 'Zweite Chance', cost: 100, description: 'Erlaubt einen weiteren Versuch.' },
  { id: 'avatar1', title: 'Avatar Aneka', cost: 200, description: 'Neuer Profilavatar.' },
  { id: 'Quiz-Gott', title: 'Titel Quiz-Gott', cost: 500, description: 'Profil-Auszeichnung.' },
] as const;

const berlinDateKey = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

const selectLocalQuestions = (
  category: CategoryId | 'all',
  difficulty: Difficulty | 'all',
  count: number,
): Question[] => {
  let pool = QUESTIONS.filter((question) => category === 'all' || question.category === category);
  if (difficulty !== 'all') {
    const difficultyPool = pool.filter((question) => question.difficulty === difficulty);
    if (difficultyPool.length >= Math.min(count, 5)) pool = difficultyPool;
  }
  if (pool.length < count) pool = [...QUESTIONS];
  return shuffle(pool).slice(0, Math.min(count, pool.length));
};

const mergeServerStats = (local: ReleaseStats, server: ServerEconomyStats): ReleaseStats => ({
  ...local,
  ...server,
  customName: local.customName,
  age: local.age,
  wrongQuestions: local.wrongQuestions || [],
  customDifficultyTimes: local.customDifficultyTimes,
  darkMode: local.darkMode,
  customQuizzes: local.customQuizzes || [],
  customPhotoURL: server.customPhotoURL ?? local.customPhotoURL,
});

const maskEconomyUntilHydrated = (local: ReleaseStats): ReleaseStats => ({
  ...local,
  economyVersion: undefined,
  totalPoints: 0,
  coins: 0,
  currentStreak: 0,
  bestStreak: 0,
  roundsPlayed: 0,
  correctAnswers: 0,
  totalQuestionsAnswered: 0,
  dailyQuestionsAnswered: 0,
  lastDailyQuestionsDate: null,
  dailyRewardClaimed: false,
  lastPlayedDate: null,
  lastDailyChallengeDate: null,
  lastDailyRewardDate: null,
  lastSpinDate: null,
  achievements: [],
  powerUps: {
    fiftyFifty: 0,
    timeFreeze: 0,
    secondChance: 0,
  },
  unlockedAvatars: ['default'],
  unlockedTitles: ['Neuling'],
  equippedTitle: 'Neuling',
  customPhotoURL: undefined,
  categoryStats: {},
  weeklyGoal: undefined,
});

const safeError = (error: unknown) => getCallableErrorMessage(error).replace(/^Firebase:\s*/i, '');

export default function ReleaseApp() {
  const [screen, setScreen] = useState<ReleaseScreen>('today');
  const [stats, setStats] = useState<ReleaseStats>(() => getStats() as ReleaseStats);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAccountHydrating, setIsAccountHydrating] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const answersRef = useRef<number[]>([]);
  const quizGenerationRef = useRef(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionSeconds, setQuestionSeconds] = useState(20);
  const [globalSeconds, setGlobalSeconds] = useState(60);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const submittingRef = useRef(false);
  const [aiTopic, setAiTopic] = useState('');
  const [flashcardQuestions, setFlashcardQuestions] = useState<Question[]>([]);
  const [flashcardDeckId, setFlashcardDeckId] = useState<string | null>(null);

  const persistStats = (next: ReleaseStats) => {
    setStats(next);
    saveStats(next);
  };

  const applyServerStats = (server: ServerEconomyStats) => {
    const next = mergeServerStats(getStats() as ReleaseStats, server);
    persistStats(next);
    return next;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setIsAccountHydrating(false);
        return;
      }

      const localBeforeHydration = getStats() as ReleaseStats;
      setStats(maskEconomyUntilHydrated(localBeforeHydration));
      setIsAccountHydrating(true);
      setNotice(null);
      try {
        const hydrated = await syncUserStats(localBeforeHydration);
        if (hydrated) persistStats(hydrated as ReleaseStats);
      } catch (error) {
        setNotice(`Kontodaten konnten nicht sicher geladen werden: ${safeError(error)}`);
      } finally {
        setIsAccountHydrating(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', Boolean(stats.darkMode));
  }, [stats.darkMode]);

  useEffect(() => {
    if (screen !== 'leaderboard' || isAccountHydrating) return;
    getLeaderboard(100)
      .then(setLeaderboard)
      .catch((error) => setNotice(safeError(error)));
  }, [screen, isAccountHydrating]);

  const weakCategory = useMemo(() => {
    const entries = Object.entries(stats.categoryStats || {}).filter(([, value]) => value.totalQuestions > 0);
    if (entries.length === 0) return null;
    return entries.sort(([, left], [, right]) =>
      left.correctAnswers / left.totalQuestions - right.correctAnswers / right.totalQuestions,
    )[0]?.[0] as CategoryId | undefined;
  }, [stats.categoryStats]);

  const dueCards = useMemo(() => {
    const now = Date.now();
    return (stats.customQuizzes || []).flatMap((deck) => deck.questions).filter((question) => {
      if (!question.srsData?.nextReviewDate) return true;
      return new Date(question.srsData.nextReviewDate).getTime() <= now;
    }).length;
  }, [stats.customQuizzes]);

  const startActiveQuiz = (quiz: ActiveQuiz) => {
    quizGenerationRef.current += 1;
    submittingRef.current = false;
    const initialAnswers = new Array(quiz.questions.length).fill(-1);
    answersRef.current = initialAnswers;
    setAnswers(initialAnswers);
    setActiveQuiz(quiz);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setQuestionSeconds(quiz.perQuestionSeconds);
    setGlobalSeconds(quiz.globalSeconds || 60);
    setResult(null);
    setScreen('quiz');
  };

  const cancelActiveQuiz = () => {
    if (isBusy) return;
    quizGenerationRef.current += 1;
    submittingRef.current = false;
    answersRef.current = [];
    setAnswers([]);
    setSelectedAnswer(null);
    setResult(null);
    setActiveQuiz(null);
    setScreen('today');
  };

  const startRanked = async (
    mode: 'standard' | 'daily' | 'blitz',
    category: CategoryId | 'all',
    difficulty: Difficulty | 'all',
    count: number,
  ) => {
    setNotice(null);
    if (!user) {
      const local = selectLocalQuestions(category, difficulty, mode === 'daily' ? 10 : count);
      startActiveQuiz({
        title: mode === 'daily' ? 'Daily Challenge – Übung' : mode === 'blitz' ? 'Blitz – Übung' : 'Quiz – Übung',
        category,
        mode: 'practice',
        ranked: false,
        questions: local,
        perQuestionSeconds: mode === 'blitz' ? 0 : 20,
        globalSeconds: mode === 'blitz' ? 60 : undefined,
      });
      setNotice('Du spielst ohne Anmeldung im Übungsmodus. Es werden keine Ranglistenpunkte vergeben.');
      return;
    }
    if (isAccountHydrating) {
      setNotice('Dein servergesicherter Fortschritt wird noch geladen. Gewertete Runden starten erst danach.');
      return;
    }

    setIsBusy(true);
    try {
      const started = await startSecureRankedQuizSession(mode, category, difficulty, count);
      startActiveQuiz({
        title: mode === 'daily' ? 'Daily Challenge' : mode === 'blitz' ? 'Blitz-Prüfung' : 'Gewertete Prüfung',
        category: mode === 'daily' ? 'daily' : mode === 'blitz' ? 'blitz' : category,
        mode,
        ranked: true,
        sessionId: started.sessionId,
        questions: started.questions,
        perQuestionSeconds: mode === 'blitz' ? 0 : 20,
        globalSeconds: mode === 'blitz' ? 60 : undefined,
      });
    } catch (error) {
      setNotice(`${safeError(error)} Die Runde wurde nicht gestartet.`);
    } finally {
      setIsBusy(false);
    }
  };

  const startPractice = (title: string, questions: Question[], mode: QuizMode = 'practice') => {
    if (questions.length === 0) {
      setNotice('Für diese Übung sind noch keine Fragen vorhanden.');
      return;
    }
    startActiveQuiz({
      title,
      category: questions[0]?.category || 'custom',
      mode,
      ranked: false,
      questions,
      perQuestionSeconds: 0,
    });
  };

  const finishQuiz = async () => {
    if (!activeQuiz || submittingRef.current) return;
    const submissionGeneration = quizGenerationRef.current;
    submittingRef.current = true;
    setIsBusy(true);
    const submittedAnswers = [...answersRef.current];

    try {
      if (activeQuiz.ranked && activeQuiz.sessionId) {
        const submitted = await submitRankedQuizSession(
          activeQuiz.sessionId,
          activeQuiz.questions.map((question, index) => ({
            questionId: question.id,
            answer: submittedAnswers[index] ?? -1,
          })),
        );
        if (quizGenerationRef.current !== submissionGeneration) return;
        applyServerStats(submitted.stats);

        let reveals: QuizResult['reveals'] = {};
        try {
          const revealed = await revealSecureRankedQuizSession(activeQuiz.sessionId);
          if (quizGenerationRef.current !== submissionGeneration) return;
          reveals = Object.fromEntries(
            revealed.map((entry) => [entry.questionId, {
              correctAnswer: entry.correctAnswer,
              explanation: entry.explanation,
            }]),
          );
        } catch (error) {
          if (quizGenerationRef.current !== submissionGeneration) return;
          setNotice(`Die Runde wurde gewertet, aber die Detailauswertung ist noch nicht verfügbar: ${safeError(error)}`);
        }

        setResult({
          ranked: true,
          title: activeQuiz.title,
          correct: submitted.correct,
          total: submitted.total,
          pointsEarned: submitted.pointsEarned,
          coinsEarned: submitted.coinsEarned,
          answers: submittedAnswers,
          reveals,
        });
      } else {
        const correct = activeQuiz.questions.reduce((total, question, index) =>
          question.correctAnswer !== undefined && submittedAnswers[index] === question.correctAnswer
            ? total + 1
            : total,
        0);
        setResult({
          ranked: false,
          title: activeQuiz.title,
          correct,
          total: activeQuiz.questions.length,
          pointsEarned: 0,
          coinsEarned: 0,
          answers: submittedAnswers,
          reveals: {},
        });
      }
      if (quizGenerationRef.current === submissionGeneration) setScreen('result');
    } catch (error) {
      if (quizGenerationRef.current !== submissionGeneration) return;
      const message = safeError(error);
      setResult({
        ranked: activeQuiz.ranked,
        title: activeQuiz.title,
        correct: 0,
        total: activeQuiz.questions.length,
        pointsEarned: 0,
        coinsEarned: 0,
        answers: submittedAnswers,
        reveals: {},
        error: message,
      });
      setScreen('result');
    } finally {
      if (quizGenerationRef.current === submissionGeneration) {
        setIsBusy(false);
        submittingRef.current = false;
      }
    }
  };

  const advanceQuestion = () => {
    if (!activeQuiz || screen !== 'quiz' || submittingRef.current) return;
    if (questionIndex + 1 >= activeQuiz.questions.length) {
      void finishQuiz();
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSelectedAnswer(null);
    setQuestionSeconds(activeQuiz.perQuestionSeconds);
  };

  const chooseAnswer = (answer: number) => {
    if (!activeQuiz || screen !== 'quiz' || selectedAnswer !== null || isBusy) return;
    setSelectedAnswer(answer);
    const updated = [...answersRef.current];
    updated[questionIndex] = answer;
    answersRef.current = updated;
    setAnswers(updated);

    if (!activeQuiz.ranked) {
      const question = activeQuiz.questions[questionIndex];
      const wrongQuestions = stats.wrongQuestions || [];
      if (question.correctAnswer !== undefined && answer !== question.correctAnswer) {
        const completeQuestion = question as Question;
        if (!wrongQuestions.some((entry) => entry.id === question.id)) {
          persistStats({ ...stats, wrongQuestions: [...wrongQuestions, completeQuestion] });
        }
      } else if (activeQuiz.mode === 'review') {
        persistStats({
          ...stats,
          wrongQuestions: wrongQuestions.filter((entry) => entry.id !== question.id),
        });
      }
    }

    if (activeQuiz.mode === 'blitz' || activeQuiz.globalSeconds) {
      const generation = quizGenerationRef.current;
      window.setTimeout(() => {
        if (quizGenerationRef.current === generation) advanceQuestion();
      }, 250);
    }
  };

  useEffect(() => {
    if (
      screen !== 'quiz' ||
      !activeQuiz ||
      activeQuiz.globalSeconds ||
      activeQuiz.perQuestionSeconds <= 0 ||
      selectedAnswer !== null ||
      isBusy
    ) return;

    if (questionSeconds <= 0) {
      chooseAnswer(-1);
      return;
    }
    const timer = window.setTimeout(() => setQuestionSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [screen, activeQuiz, questionSeconds, selectedAnswer, isBusy]);

  useEffect(() => {
    if (screen !== 'quiz' || !activeQuiz?.globalSeconds || isBusy) return;
    if (globalSeconds <= 0) {
      void finishQuiz();
      return;
    }
    const timer = window.setTimeout(() => setGlobalSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [screen, activeQuiz?.globalSeconds, globalSeconds, isBusy]);

  const createAiSet = async () => {
    const topic = aiTopic.trim();
    if (!topic) return;
    setIsBusy(true);
    setNotice(null);
    try {
      const generated = await generateQuestions(topic, 'all', 10);
      if (!generated || generated.length === 0) throw new Error('Die KI hat keine gültigen Fragen geliefert.');
      const deck: CustomQuiz = {
        id: `set-${Date.now()}`,
        title: topic,
        questions: generated,
        createdAt: Date.now(),
      };
      const next = { ...stats, customQuizzes: [...(stats.customQuizzes || []), deck] };
      persistStats(next);
      if (user) void syncUserStats(next);
      startPractice(`${topic} – KI-Übung`, generated);
    } catch (error) {
      setNotice(safeError(error));
    } finally {
      setIsBusy(false);
    }
  };

  const claimDailyQuest = async () => {
    if (isAccountHydrating) return;
    setIsBusy(true);
    try {
      const response = await claimServerDailyReward();
      applyServerStats(response.stats);
      setNotice('Tagesziel eingelöst: +100 Punkte und +50 Münzen.');
    } catch (error) {
      setNotice(safeError(error));
    } finally {
      setIsBusy(false);
    }
  };

  const buyItem = async (itemId: string) => {
    if (!user) {
      setNotice('Bitte melde dich an, um den servergesicherten Shop zu verwenden.');
      return;
    }
    if (isAccountHydrating) {
      setNotice('Dein servergesicherter Fortschritt wird noch geladen. Der Shop ist danach verfügbar.');
      return;
    }
    setIsBusy(true);
    try {
      const response = await purchaseServerShopItem(itemId);
      applyServerStats(response.stats);
      setNotice('Kauf erfolgreich.');
    } catch (error) {
      setNotice(safeError(error));
    } finally {
      setIsBusy(false);
    }
  };

  const updateFlashcards = (updated: Question[]) => {
    setFlashcardQuestions(updated);
    if (!flashcardDeckId) return;
    const nextDecks = (stats.customQuizzes || []).map((deck) =>
      deck.id === flashcardDeckId ? { ...deck, questions: updated } : deck,
    );
    const next = { ...stats, customQuizzes: nextDecks };
    persistStats(next);
    if (user) void syncUserStats(next);
  };

  const openFlashcards = (questions: Question[], deckId: string | null = null) => {
    if (questions.length === 0) {
      setNotice('Dieses Lernset enthält noch keine Karteikarten.');
      return;
    }
    setFlashcardQuestions(questions);
    setFlashcardDeckId(deckId);
    setScreen('flashcards');
  };

  const renderHeader = (title: string, back?: ReleaseScreen) => (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/70 bg-white/85 px-5 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
      <div className="flex items-center gap-3">
        {back && (
          <button type="button" aria-label="Zurück" onClick={() => setScreen(back)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ChevronLeft size={22} />
          </button>
        )}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">WissenPur</p>
          <h1 className="text-xl font-black text-slate-950 dark:text-white">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-3 py-2 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
        <Coins size={16} />
        <span className="text-sm font-black">{stats.coins || 0}</span>
      </div>
    </header>
  );

  const renderToday = () => {
    const level = getLevelInfo(stats.totalPoints);
    const dailyDone = stats.lastDailyChallengeDate === berlinDateKey();
    const canClaimDaily = (stats.dailyQuestionsAnswered || 0) >= 10 && !stats.dailyRewardClaimed;

    return (
      <div className="min-h-full pb-28">
        <header className="px-5 pb-5 pt-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Dein Lernplan</p>
              <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">Heute</h1>
            </div>
            {user ? (
              <button type="button" onClick={() => setScreen('profile')} className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 font-black text-white">
                {user.photoURL ? <img src={user.photoURL} alt="Profil" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : user.displayName?.[0] || 'U'}
              </button>
            ) : (
              <Button size="sm" onClick={signInWithGoogle}><LogIn size={16} /> Anmelden</Button>
            )}
          </div>

          <Card className="mt-6 overflow-hidden border-0 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-100">Nächster Schritt</p>
                <h2 className="mt-2 text-2xl font-black">{dueCards > 0 ? `${dueCards} Karteikarten wiederholen` : '10-Minuten-Wissenscheck'}</h2>
                <p className="mt-2 max-w-sm text-sm font-medium text-blue-100/80">
                  {weakCategory ? `Empfohlen: Stärke deinen Bereich ${CATEGORIES.find((category) => category.id === weakCategory)?.title || weakCategory}.` : 'Starte mit einer gemischten Runde und baue deine Wissenskarte auf.'}
                </p>
              </div>
              <Brain size={48} className="shrink-0 text-white/30" />
            </div>
            <Button
              className="mt-6 bg-white text-blue-700 hover:bg-blue-50"
              disabled={isAccountHydrating}
              onClick={() => dueCards > 0 && stats.customQuizzes?.length
                ? openFlashcards(stats.customQuizzes.flatMap((deck) => deck.questions))
                : void startRanked('standard', weakCategory || 'all', 'all', 10)}
            >
              Jetzt lernen <ArrowRight size={18} />
            </Button>
          </Card>
        </header>

        <main className="space-y-6 px-5">
          {notice && (
            <div role="status" className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{notice}</span>
              <button type="button" aria-label="Hinweis schließen" onClick={() => setNotice(null)} className="ml-auto"><X size={16} /></button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center"><Flame className="mx-auto text-orange-500" size={22} /><p className="mt-2 text-xl font-black">{stats.currentStreak}</p><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Streak</p></Card>
            <Card className="p-4 text-center"><Trophy className="mx-auto text-blue-500" size={22} /><p className="mt-2 text-xl font-black">{stats.totalPoints}</p><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Punkte</p></Card>
            <Card className="p-4 text-center"><Star className="mx-auto text-amber-500" size={22} /><p className="mt-2 text-xl font-black">{level.level}</p><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Level</p></Card>
          </div>

          <section>
            <div className="mb-3 flex items-end justify-between">
              <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tagesaufgaben</p><h2 className="text-xl font-black">Dein Fokus</h2></div>
              {user && !isAccountHydrating && <DailySpinWheel onClaimReward={() => window.setTimeout(() => setStats(getStats() as ReleaseStats), 20)} />}
            </div>
            <div className="space-y-3">
              <Card onClick={() => dailyDone ? startPractice('Daily – Wiederholung', selectLocalQuestions('all', 'all', 10)) : void startRanked('daily', 'all', 'all', 10)} className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${dailyDone ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  {dailyDone ? <CheckCircle2 /> : <CalendarDays />}
                </div>
                <div className="flex-1"><h3 className="font-black">Daily Challenge</h3><p className="text-xs text-slate-500">{dailyDone ? 'Heute abgeschlossen – erneut als Übung spielbar' : '10 servergeprüfte Fragen'}</p></div>
                <ArrowRight className="text-slate-300" />
              </Card>

              <Card onClick={() => startPractice('Fehlertraining', stats.wrongQuestions || [], 'review')} className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600"><RotateCcw /></div>
                <div className="flex-1"><h3 className="font-black">Fehlertraining</h3><p className="text-xs text-slate-500">{stats.wrongQuestions?.length || 0} gespeicherte Fragen</p></div>
                <ArrowRight className="text-slate-300" />
              </Card>
            </div>
          </section>

          {canClaimDaily && user && !isAccountHydrating && (
            <Card className="border-0 bg-gradient-to-r from-emerald-500 to-teal-600 p-5 text-white">
              <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-widest text-emerald-100">Tagesziel erreicht</p><h3 className="mt-1 text-lg font-black">+100 Punkte und +50 Münzen</h3></div><Button disabled={isBusy} onClick={claimDailyQuest} className="bg-white text-emerald-700">Einlösen</Button></div>
            </Card>
          )}
        </main>
      </div>
    );
  };

  const renderLearn = () => (
    <div className="min-h-full pb-28">
      {renderHeader('Lernen')}
      <main className="space-y-6 p-5">
        {notice && <div className="rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-900 dark:bg-blue-950/40 dark:text-blue-100">{notice}</div>}
        <section className="rounded-[2rem] bg-slate-100 p-5 dark:bg-slate-900">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prüfungs-Setup</p><h2 className="text-xl font-black">Gewertete Runde</h2></div><Medal className="text-blue-500" /></div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {DIFFICULTIES.map((difficulty) => (
              <button key={difficulty.id} type="button" onClick={() => setSelectedDifficulty(difficulty.id)} className={`rounded-2xl px-4 py-3 text-sm font-black ${selectedDifficulty === difficulty.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{difficulty.label}</button>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3">
            {[5, 10, 15, 20].map((count) => <button key={count} type="button" onClick={() => setQuestionCount(count)} className={`flex-1 rounded-xl py-2 text-sm font-black ${questionCount === count ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-white dark:bg-slate-800'}`}>{count}</button>)}
          </div>
          <Button fullWidth className="mt-5" disabled={isBusy || isAccountHydrating} onClick={() => void startRanked('standard', selectedCategory, selectedDifficulty, questionCount)}><Play size={18} /> Prüfung starten</Button>
          <p className="mt-3 text-xs font-medium text-slate-500">In gewerteten Runden kommen Fragen und Lösungen vom Backend. Lösungen erscheinen erst nach der Abgabe.</p>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fach auswählen</p><h2 className="text-xl font-black">Kategorien</h2></div><Button size="sm" variant="outline" onClick={() => setSelectedCategory('all')}>Alle</Button></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {CATEGORIES.map((category) => (
              <Card key={category.id} className={`p-5 ${selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''}`}>
                <button type="button" onClick={() => setSelectedCategory(category.id)} className="w-full text-left">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white ${category.color}`}><BookOpen size={20} /></div>
                  <h3 className="mt-4 font-black">{category.title}</h3><p className="mt-1 text-xs text-slate-500">{category.description}</p>
                </button>
                <div className="mt-4 grid grid-cols-2 gap-2"><Button size="sm" disabled={isAccountHydrating} onClick={() => void startRanked('standard', category.id, selectedDifficulty, questionCount)}>Quiz</Button><Button size="sm" variant="outline" onClick={() => openFlashcards(selectLocalQuestions(category.id, selectedDifficulty, Math.min(20, QUESTIONS.length)))}>Karten</Button></div>
              </Card>
            ))}
          </div>
        </section>

        <Card className="border-0 bg-gradient-to-br from-orange-500 to-rose-600 p-6 text-white">
          <div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-orange-100">60 Sekunden</p><h2 className="mt-2 text-2xl font-black">Blitz-Prüfung</h2><p className="mt-2 text-sm text-orange-100/80">Bis zu 30 servergelieferte Fragen, eine gemeinsame Uhr.</p></div><Zap size={44} className="text-white/30" /></div>
          <Button className="mt-5 bg-white text-orange-700" disabled={isAccountHydrating} onClick={() => void startRanked('blitz', 'all', 'all', 30)}>Blitz starten</Button>
        </Card>
      </main>
    </div>
  );

  const renderLibrary = () => {
    const decks = stats.customQuizzes || [];
    return (
      <div className="min-h-full pb-28">
        {renderHeader('Bibliothek')}
        <main className="space-y-6 p-5">
          <Card className="border-0 bg-gradient-to-br from-purple-600 to-fuchsia-600 p-6 text-white">
            <Sparkles size={32} className="text-purple-100" /><h2 className="mt-4 text-2xl font-black">Neues KI-Lernset</h2><p className="mt-2 text-sm text-purple-100/80">Aus einem Thema entstehen zehn Fragen und Karteikarten. Dieses Set ist Übungsinhalt und beeinflusst die Rangliste nicht.</p>
            <Button className="mt-5 bg-white text-purple-700" onClick={() => setScreen('ai-create')}>Lernset erstellen</Button>
          </Card>

          <section>
            <div className="mb-4"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gespeicherte Inhalte</p><h2 className="text-xl font-black">Meine Lernsets</h2></div>
            {decks.length === 0 ? (
              <div className="rounded-[2rem] border-2 border-dashed border-slate-200 p-10 text-center dark:border-slate-800"><FolderOpen className="mx-auto text-slate-300" size={42} /><h3 className="mt-4 font-black">Noch keine Lernsets</h3><p className="mt-2 text-sm text-slate-500">Erstelle dein erstes Set mit der KI.</p></div>
            ) : (
              <div className="space-y-3">
                {decks.map((deck) => (
                  <Card key={deck.id} className="p-5">
                    <div className="flex items-start justify-between"><div><h3 className="font-black">{deck.title}</h3><p className="mt-1 text-xs text-slate-500">{deck.questions.length} Karten · {new Date(deck.createdAt).toLocaleDateString('de-DE')}</p></div><Library className="text-purple-500" /></div>
                    <div className="mt-4 grid grid-cols-2 gap-2"><Button size="sm" onClick={() => startPractice(`${deck.title} – Übung`, deck.questions)}>Quiz</Button><Button size="sm" variant="outline" onClick={() => openFlashcards(deck.questions, deck.id)}>Karteikarten</Button></div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    );
  };

  const renderAiCreate = () => (
    <div className="min-h-full pb-10">
      {renderHeader('KI-Lernset erstellen', 'library')}
      <main className="mx-auto max-w-xl space-y-6 p-5">
        <Card className="p-6"><label htmlFor="ai-topic" className="text-xs font-black uppercase tracking-widest text-slate-500">Thema oder Lernziel</label><textarea id="ai-topic" value={aiTopic} onChange={(event) => setAiTopic(event.target.value)} maxLength={120} rows={5} placeholder="z. B. Grundlagen der Elektrotechnik: Spannung, Strom und Widerstand" className="mt-3 w-full resize-none rounded-2xl border-2 border-slate-200 bg-transparent p-4 font-medium outline-none focus:border-purple-500 dark:border-slate-700" /><div className="mt-2 text-right text-xs font-bold text-slate-400">{aiTopic.length}/120</div></Card>
        <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-900 dark:bg-amber-950/30 dark:text-amber-100"><strong>Übungsmodus:</strong> KI-Inhalte können Fehler enthalten und vergeben keine Ranglistenpunkte. Das Set wird in deiner Bibliothek gespeichert.</div>
        {notice && <div className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-900 dark:bg-rose-950/30 dark:text-rose-100">{notice}</div>}
        <Button fullWidth size="lg" disabled={isBusy || !aiTopic.trim()} onClick={createAiSet}>{isBusy ? 'Lernset wird erstellt …' : 'Lernset erstellen'} <Sparkles size={18} /></Button>
      </main>
    </div>
  );

  const renderProgress = () => (
    <div className="min-h-full pb-28">
      {renderHeader('Fortschritt')}
      <main className="p-4"><BrainVisualizer userStats={stats} onSelectCategory={(categoryId) => { setSelectedCategory(categoryId); setScreen('learn'); }} /></main>
    </div>
  );

  const renderProfile = () => {
    const level = getLevelInfo(stats.totalPoints);
    const accuracy = stats.totalQuestionsAnswered > 0 ? Math.round(stats.correctAnswers / stats.totalQuestionsAnswered * 100) : 0;
    return (
      <div className="min-h-full pb-28">
        {renderHeader('Profil')}
        <main className="space-y-6 p-5">
          <Card className="p-6 text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.75rem] bg-blue-600 text-3xl font-black text-white">{user?.photoURL ? <img src={user.photoURL} alt="Profil" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : stats.customName?.[0] || user?.displayName?.[0] || level.icon}</div><h2 className="mt-4 text-2xl font-black">{stats.customName || user?.displayName || 'Gastkonto'}</h2><p className={`mt-1 text-sm font-black ${level.color}`}>{level.name} · Level {level.level}</p><div className="mt-5"><ProgressBar progress={level.progress} /></div></Card>
          <div className="grid grid-cols-2 gap-3"><Card className="p-5 text-center"><Trophy className="mx-auto text-blue-500" /><p className="mt-2 text-2xl font-black">{stats.totalPoints}</p><p className="text-xs text-slate-500">Punkte</p></Card><Card className="p-5 text-center"><Target className="mx-auto text-emerald-500" /><p className="mt-2 text-2xl font-black">{accuracy}%</p><p className="text-xs text-slate-500">Genauigkeit</p></Card></div>
          <Button fullWidth variant="outline" disabled={isAccountHydrating} onClick={() => setScreen('leaderboard')}><Medal size={18} /> Rangliste öffnen</Button>
          <Button fullWidth variant="outline" disabled={isAccountHydrating} onClick={() => setScreen('shop')}><Coins size={18} /> Shop öffnen</Button>
          <label className="flex items-center justify-between rounded-2xl bg-white p-4 font-bold shadow-sm dark:bg-slate-900"><span>Dark Mode</span><input type="checkbox" checked={Boolean(stats.darkMode)} onChange={() => { const next = { ...stats, darkMode: !stats.darkMode }; persistStats(next); if (user) void syncUserStats(next); }} className="h-5 w-5 accent-blue-600" /></label>
          {user ? <Button fullWidth variant="danger" onClick={logout}><LogOut size={18} /> Abmelden</Button> : <Button fullWidth onClick={signInWithGoogle}><LogIn size={18} /> Mit Google anmelden</Button>}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">Impressum, Datenschutz, Datenexport und vollständige Kontolöschung bleiben vor dem öffentlichen Release verpflichtende Freigabepunkte.</div>
        </main>
      </div>
    );
  };

  const renderLeaderboard = () => (
    <div className="min-h-full pb-10">
      {renderHeader('Rangliste', 'profile')}
      <main className="space-y-3 p-5">
        <div className="rounded-2xl bg-blue-50 p-4 text-sm font-medium text-blue-900 dark:bg-blue-950/30 dark:text-blue-100">Nur Punkte aus servergeprüften Runden erscheinen hier. KI- und Bibliotheksübungen bleiben ungewertet.</div>
        {leaderboard.map((entry, index) => <Card key={entry.uid} className={`flex items-center gap-4 p-4 ${entry.uid === user?.uid ? 'ring-2 ring-blue-500' : ''}`}><div className={`flex h-10 w-10 items-center justify-center rounded-xl font-black ${index < 3 ? 'bg-amber-400 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{index + 1}</div><div className="flex-1"><h3 className="font-black">{entry.displayName}</h3><p className="text-xs text-slate-500">Servergeprüfte Punkte</p></div><span className="text-lg font-black text-blue-600">{entry.totalPoints}</span></Card>)}
        {leaderboard.length === 0 && <p className="py-16 text-center text-sm text-slate-500">Noch keine Ranglistendaten geladen.</p>}
      </main>
    </div>
  );

  const renderShop = () => (
    <div className="min-h-full pb-10">
      {renderHeader('Shop', 'profile')}
      <main className="space-y-4 p-5">
        <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">Preise und Bestände werden ausschließlich im Backend geprüft. Power-ups werden erst in einem späteren sicheren Übungsmodus eingesetzt.</div>
        {notice && <div className="rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-900 dark:bg-blue-950/30 dark:text-blue-100">{notice}</div>}
        {SHOP_ITEMS.map((item) => <Card key={item.id} className="flex items-center gap-4 p-5"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600"><Coins /></div><div className="flex-1"><h3 className="font-black">{item.title}</h3><p className="text-xs text-slate-500">{item.description}</p></div><Button size="sm" disabled={isBusy || isAccountHydrating || (stats.coins || 0) < item.cost} onClick={() => void buyItem(item.id)}>{item.cost}</Button></Card>)}
      </main>
    </div>
  );

  const renderQuiz = () => {
    if (!activeQuiz) return null;
    const question = activeQuiz.questions[questionIndex];
    if (!question) return null;
    const progress = (questionIndex + 1) / activeQuiz.questions.length * 100;
    const practiceCorrect = !activeQuiz.ranked && question.correctAnswer !== undefined;
    const autoAdvance = activeQuiz.mode === 'blitz' || Boolean(activeQuiz.globalSeconds);

    return (
      <div className="flex min-h-full flex-col">
        <header className="border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between"><button type="button" aria-label="Quiz abbrechen" disabled={isBusy} onClick={cancelActiveQuiz} className="rounded-xl p-2 text-slate-500 disabled:cursor-not-allowed disabled:opacity-40"><X /></button><div className="text-center"><p className="text-[10px] font-black uppercase tracking-widest text-blue-600">{activeQuiz.ranked ? 'Servergeprüfte Prüfung' : 'Übungsmodus'}</p><h1 className="font-black">{activeQuiz.title}</h1></div><div className="w-10 text-right font-black">{activeQuiz.globalSeconds ? `${globalSeconds}s` : activeQuiz.perQuestionSeconds ? `${questionSeconds}s` : ''}</div></div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} /></div>
        </header>
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col p-5">
          <div className="mb-4 flex items-center justify-between"><span className="text-xs font-black uppercase tracking-widest text-slate-400">Frage {questionIndex + 1} von {activeQuiz.questions.length}</span>{activeQuiz.ranked && <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase text-emerald-700"><Check size={12} /> Lösung verborgen</span>}</div>
          <Card className="mb-6 p-7 text-center"><h2 className="text-2xl font-black leading-tight">{question.question}</h2>{question.imageUrl && <img src={question.imageUrl} alt="Illustration zur Frage" className="mx-auto mt-5 max-h-48 rounded-2xl object-contain" referrerPolicy="no-referrer" />}</Card>
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const selected = selectedAnswer === index;
              const correct = practiceCorrect && selectedAnswer !== null && index === question.correctAnswer;
              const wrong = practiceCorrect && selected && index !== question.correctAnswer;
              return <button key={index} type="button" disabled={selectedAnswer !== null || isBusy} onClick={() => chooseAnswer(index)} className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left font-bold transition disabled:cursor-not-allowed ${correct ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200' : wrong ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-200' : selected ? 'border-blue-600 bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-200' : 'border-slate-200 bg-white hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900'}`}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black dark:bg-slate-800">{String.fromCharCode(65 + index)}</span><span>{option}</span></button>;
            })}
          </div>
          {selectedAnswer !== null && !activeQuiz.ranked && question.correctAnswer !== undefined && (
            <div className={`mt-5 rounded-2xl p-5 ${selectedAnswer === question.correctAnswer ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100' : 'bg-rose-50 text-rose-900 dark:bg-rose-950/30 dark:text-rose-100'}`}><p className="font-black">{selectedAnswer === question.correctAnswer ? 'Richtig' : 'Noch nicht richtig'}</p><p className="mt-2 text-sm font-medium">{question.explanation}</p></div>
          )}
          {selectedAnswer !== null && !autoAdvance && (
            <Button fullWidth size="lg" className="mt-auto" disabled={isBusy} onClick={advanceQuestion}>{questionIndex + 1 === activeQuiz.questions.length ? 'Prüfung abgeben' : 'Nächste Frage'} <ArrowRight size={18} /></Button>
          )}
        </main>
      </div>
    );
  };

  const renderResult = () => {
    if (!result || !activeQuiz) return null;
    const accuracy = result.total > 0 ? Math.round(result.correct / result.total * 100) : 0;
    const resultLabel = result.error
      ? result.ranked
        ? 'Gewertete Prüfung fehlgeschlagen'
        : 'Übung fehlgeschlagen'
      : result.ranked
        ? 'Serverbestätigtes Ergebnis'
        : 'Übungsergebnis';

    return (
      <div className="min-h-full pb-10">
        {renderHeader('Auswertung')}
        <main className="mx-auto max-w-2xl space-y-6 p-5">
          <Card className="p-7 text-center"><div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] ${result.error ? 'bg-rose-100 text-rose-600' : accuracy >= 80 ? 'bg-emerald-100 text-emerald-600' : accuracy >= 50 ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>{result.error ? <AlertCircle size={44} /> : accuracy >= 80 ? <Trophy size={44} /> : <Target size={44} />}</div><p className="mt-5 text-xs font-black uppercase tracking-widest text-slate-400">{resultLabel}</p>{result.error ? <h1 className="mt-2 text-3xl font-black">Nicht gewertet</h1> : <><h1 className="mt-2 text-4xl font-black">{result.correct} / {result.total}</h1><p className="mt-2 font-bold text-slate-500">{accuracy}% richtig</p></>}{result.ranked && !result.error && <div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/30"><p className="text-2xl font-black text-blue-600">+{result.pointsEarned}</p><p className="text-xs text-slate-500">Punkte</p></div><div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/30"><p className="text-2xl font-black text-amber-600">+{result.coinsEarned}</p><p className="text-xs text-slate-500">Münzen</p></div></div>}{result.error && <div className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-900 dark:bg-rose-950/30 dark:text-rose-100">Die Runde konnte nicht gewertet werden: {result.error}</div>}</Card>

          {!result.error && activeQuiz.questions.map((question, index) => {
            const reveal = result.reveals[question.id];
            const correctAnswer = reveal?.correctAnswer ?? question.correctAnswer;
            const chosen = result.answers[index];
            if (correctAnswer === undefined) return null;
            const correct = chosen === correctAnswer;
            return <Card key={question.id} className="p-5"><div className="flex items-start gap-3"><div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${correct ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{correct ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}</div><div><h3 className="font-black">{question.question}</h3><p className="mt-2 text-sm text-slate-500">Deine Antwort: {chosen >= 0 ? question.options[chosen] : 'Keine Antwort'}</p><p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">Richtig: {question.options[correctAnswer]}</p><p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">{reveal?.explanation || question.explanation}</p></div></div></Card>;
          })}

          <div className="grid grid-cols-2 gap-3"><Button variant="outline" onClick={() => { quizGenerationRef.current += 1; setActiveQuiz(null); setResult(null); setScreen('today'); }}>Heute</Button><Button onClick={() => activeQuiz.ranked ? void startRanked(activeQuiz.mode === 'practice' || activeQuiz.mode === 'review' ? 'standard' : activeQuiz.mode, activeQuiz.category as CategoryId | 'all', selectedDifficulty, activeQuiz.questions.length) : startPractice(activeQuiz.title, activeQuiz.questions as Question[])}>Nochmal</Button></div>
        </main>
      </div>
    );
  };

  const renderScreen = () => {
    if (screen === 'today') return renderToday();
    if (screen === 'learn') return renderLearn();
    if (screen === 'library') return renderLibrary();
    if (screen === 'progress') return renderProgress();
    if (screen === 'profile') return renderProfile();
    if (screen === 'leaderboard') return renderLeaderboard();
    if (screen === 'shop') return renderShop();
    if (screen === 'ai-create') return renderAiCreate();
    if (screen === 'quiz') return renderQuiz();
    if (screen === 'result') return renderResult();
    if (screen === 'flashcards') return <Flashcards questions={flashcardQuestions} onClose={() => setScreen('library')} onQuestionsUpdated={updateFlashcards} />;
    return renderToday();
  };

  const showNavigation = !['quiz', 'result', 'flashcards', 'ai-create', 'leaderboard', 'shop'].includes(screen);

  return (
    <div className={`min-h-[100dvh] bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white ${stats.darkMode ? 'dark' : ''}`}>
      <div className="mx-auto min-h-[100dvh] max-w-5xl bg-white/60 shadow-2xl dark:bg-slate-950/80">
        {isAccountHydrating && <div className="fixed inset-0 z-[105] flex items-center justify-center bg-slate-950/70 p-5 backdrop-blur-sm"><div role="status" aria-live="polite" className="max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-slate-900"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" /><p className="mt-4 font-black">Kontofortschritt wird sicher geladen …</p><p className="mt-2 text-xs font-medium text-slate-500">Punkte und Münzen werden erst nach der serverseitigen Prüfung angezeigt.</p></div></div>}
        {isBusy && !isAccountHydrating && screen !== 'quiz' && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm"><div className="rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-slate-900"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" /><p className="mt-4 font-black">Wird sicher verarbeitet …</p></div></div>}
        {renderScreen()}
        {showNavigation && (
          <nav aria-label="Hauptnavigation" className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 items-center justify-around rounded-[2rem] border border-white/60 bg-white/90 px-2 py-3 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = screen === item.id;
              return <button key={item.id} type="button" onClick={() => setScreen(item.id)} className={`flex min-w-14 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[9px] font-black uppercase tracking-wider ${active ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300' : 'text-slate-400'}`}><Icon size={20} fill={active ? 'currentColor' : 'none'} /><span>{item.label}</span></button>;
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
