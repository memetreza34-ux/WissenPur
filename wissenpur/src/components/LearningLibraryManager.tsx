import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Download,
  FileUp,
  GraduationCap,
  Library,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { Flashcards } from '../pages/Flashcards';
import { syncUserStats } from '../services/firebaseService';
import {
  estimateLearningLibraryBytes,
  MAX_LIBRARY_DECKS,
  MAX_LIBRARY_QUESTIONS,
  MAX_LIBRARY_SERIALIZED_BYTES,
  serializeLearningSet,
} from '../services/learningSetImport';
import { getStats, saveStats } from '../storage';
import type { CustomQuiz, Question, UserStats } from '../types';
import { Button, Card, ProgressBar } from './UI';
import { LearningSetImportPanel } from './LearningSetImportPanel';

type LibraryFilter = 'all' | 'due';

interface FlashcardSession {
  deckId: string;
  questions: Question[];
}

interface MockExamState {
  deckId: string;
  title: string;
  questions: Question[];
  answers: number[];
  currentIndex: number;
  selectedAnswer: number | null;
  completed: boolean;
}

const questionIsDue = (question: Question, now = Date.now()): boolean =>
  !question.srsData || question.srsData.nextReviewDate <= now;

const dueQuestions = (deck: CustomQuiz, now = Date.now()): Question[] =>
  deck.questions.filter((question) => questionIsDue(question, now));

const shuffle = <T,>(items: readonly T[]): T[] => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

const downloadText = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const safeFilename = (title: string): string =>
  title
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'lernset';

const mergeQuestionUpdates = (
  deck: CustomQuiz,
  updatedQuestions: Question[],
): CustomQuiz => {
  const updates = new Map(updatedQuestions.map((question) => [question.id, question]));
  return {
    ...deck,
    questions: deck.questions.map((question) => updates.get(question.id) || question),
  };
};

const syncStatsBestEffort = (stats: UserStats) => {
  if (!auth.currentUser) return;
  void syncUserStats(stats).catch((error: unknown) => {
    console.warn('Bibliotheksdaten wurden lokal gespeichert, konnten aber nicht mit der Cloud synchronisiert werden.', error);
  });
};

const validateLibraryLimits = (decks: readonly CustomQuiz[]) => {
  if (decks.length > MAX_LIBRARY_DECKS) {
    throw new Error(`Die Bibliothek kann höchstens ${MAX_LIBRARY_DECKS} Lernsets enthalten.`);
  }
  const totalQuestions = decks.reduce((total, deck) => total + deck.questions.length, 0);
  if (totalQuestions > MAX_LIBRARY_QUESTIONS) {
    throw new Error(`Die Bibliothek kann höchstens ${MAX_LIBRARY_QUESTIONS} Fragen enthalten.`);
  }
  if (estimateLearningLibraryBytes(decks) > MAX_LIBRARY_SERIALIZED_BYTES) {
    throw new Error('Die Bibliothek ist zu groß für eine zuverlässige Cloud-Synchronisierung.');
  }
};

export const LearningLibraryManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(auth.currentUser));
  const [decks, setDecks] = useState<CustomQuiz[]>(() => getStats().customQuizzes || []);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<LibraryFilter>('all');
  const [message, setMessage] = useState<string | null>(null);
  const [flashcardSession, setFlashcardSession] = useState<FlashcardSession | null>(null);
  const [exam, setExam] = useState<MockExamState | null>(null);

  useEffect(() => onAuthStateChanged(auth, (user) => {
    setIsAuthenticated(Boolean(user));
    setDecks(getStats().customQuizzes || []);
  }), []);

  useEffect(() => {
    const refresh = () => setDecks(getStats().customQuizzes || []);
    window.addEventListener('wissenpur:stats-updated', refresh);
    return () => window.removeEventListener('wissenpur:stats-updated', refresh);
  }, []);

  const persistDecks = (nextDecks: CustomQuiz[], remountProduct = false) => {
    validateLibraryLimits(nextDecks);
    const current = getStats();
    const next: UserStats = { ...current, customQuizzes: nextDecks };
    saveStats(next);
    setDecks(nextDecks);
    window.dispatchEvent(new CustomEvent<UserStats>('wissenpur:stats-updated', { detail: next }));
    syncStatsBestEffort(next);
    if (remountProduct) window.dispatchEvent(new Event('wissenpur:library-updated'));
  };

  const totalDue = useMemo(
    () => decks.reduce((total, deck) => total + dueQuestions(deck).length, 0),
    [decks],
  );

  const visibleDecks = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('de-DE');
    return [...decks]
      .filter((deck) => !query || deck.title.toLocaleLowerCase('de-DE').includes(query))
      .filter((deck) => filter === 'all' || dueQuestions(deck).length > 0)
      .sort((left, right) => right.createdAt - left.createdAt);
  }, [decks, filter, search]);

  const importDeck = async (deck: CustomQuiz) => {
    const existingTitles = new Set(decks.map((entry) => entry.title.trim().toLocaleLowerCase('de-DE')));
    const normalizedTitle = existingTitles.has(deck.title.trim().toLocaleLowerCase('de-DE'))
      ? `${deck.title} (Import)`
      : deck.title;
    persistDecks([...decks, { ...deck, title: normalizedTitle }], true);
  };

  const removeDeck = async (deck: CustomQuiz) => {
    const confirmed = window.confirm(`Lernset „${deck.title}“ dauerhaft aus deiner Bibliothek löschen?`);
    if (!confirmed) return;
    try {
      persistDecks(decks.filter((entry) => entry.id !== deck.id), true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Das Lernset konnte nicht gelöscht werden.');
    }
  };

  const exportDeck = (deck: CustomQuiz) => {
    downloadText(serializeLearningSet(deck), `${safeFilename(deck.title)}.wissenpur.json`);
    setMessage(`„${deck.title}“ wurde als JSON exportiert.`);
  };

  const openDueCards = (deck: CustomQuiz) => {
    const questions = dueQuestions(deck);
    if (questions.length === 0) {
      setMessage('In diesem Lernset ist aktuell keine Karte fällig.');
      return;
    }
    setFlashcardSession({ deckId: deck.id, questions });
  };

  const updateFlashcards = (updatedQuestions: Question[]) => {
    if (!flashcardSession) return;
    const nextDecks = decks.map((deck) =>
      deck.id === flashcardSession.deckId
        ? mergeQuestionUpdates(deck, updatedQuestions)
        : deck,
    );
    persistDecks(nextDecks);
    setFlashcardSession((current) => current ? { ...current, questions: updatedQuestions } : null);
  };

  const closeFlashcards = () => {
    setFlashcardSession(null);
    window.dispatchEvent(new Event('wissenpur:library-updated'));
  };

  const startMockExam = (deck: CustomQuiz) => {
    if (deck.questions.length === 0) {
      setMessage('Dieses Lernset enthält keine Prüfungsfragen.');
      return;
    }
    const questions = shuffle(deck.questions).slice(0, Math.min(20, deck.questions.length));
    setExam({
      deckId: deck.id,
      title: `${deck.title} – Probeprüfung`,
      questions,
      answers: new Array(questions.length).fill(-1),
      currentIndex: 0,
      selectedAnswer: null,
      completed: false,
    });
  };

  const chooseExamAnswer = (answer: number) => {
    setExam((current) => {
      if (!current || current.completed || current.selectedAnswer !== null) return current;
      const answers = [...current.answers];
      answers[current.currentIndex] = answer;
      return { ...current, answers, selectedAnswer: answer };
    });
  };

  const advanceExam = () => {
    if (!exam || exam.selectedAnswer === null) return;
    if (exam.currentIndex + 1 < exam.questions.length) {
      setExam({ ...exam, currentIndex: exam.currentIndex + 1, selectedAnswer: null });
      return;
    }

    const incorrectQuestions = exam.questions.filter((question, index) =>
      exam.answers[index] !== question.correctAnswer,
    );
    const currentStats = getStats();
    const wrongById = new Map((currentStats.wrongQuestions || []).map((question) => [question.id, question]));
    for (const question of incorrectQuestions) wrongById.set(question.id, question);
    const nextStats: UserStats = {
      ...currentStats,
      wrongQuestions: [...wrongById.values()].slice(0, 300),
    };
    saveStats(nextStats);
    window.dispatchEvent(new CustomEvent<UserStats>('wissenpur:stats-updated', { detail: nextStats }));
    syncStatsBestEffort(nextStats);
    setExam({ ...exam, completed: true });
  };

  const closeExam = () => {
    setExam(null);
    window.dispatchEvent(new Event('wissenpur:library-updated'));
  };

  if (flashcardSession) {
    return (
      <div className="fixed inset-0 z-[150] overflow-hidden bg-slate-50 dark:bg-slate-950">
        <Flashcards
          questions={flashcardSession.questions}
          onClose={closeFlashcards}
          onQuestionsUpdated={updateFlashcards}
        />
      </div>
    );
  }

  if (exam) {
    const question = exam.questions[exam.currentIndex];
    const correctCount = exam.completed
      ? exam.questions.reduce((total, entry, index) => total + (exam.answers[index] === entry.correctAnswer ? 1 : 0), 0)
      : 0;
    const accuracy = exam.questions.length > 0 ? Math.round(correctCount / exam.questions.length * 100) : 0;

    return (
      <div className="fixed inset-0 z-[150] overflow-y-auto bg-slate-50 dark:bg-slate-950">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
            <button type="button" aria-label="Probeprüfung schließen" onClick={closeExam} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X /></button>
            <div className="text-center"><p className="text-[10px] font-black uppercase tracking-widest text-purple-600">Ungewertete Probeprüfung</p><h1 className="font-black">{exam.title}</h1></div>
            <div className="w-10" />
          </div>
        </header>

        <main className="mx-auto max-w-2xl space-y-5 p-5">
          {!exam.completed && question && (
            <>
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                <span>Frage {exam.currentIndex + 1} von {exam.questions.length}</span>
                <span>Lösungen am Ende</span>
              </div>
              <ProgressBar value={(exam.currentIndex + 1) / exam.questions.length * 100} />
              <Card className="p-7 text-center"><h2 className="text-2xl font-black leading-tight">{question.question}</h2></Card>
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={`${question.id}-${index}`}
                    type="button"
                    disabled={exam.selectedAnswer !== null}
                    onClick={() => chooseExamAnswer(index)}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left font-bold transition disabled:cursor-not-allowed ${exam.selectedAnswer === index ? 'border-purple-600 bg-purple-50 text-purple-900 dark:bg-purple-950/30 dark:text-purple-100' : 'border-slate-200 bg-white hover:border-purple-400 dark:border-slate-800 dark:bg-slate-900'}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black dark:bg-slate-800">{String.fromCharCode(65 + index)}</span>
                    <span>{option}</span>
                  </button>
                ))}
              </div>
              <Button fullWidth size="lg" disabled={exam.selectedAnswer === null} onClick={advanceExam}>
                {exam.currentIndex + 1 === exam.questions.length ? 'Probeprüfung auswerten' : 'Nächste Frage'}
                <ArrowRight size={18} />
              </Button>
            </>
          )}

          {exam.completed && (
            <>
              <Card className="p-7 text-center">
                <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] ${accuracy >= 80 ? 'bg-emerald-100 text-emerald-600' : accuracy >= 50 ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                  {accuracy >= 80 ? <CheckCircle2 size={44} /> : <GraduationCap size={44} />}
                </div>
                <p className="mt-5 text-xs font-black uppercase tracking-widest text-slate-400">Probeprüfung abgeschlossen</p>
                <h2 className="mt-2 text-4xl font-black">{correctCount} / {exam.questions.length}</h2>
                <p className="mt-2 font-bold text-slate-500">{accuracy}% richtig · keine Ranglistenpunkte</p>
              </Card>

              {exam.questions.map((entry, index) => {
                const chosen = exam.answers[index];
                const correct = chosen === entry.correctAnswer;
                return (
                  <Card key={entry.id} className="p-5">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${correct ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {correct ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      </div>
                      <div>
                        <h3 className="font-black">{entry.question}</h3>
                        <p className="mt-2 text-sm text-slate-500">Deine Antwort: {chosen >= 0 ? entry.options[chosen] : 'Keine Antwort'}</p>
                        <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">Richtig: {entry.options[entry.correctAnswer]}</p>
                        <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">{entry.explanation}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={closeExam}>Schließen</Button>
                <Button onClick={() => {
                  const deck = decks.find((entry) => entry.id === exam.deckId);
                  if (deck) startMockExam(deck);
                }}><RotateCcw size={17} /> Nochmal</Button>
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMessage(null);
          setDecks(getStats().customQuizzes || []);
          setIsOpen(true);
        }}
        className="fixed bottom-44 left-4 z-[78] flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-xs font-black text-slate-700 shadow-xl backdrop-blur-xl hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100"
        aria-label="Erweiterte Lernset-Bibliothek öffnen"
      >
        <Library size={18} className="text-purple-600" />
        Lernsets
        {totalDue > 0 && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] text-white">{totalDue}</span>}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[130] overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
              <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">Bibliothek Plus</p><h1 className="text-2xl font-black">Meine Lernsets</h1></div>
              <button type="button" aria-label="Bibliothek schließen" onClick={() => setIsOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X /></button>
            </div>
          </header>

          <main className="mx-auto max-w-4xl space-y-5 p-5 pb-24">
            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="p-4"><p className="text-2xl font-black">{decks.length}</p><p className="text-xs font-bold text-slate-500">Lernsets</p></Card>
              <Card className="p-4"><p className="text-2xl font-black">{decks.reduce((total, deck) => total + deck.questions.length, 0)}</p><p className="text-xs font-bold text-slate-500">Fragen und Karten</p></Card>
              <Card className="p-4"><p className="text-2xl font-black text-rose-600">{totalDue}</p><p className="text-xs font-bold text-slate-500">Jetzt fällig</p></Card>
            </div>

            {message && <div role="status" className="rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-900 dark:bg-blue-950/30 dark:text-blue-100">{message}</div>}

            {!isAuthenticated && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                Ohne Anmeldung bleiben importierte Lernsets nur in diesem Browser. Nach der Anmeldung werden sie mit deinem Profil synchronisiert.
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Lernsets durchsuchen"
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white py-3 pl-11 pr-4 font-bold outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
              <div className="grid grid-cols-2 gap-2 sm:w-56">
                <button type="button" onClick={() => setFilter('all')} className={`rounded-2xl px-4 py-3 text-sm font-black ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-900'}`}>Alle</button>
                <button type="button" onClick={() => setFilter('due')} className={`rounded-2xl px-4 py-3 text-sm font-black ${filter === 'due' ? 'bg-rose-600 text-white' : 'bg-white dark:bg-slate-900'}`}>Fällig</button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setIsImportOpen(true)} className="rounded-[1.5rem] border-2 border-dashed border-purple-200 bg-purple-50 p-5 text-left hover:border-purple-400 dark:border-purple-900 dark:bg-purple-950/20">
                <FileUp className="text-purple-600" />
                <p className="mt-3 font-black">JSON oder CSV importieren</p>
                <p className="mt-1 text-xs text-slate-500">Mit Vorschau und Validierung</p>
              </button>
              <div className="rounded-[1.5rem] bg-gradient-to-br from-purple-600 to-indigo-700 p-5 text-white">
                <GraduationCap />
                <p className="mt-3 font-black">Probeprüfung</p>
                <p className="mt-1 text-xs text-purple-100">Ohne Sofortlösungen und ohne Ranglistenpunkte.</p>
              </div>
            </div>

            {visibleDecks.length === 0 ? (
              <div className="rounded-[2rem] border-2 border-dashed border-slate-200 p-10 text-center dark:border-slate-800">
                <BookOpenCheck className="mx-auto text-slate-300" size={44} />
                <h2 className="mt-4 font-black">Keine passenden Lernsets</h2>
                <p className="mt-2 text-sm text-slate-500">Importiere eine Datei oder ändere Suche und Filter.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleDecks.map((deck) => {
                  const due = dueQuestions(deck);
                  return (
                    <Card key={deck.id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div><h2 className="text-lg font-black">{deck.title}</h2><p className="mt-1 text-xs text-slate-500">{deck.questions.length} Fragen · {due.length} fällig · {new Date(deck.createdAt).toLocaleDateString('de-DE')}</p></div>
                        <div className="flex gap-1">
                          <button type="button" aria-label={`${deck.title} exportieren`} onClick={() => exportDeck(deck)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"><Download size={18} /></button>
                          <button type="button" aria-label={`${deck.title} löschen`} onClick={() => void removeDeck(deck)} className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"><Trash2 size={18} /></button>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        <Button size="sm" disabled={due.length === 0} onClick={() => openDueCards(deck)}><RotateCcw size={16} /> {due.length > 0 ? `${due.length} wiederholen` : 'Nichts fällig'}</Button>
                        <Button size="sm" variant="outline" onClick={() => setFlashcardSession({ deckId: deck.id, questions: deck.questions })}>Alle Karten</Button>
                        <Button size="sm" variant="outline" onClick={() => startMockExam(deck)}><GraduationCap size={16} /> Probeprüfung</Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      )}

      <LearningSetImportPanel
        isOpen={isImportOpen}
        currentDeckCount={decks.length}
        onClose={() => setIsImportOpen(false)}
        onImport={importDeck}
      />
    </>
  );
};
