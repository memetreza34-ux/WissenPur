import React, { useState, useEffect, Component, ErrorInfo, ReactNode, useRef } from 'react';
import { soundManager } from './lib/sound';
import { 
  Trophy, 
  Flame, 
  Play, 
  LayoutGrid, 
  Calendar, 
  User, 
  ChevronLeft, 
  X, 
  Heart, 
  CheckCircle2, 
  XCircle, 
  Zap,
  Star,
  ShieldCheck,
  BarChart3,
  Crown,
  History,
  Globe,
  Map,
  Beaker,
  Cpu,
  Languages,
  ArrowRight,
  LogOut,
  LogIn,
  Medal,
  TrendingUp,
  AlertCircle,
  Clock,
  Target,
  RotateCcw,
  Sparkles,
  Lock,
  Check,
  Landmark,
  Dog,
  Rocket,
  Leaf,
  BarChart,
  Users,
  Swords,
  Copy,
  UserPlus,
  PlayCircle,
  Hash,
  Radar,
  Shield,
  Crosshair,
  Activity,
  TrendingDown,
  Volume2,
  VolumeX,
  Camera,
  Settings,
  Coins,
  Plus,
  Minus,
  Info,
  Flag,
  PenTool,
  FolderOpen,
  Edit2,
  Trash2,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES, QUESTIONS } from './data';
import { CategoryId, Question, UserStats, LeaderboardEntry, ACHIEVEMENTS, getLevelInfo, WeeklyGoal, Difficulty, Lobby, MultiplayerPlayer, OnlineProfile, League } from './types';
import { getStats, updateStatsAfterRound, saveStats, saveWrongQuestion, removeWrongQuestion, saveCustomPhoto, saveUserDetails, claimDailyReward, buyPowerUp, usePowerUp, buyAvatar, buyTitle, equipAvatar, equipTitle } from './storage';
import { getLeagueForRating, getNextLeague } from './lib/ranking';
import { Button, Card, ProgressBar, Badge } from './components/UI';
import { auth, signInWithGoogle, logout } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { syncUserStats, getLeaderboard, testConnection } from './services/firebaseService';
import { generateQuestions } from './services/geminiService';

type Screen = 'home' | 'categories' | 'difficultySelection' | 'customTopicSelection' | 'quiz' | 'daily' | 'result' | 'profile' | 'leaderboard' | 'review' | 'blitzIntro' | 'blitzQuiz' | 'duelSelection' | 'createLobby' | 'joinLobby' | 'lobbyRoom' | 'matchmaking' | 'rankings' | 'settings' | 'howToPlay' | 'projects' | 'createQuizMenu' | 'createManualQuiz' | 'shop' | 'impressum' | 'privacy' | 'terms';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: string | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, errorInfo: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen p-6 text-center bg-slate-50 dark:bg-slate-950">
          <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-3xl flex items-center justify-center mb-6">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Hoppla! Etwas ist schiefgelaufen.</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">Wir haben ein technisches Problem festgestellt. Bitte versuche es später erneut.</p>
          <Button onClick={() => window.location.reload()} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200">App neu laden</Button>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-8 p-4 bg-slate-200 dark:bg-slate-800 rounded-xl text-[10px] text-left overflow-auto max-w-full text-slate-800 dark:text-slate-200">
              {this.state.errorInfo}
            </pre>
          )}
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const ICON_MAP: Record<string, any> = {
  Globe,
  History,
  Map,
  Beaker,
  Cpu,
  Languages,
  Landmark,
  Dog,
  Rocket,
  Trophy,
  Sparkles,
  Volume2,
  Camera,
  Activity,
  Leaf,
  BarChart,
  Crown,
  Flag
};

const Confetti = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: "50%", 
            y: "50%", 
            scale: 0,
            rotate: 0
          }}
          animate={{ 
            x: `${Math.random() * 100}%`, 
            y: `${Math.random() * 100}%`, 
            scale: [0, 1, 0.5],
            rotate: Math.random() * 360
          }}
          transition={{ 
            duration: 1.5, 
            ease: "easeOut",
            times: [0, 0.2, 1]
          }}
          className="absolute w-2 h-2 rounded-sm"
          style={{ 
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][i % 4] 
          }}
        />
      ))}
    </div>
  );
};

const CountUp = ({ end, duration = 1, start }: { end: number; duration?: number; start?: number }) => {
  const [count, setCount] = useState(start !== undefined ? start : end);
  const prevEndRef = React.useRef(start !== undefined ? start : end);

  useEffect(() => {
    if (prevEndRef.current === end) return;

    let startTime: number;
    let animationFrame: number;
    const startValue = prevEndRef.current;
    const diff = end - startValue;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Ease out quad function
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);
      
      const nextCount = Math.floor(startValue + easedProgress * diff);
      setCount(nextCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        prevEndRef.current = end;
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <>{count}</>;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20 }
  }
};

const screenVariants = {
  initial: { opacity: 0, scale: 0.97, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] // Modern exponential ease-out
    }
  },
  exit: { 
    opacity: 0, 
    scale: 1.03, 
    y: -20,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  },
};

const WeeklyGoalCard = ({ goal }: { goal: WeeklyGoal }) => {
  const progress = Math.min(100, (goal.current / goal.target) * 100);
  const isCompleted = goal.current >= goal.target;

  return (
    <motion.div 
      variants={itemVariants}
      className={`relative overflow-hidden rounded-[2.5rem] p-6 border transition-all duration-500 ${
        isCompleted 
          ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-100 dark:border-emerald-900/30 shadow-lg shadow-emerald-100/50 dark:shadow-none' 
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-premium dark:shadow-none'
      }`}
    >
      {isCompleted && (
        <motion.div 
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute -right-4 -top-4 w-24 h-24 text-emerald-500/10 dark:text-emerald-400/10"
        >
          <CheckCircle2 size={96} fill="currentColor" />
        </motion.div>
      )}

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
              Wochenziel
            </span>
            <h3 className="text-lg font-display font-black text-slate-900 dark:text-white tracking-tight">
              {goal.type === 'rounds' && `${goal.target} Quizrunden spielen`}
              {goal.type === 'correctAnswers' && `${goal.target} richtige Antworten`}
              {goal.type === 'dailyChallenges' && `${goal.target} Daily Challenges`}
            </h3>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
            {isCompleted ? <CheckCircle2 size={20} /> : <Target size={20} />}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
            <span className={isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}>
              {isCompleted ? 'Ziel erreicht!' : `${goal.current} von ${goal.target}`}
            </span>
            <span className={isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
            />
          </div>
          {!isCompleted && (
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Noch {goal.target - goal.current} {goal.type === 'rounds' ? 'Runden' : goal.type === 'correctAnswers' ? 'Antworten' : 'Challenges'} bis zum Ziel
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [showIntro, setShowIntro] = useState(true);
  const [stats, setStats] = useState<UserStats>(getStats());
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (showIntro) {
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  const [showDailyReminder, setShowDailyReminder] = useState(false);
  const [showDailyQuestReward, setShowDailyQuestReward] = useState(false);

  useEffect(() => {
    soundManager.playTransition();
    // Reset multiplayer state when leaving relevant screens
    if (screen === 'home' || screen === 'duelSelection') {
      setLobby(null);
      setMatchFound(false);
      setIsSearching(false);
    }
  }, [screen]);

  useEffect(() => {
    if (stats.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [stats.darkMode]);

  useEffect(() => {
    if ((stats.dailyQuestionsAnswered || 0) >= 10 && !stats.dailyRewardClaimed) {
      setShowDailyQuestReward(true);
    } else {
      setShowDailyQuestReward(false);
    }
  }, [stats.dailyQuestionsAnswered, stats.dailyRewardClaimed]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const hasSeen = sessionStorage.getItem('hasSeenDailyReminder');
    if (stats.lastDailyRewardDate !== today && !hasSeen) {
      const timer = setTimeout(() => {
        setShowDailyReminder(true);
        sessionStorage.setItem('hasSeenDailyReminder', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stats.lastDailyRewardDate]);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState<'global' | 'friends'>('global');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all' | 'daily' | 'review' | 'blitz' | 'custom'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [customTopic, setCustomTopic] = useState('');
  const [customQuestionCount, setCustomQuestionCount] = useState(10);
  const [customTimeLimit, setCustomTimeLimit] = useState(15);
  
  // Manual Quiz State
  const [manualQuizTitle, setManualQuizTitle] = useState('');
  const [manualQuizQuestions, setManualQuizQuestions] = useState<Question[]>([]);
  const [manualCurrentQ, setManualCurrentQ] = useState('');
  const [manualOptions, setManualOptions] = useState(['', '', '', '']);
  const [manualCorrect, setManualCorrect] = useState(0);
  const [manualEditingIndex, setManualEditingIndex] = useState<number | null>(null);

  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [isEndless, setIsEndless] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15);
  const [maxTime, setMaxTime] = useState(15);
  const [blitzTimeLeft, setBlitzTimeLeft] = useState(60);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [lastPointsEarned, setLastPointsEarned] = useState<number | null>(null);
  const [isSpeedBonus, setIsSpeedBonus] = useState(false);
  const [nextTimer, setNextTimer] = useState(8);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [isLevelUp, setIsLevelUp] = useState(false);
  const [seenQuestionIds, setSeenQuestionIds] = useState<Set<string>>(new Set());
  const [matchFound, setMatchFound] = useState(false);

  // Power-Up States
  const [activeFiftyFifty, setActiveFiftyFifty] = useState<number[]>([]);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [isTimeFrozen, setIsTimeFrozen] = useState(false);
  const [hasSecondChance, setHasSecondChance] = useState(false);

  // Multiplayer State
  const [lobbyCode, setLobbyCode] = useState('');
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [joinError, setJoinError] = useState('');
  
  // Lobby Creation State
  const [lobbyMaxPlayers, setLobbyMaxPlayers] = useState(2);
  const [lobbyCategory, setLobbyCategory] = useState<CategoryId | 'all'>('all');
  const [lobbyQuestionCount, setLobbyQuestionCount] = useState(10);
  const [lobbyTimer, setLobbyTimer] = useState(15);

  // Matchmaking & Ranking State
  const [onlineProfile, setOnlineProfile] = useState<OnlineProfile>({
    uid: '123',
    displayName: 'Spieler 1',
    rankInfo: {
      rating: 1250,
      league: 'Silber',
      matchesPlayed: 42,
      wins: 24,
      losses: 18
    },
    matchHistory: []
  });
  const [searchMode, setSearchMode] = useState<'1v1' | '3p' | '4p' | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Settings & Profile state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (screen === 'settings') {
      setEditName(stats.customName || user?.displayName || '');
      setEditAge(stats.age?.toString() || '');
      setIsEditing(false);
    }
  }, [screen, stats.customName, stats.age, user?.displayName]);

  // Matchmaking logic with Bot fallback
  useEffect(() => {
    let searchTimer: any;
    if (isSearching && !matchFound) {
      searchTimer = setTimeout(() => {
        // Simulate finding a match (always a bot in this version)
        const botNames = ['QuizMaster', 'Brainy', 'Lucky', 'Einstein_Jr', 'TriviaQueen', 'NerdAlert', 'SmartyPants', 'KnowledgeSeeker'];
        const randomName = botNames[Math.floor(Math.random() * botNames.length)];
        const botId = 'bot_' + Math.random().toString(36).substr(2, 9);
        
        const botPlayer: MultiplayerPlayer = {
          uid: botId,
          displayName: randomName,
          photoURL: `https://picsum.photos/seed/${botId}/200/200`,
          status: 'ready',
          score: 0
        };

        const me: MultiplayerPlayer = {
          uid: user?.uid || 'guest',
          displayName: stats.customName || user?.displayName || 'Du',
          photoURL: stats.customPhotoURL || user?.photoURL,
          status: 'ready',
          score: 0
        };

        const newLobby: Lobby = {
          id: 'lobby_' + Math.random().toString(36).substr(2, 9),
          code: 'MATCH',
          hostId: user?.uid || 'guest',
          maxPlayers: searchMode === '1v1' ? 2 : (searchMode === '3p' ? 3 : 4),
          categoryId: 'all',
          numberOfQuestions: 10,
          timePerQuestion: 15,
          players: {
            [me.uid]: me,
            [botId]: botPlayer
          },
          state: 'waiting',
          currentRound: 1,
          totalRounds: 10,
          createdAt: Date.now()
        };

        // Add more bots if needed for 3p or 4p
        if (searchMode === '3p' || searchMode === '4p') {
          const count = searchMode === '3p' ? 1 : 2;
          for (let i = 0; i < count; i++) {
            const bId = 'bot_' + Math.random().toString(36).substr(2, 9);
            newLobby.players[bId] = {
              uid: bId,
              displayName: botNames[Math.floor(Math.random() * botNames.length)] + '_' + (i + 2),
              photoURL: `https://picsum.photos/seed/${bId}/200/200`,
              status: 'ready',
              score: 0
            };
          }
        }

        setLobby(newLobby);
        setMatchFound(true);
        
        // Short delay before moving to lobby room
        setTimeout(() => {
          setIsSearching(false);
          setScreen('lobbyRoom');
        }, 1500);
      }, 3000 + Math.random() * 3000); // 3-6 seconds search time
    }
    return () => clearTimeout(searchTimer);
  }, [isSearching, matchFound, searchMode, user, stats]);

  // Bot behavior during quiz
  useEffect(() => {
    let botTimer: any;
    if (screen === 'quiz' && lobby && selectedOption === null) {
      const bots = (Object.values(lobby.players) as MultiplayerPlayer[]).filter(p => p.uid.startsWith('bot_'));
      
      if (bots.length > 0) {
        // Bots answer after a random delay (3-12 seconds)
        botTimer = setTimeout(() => {
          setLobby(prev => {
            if (!prev) return null;
            const nextPlayers = { ...prev.players };
            
            bots.forEach(bot => {
              // Only answer if not already answered this round (simplified logic)
              // In a real app, we'd track per-round answers
              
              // Average IQ simulation: 70% chance of correct answer
              const isCorrect = Math.random() < 0.7;
              const points = isCorrect ? Math.max(10, maxTime > 0 ? Math.floor(20 * (timeLeft / maxTime)) : 10) : 0;
              
              nextPlayers[bot.uid] = {
                ...(bot as any),
                score: bot.score + points,
                status: 'ready' // Use status to show they finished the question
              };
            });
            
            return { ...prev, players: nextPlayers };
          });
        }, 3000 + Math.random() * 8000);
      }
    }
    return () => clearTimeout(botTimer);
  }, [screen, lobby, selectedOption, timeLeft, maxTime]);

  // Auth & Initial Data
  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
      if (firebaseUser) {
        // Sync local stats to cloud if logged in
        syncUserStats(stats).then(updated => {
          if (updated) {
            setStats(updated);
            saveStats(updated);
          }
        });
      }
    });

    // Load leaderboard
    getLeaderboard(100).then(setLeaderboard);

    return () => unsubscribe();
  }, []);

  // Timer logic
  useEffect(() => {
    let timer: any;
    if ((screen === 'quiz' || screen === 'daily') && selectedOption === null && maxTime > 0 && !isTimeFrozen) {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      } else {
        handleAnswer(-1); // Time out
      }
    }
    return () => clearTimeout(timer);
  }, [timeLeft, screen, selectedOption, maxTime, isTimeFrozen]);

  // Blitz Timer logic
  useEffect(() => {
    let timer: any;
    if (screen === 'blitzQuiz' && !isTimeFrozen) {
      if (blitzTimeLeft > 0) {
        timer = setTimeout(() => setBlitzTimeLeft(prev => prev - 1), 1000);
      } else {
        // End Blitzrunde
        finishBlitzrunde();
      }
    }
    return () => clearTimeout(timer);
  }, [blitzTimeLeft, screen, isTimeFrozen]);

  // Auto-advance logic for better dynamics
  useEffect(() => {
    let autoTimer: any;
    let tickTimer: any;
    if (showExplanation && (screen === 'quiz' || screen === 'daily')) {
      setNextTimer(8);
      tickTimer = setInterval(() => {
        setNextTimer(prev => Math.max(0, prev - 1));
      }, 1000);
      
      autoTimer = setTimeout(() => {
        nextQuestion();
      }, 8000);
    }
    return () => {
      clearTimeout(autoTimer);
      clearInterval(tickTimer);
    };
  }, [showExplanation, screen]);

  // Endless mode logic
  useEffect(() => {
    if (isEndless && screen === 'quiz' && !isFetchingMore && currentQuestionIndex >= quizQuestions.length - 5) {
      const fetchMore = async () => {
        setIsFetchingMore(true);
        try {
          const categoryObj = CATEGORIES.find(c => c.id === selectedCategory);
          const categoryTitle = selectedCategory === 'custom' ? customTopic : (categoryObj ? categoryObj.title : 'Allgemeinwissen');
          
          if (selectedCategory === 'custom' || selectedCategory === 'all' || categoryObj) {
            const generated = await generateQuestions(
              categoryTitle, 
              selectedDifficulty, 
              15
            );
            
            if (generated && generated.length > 0) {
              const newQuestions = generated.filter(q => !seenQuestionIds.has(q.question));
              
              if (newQuestions.length > 0) {
                setQuizQuestions(prev => [...prev, ...newQuestions]);
                setUserAnswers(prev => [...prev, ...new Array(newQuestions.length).fill(null)]);
                
                setSeenQuestionIds(prev => {
                  const next = new Set(prev);
                  newQuestions.forEach(q => next.add(q.question));
                  if (next.size > 500) return new Set(Array.from(next).slice(-250));
                  return next;
                });
              }
            }
          }
        } catch (error) {
          console.error("Error fetching more endless questions:", error);
        } finally {
          setIsFetchingMore(false);
        }
      };
      
      fetchMore();
    }
  }, [currentQuestionIndex, isEndless, screen, quizQuestions.length, isFetchingMore, selectedCategory, customTopic, selectedDifficulty, seenQuestionIds]);

  const startQuiz = async (category: CategoryId | 'all' | 'daily' | 'review' | 'blitz' | 'custom' | 'project', difficultyOverride?: Difficulty | 'all', quickStart?: boolean, projectQuestions?: Question[]) => {
    const difficulty = difficultyOverride || selectedDifficulty;
    let filtered: Question[] = [];
    
    if (category === 'project' && projectQuestions) {
      setQuizQuestions(projectQuestions);
      setUserAnswers(new Array(projectQuestions.length).fill(null));
      setCurrentQuestionIndex(0);
      setScore(0);
      setLives(3);
      setTimeLeft(0);
      setMaxTime(0); // No timer for projects
      setBlitzTimeLeft(60);
      setSelectedOption(null);
      setShowExplanation(false);
      setSelectedCategory('custom');
      setActiveFiftyFifty([]);
      setEliminatedOptions([]);
      setIsTimeFrozen(false);
      setHasSecondChance(false);
      setScreen('quiz');
      return;
    }

    if (category === 'review') {
      filtered = [...(stats.wrongQuestions || [])].sort(() => Math.random() - 0.5);
      const count = Math.max(10, filtered.length); // Try to show at least 10 if possible, but limited by wrong questions
      
      let timeLimit = 0; // No time limit for review by default
      
      setQuizQuestions(filtered.slice(0, count));
      setUserAnswers(new Array(filtered.slice(0, count).length).fill(null));
      setCurrentQuestionIndex(0);
      setScore(0);
      setLives(3);
      setTimeLeft(timeLimit);
      setMaxTime(timeLimit);
      setBlitzTimeLeft(60);
      setSelectedOption(null);
      setShowExplanation(false);
      setSelectedCategory(category);
      setActiveFiftyFifty([]);
      setEliminatedOptions([]);
      setIsTimeFrozen(false);
      setHasSecondChance(false);
      setScreen('quiz');
      return;
    }

    setIsGeneratingQuestions(true);
    
    // Determine how many questions we need
    const isEndlessMode = customQuestionCount === 0 && !quickStart && category !== 'daily' && category !== 'blitz' && category !== 'project';
    setIsEndless(isEndlessMode);
    
    const count = (category === 'daily' || category === 'blitz') ? 10 : (quickStart ? 10 : (isEndlessMode ? 15 : customQuestionCount));
    
    const categoryObj = CATEGORIES.find(c => c.id === category);
    const categoryTitle = category === 'custom' ? customTopic : (categoryObj ? categoryObj.title : (category === 'all' ? 'Allgemeinwissen' : (category === 'daily' ? 'Daily Challenge' : (category === 'blitz' ? 'Blitz-Modus' : category))));

    try {
      // Try to generate questions using Gemini
      const generated = await generateQuestions(
        categoryTitle, 
        difficulty, 
        count
      );
      
      if (generated && generated.length >= count) {
        // Filter out recently seen questions if possible
        const newQuestions = generated.filter(q => !seenQuestionIds.has(q.question));
        
        // Always ensure we have exactly 'count' questions
        if (newQuestions.length >= count) {
          filtered = newQuestions.slice(0, count);
        } else {
          // If filtering would reduce the count below required, use the original generated set
          // to maintain the requested round length.
          filtered = generated.slice(0, count);
        }
        
        // Add to seen questions
        setSeenQuestionIds(prev => {
          const next = new Set(prev);
          filtered.forEach(q => next.add(q.question));
          // Keep set size reasonable
          if (next.size > 500) return new Set(Array.from(next).slice(-250));
          return next;
        });
      } else {
        throw new Error("Failed to generate enough questions");
      }
    } catch (error) {
      console.error("Falling back to local questions:", error);
      // Fallback to local questions
      let baseQuestions = [...QUESTIONS];
      
      let categoryFiltered = baseQuestions;
      if (category !== 'all' && category !== 'blitz' && category !== 'daily') {
        categoryFiltered = baseQuestions.filter(q => q.category === category);
      }

      // If category filter results in too few questions, use all questions
      if (categoryFiltered.length < 5) {
        categoryFiltered = baseQuestions;
      }

      if (difficulty !== 'all') {
        const difficultyFiltered = categoryFiltered.filter(q => q.difficulty === difficulty);
        if (difficultyFiltered.length >= 5) {
          filtered = difficultyFiltered;
        } else {
          filtered = categoryFiltered;
        }
      } else {
        filtered = categoryFiltered;
      }
      
      filtered = [...filtered].sort(() => Math.random() - 0.5);
      
      // If we still don't have enough questions, use the entire pool
      if (filtered.length < count) {
        filtered = [...QUESTIONS].sort(() => Math.random() - 0.5);
      }

      // Ensure we have exactly 'count' questions by duplicating if necessary
      if (filtered.length > 0) {
        while (filtered.length < count) {
          filtered = [...filtered, ...filtered];
        }
        filtered = filtered.slice(0, count);
      }
    }
    
    setIsGeneratingQuestions(false);
    
    let timeLimit = (category === 'daily' || category === 'blitz') ? 15 : (quickStart ? 0 : customTimeLimit);
    
    const finalQuestions = filtered.slice(0, count);

    if (category === 'custom') {
      const newProject = {
        id: `proj-${Date.now()}`,
        title: customTopic,
        questions: finalQuestions,
        createdAt: Date.now()
      };
      const newStats = {
        ...stats,
        customQuizzes: [...(stats.customQuizzes || []), newProject]
      };
      setStats(newStats);
      saveStats(newStats);
    }
    
    setQuizQuestions(finalQuestions);
    setUserAnswers(new Array(count).fill(null));
    setCurrentQuestionIndex(0);
    setScore(0);
    setLives(category === 'blitz' ? 999 : 3);
    setTimeLeft(timeLimit);
    setMaxTime(timeLimit);
    setBlitzTimeLeft(60);
    setSelectedOption(null);
    setShowExplanation(false);
    setSelectedCategory(category);
    setActiveFiftyFifty([]);
    setEliminatedOptions([]);
    setIsTimeFrozen(false);
    setHasSecondChance(false);
    
    if (category === 'blitz') {
      setScreen('blitzQuiz');
    } else {
      setScreen(category === 'daily' ? 'daily' : 'quiz');
    }
  };

  const finishBlitzrunde = () => {
    const today = new Date().toISOString().split('T')[0];
    const correctCount = quizQuestions.filter((q, idx) => userAnswers[idx] === q.correctAnswer).length;
    const oldLevel = getLevelInfo(stats.totalPoints).level;
    const finalStats = updateStatsAfterRound(score, correctCount, currentQuestionIndex, 'blitz', false);
    const newLevel = getLevelInfo(finalStats.totalPoints).level;
    
    if (newLevel > oldLevel) {
      setIsLevelUp(true);
    }
    
    setStats(finalStats);
    if (user) {
      syncUserStats(finalStats).then(updated => {
        if (updated) {
          setStats(updated);
          saveStats(updated);
        }
      });
    }
    setScreen('result');
  };

  const handleAnswer = (optionIndex: number) => {
    if (selectedOption !== null || lives <= 0) return;
    
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    const isTimeout = optionIndex === -1;

    if (!isCorrect && !isTimeout && hasSecondChance) {
      // Use second chance
      setHasSecondChance(false);
      soundManager.playIncorrect();
      setEliminatedOptions(prev => [...prev, optionIndex]);
      // Don't set selectedOption, allow another try
      return;
    }

    setSelectedOption(optionIndex);
    
    // Stop timer immediately (handled by selectedOption !== null in useEffect)
    
    // Store answer
    setUserAnswers(prev => {
      const updated = [...prev];
      updated[currentQuestionIndex] = optionIndex;
      return updated;
    });

    if (isCorrect) {
      soundManager.playCorrect();
      // Points calculation: Base points + Speed Bonus (normalized)
      const questionDifficulty = currentQuestion.difficulty || 'mittel';
      const effectiveDifficulty = (selectedDifficulty === 'all' || !selectedDifficulty) ? questionDifficulty : selectedDifficulty;
      
      let basePoints = 10;
      let maxSpeedBonus = 15;
      
      if (effectiveDifficulty === 'leicht') {
        basePoints = 10;
        maxSpeedBonus = 10;
      } else if (effectiveDifficulty === 'mittel') {
        basePoints = 20;
        maxSpeedBonus = 15;
      } else if (effectiveDifficulty === 'schwer') {
        basePoints = 30;
        maxSpeedBonus = 20;
      }
      
      const speedBonus = screen === 'blitzQuiz' ? 5 : (maxTime > 0 ? Math.floor((timeLeft / maxTime) * maxSpeedBonus) : 0);
      const points = (screen === 'blitzQuiz' ? 20 : basePoints) + speedBonus;
      
      setScore(prev => prev + points);
      setLastPointsEarned(points);
      setIsSpeedBonus(screen === 'blitzQuiz' ? false : (maxTime > 0 ? (timeLeft / maxTime) > 0.7 : false));
      
      // If in review mode, remove from wrong questions
      if (selectedCategory === 'review') {
        const updatedStats = removeWrongQuestion(currentQuestion.id);
        setStats(updatedStats);
      }
    } else {
      soundManager.playIncorrect();
      // Wrong answer or timeout
      if (screen !== 'blitzQuiz') {
        setLives(prev => Math.max(0, prev - 1));
      }
      setLastPointsEarned(null);
      setIsSpeedBonus(false);
      
      // Save to wrong questions
      const updatedStats = saveWrongQuestion(currentQuestion);
      setStats(updatedStats);
    }
    
    // Feedback lock and explanation
    // Show explanation after a short delay to let the user see the marking
    if (screen === 'blitzQuiz') {
      setTimeout(() => {
        nextQuestion();
      }, 400);
    } else {
      setTimeout(() => {
        setShowExplanation(true);
      }, 800);
    }
  };

  const nextQuestion = () => {
    setLastPointsEarned(null);
    setIsSpeedBonus(false);
    if (currentQuestionIndex + 1 < quizQuestions.length && lives > 0) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(maxTime);
      setSelectedOption(null);
      setShowExplanation(false);
      setEliminatedOptions([]);
      setIsTimeFrozen(false);
      setHasSecondChance(false);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const isDailyReward = selectedCategory === 'daily' && stats.lastDailyRewardDate !== today;
      
      const correctCount = quizQuestions.filter((q, idx) => userAnswers[idx] === q.correctAnswer).length;
      const oldLevel = getLevelInfo(stats.totalPoints).level;
      const finalStats = updateStatsAfterRound(score, correctCount, quizQuestions.length, selectedCategory, isDailyReward);
      const newLevel = getLevelInfo(finalStats.totalPoints).level;
      
      if (newLevel > oldLevel) {
        setIsLevelUp(true);
      }
      
      setStats(finalStats);
      if (user) {
        syncUserStats(finalStats).then(updated => {
          if (updated) {
            setStats(updated);
            saveStats(updated);
          }
        });
      }
      setScreen('result');
    }
  };

  const renderHowToPlay = () => {
    const sections = [
      {
        title: 'Spielmodi',
        icon: <LayoutGrid className="text-blue-500" />,
        items: [
          { name: 'Klassisches Quiz', desc: 'Wähle eine Kategorie und beantworte 10 Fragen. Je schneller du bist, desto mehr Punkte gibt es!' },
          { name: 'Daily Challenge', desc: 'Jeden Tag 10 neue Fragen. Schließe sie ab, um deinen Streak zu halten und Bonus-Coins zu verdienen.' },
          { name: 'Blitz-Modus', desc: '60 Sekunden Zeit. Beantworte so viele Fragen wie möglich. Keine Leben, nur pure Geschwindigkeit!' },
          { name: 'Online-Duell', desc: 'Tritt gegen Freunde oder Spieler weltweit an. Wer zuerst richtig antwortet, gewinnt die Runde.' }
        ]
      },
      {
        title: 'Punktesystem',
        icon: <Trophy className="text-amber-500" />,
        items: [
          { name: 'Basis-Punkte', desc: 'Jede richtige Antwort gibt dir 100 Punkte (20 im Blitz-Modus).' },
          { name: 'Zeit-Bonus', desc: 'Antwortest du schnell, erhältst du bis zu 50 zusätzliche Bonus-Punkte.' },
          { name: 'Schwierigkeit', desc: 'Höhere Schwierigkeitsgrade geben mehr Punkte, haben aber weniger Zeit pro Frage.' }
        ]
      },
      {
        title: 'Leben & Zeit',
        icon: <Heart className="text-rose-500" />,
        items: [
          { name: '3 Leben', desc: 'In normalen Runden hast du 3 Leben. Bei 0 ist das Quiz vorbei.' },
          { name: 'Zeitlimit', desc: 'Leicht: 25s, Mittel: 15s, Schwer: 10s. Läuft die Zeit ab, verlierst du ein Leben.' }
        ]
      }
    ];

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar"
      >
        <header className="shrink-0 px-6 pt-12 pb-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 relative z-10">
          <button 
            onClick={() => setScreen('home')}
            className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-2xl font-display font-black tracking-tight text-slate-900 dark:text-white">Spielanleitung</h1>
        </header>

        <main className="flex-1 p-6 space-y-8 pb-32">
          {sections.map((section, idx) => (
            <motion.section key={idx} variants={itemVariants} className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center">
                  {section.icon}
                </div>
                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">{section.title}</h2>
              </div>
              
              <div className="grid gap-3">
                {section.items.map((item, itemIdx) => (
                  <Card key={itemIdx} className="p-5 border-none shadow-sm bg-white dark:bg-slate-900">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">{item.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </Card>
                ))}
              </div>
            </motion.section>
          ))}
        </main>
      </motion.div>
    );
  };

  const renderHome = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-y-auto no-scrollbar"
    >
      <header className="shrink-0 px-6 pt-12 pb-6 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={() => setScreen('profile')} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 overflow-hidden">
                {stats.customPhotoURL || user.photoURL ? (
                  <img src={stats.customPhotoURL || user.photoURL!} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="font-black text-lg">{user.displayName?.charAt(0) || 'U'}</span>
                )}
              </div>
              <div className="flex flex-col text-left">
                <h1 className="text-sm font-black tracking-tight leading-none text-slate-900 dark:text-white">{user.displayName?.split(' ')[0]}</h1>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Level {getLevelInfo(stats.totalPoints).level}</span>
              </div>
            </button>
          ) : (
            <button onClick={signInWithGoogle} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
              <LogIn size={14} />
              <span>Anmelden</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-orange-50 dark:bg-orange-900/30 px-3 py-1.5 rounded-xl border border-orange-100 dark:border-orange-800 flex items-center gap-1.5">
            <Flame size={14} className="text-orange-500" fill="currentColor" />
            <span className="text-xs font-black text-orange-600 dark:text-orange-400 tabular-nums">{stats.currentStreak}</span>
          </div>
          <button onClick={() => setScreen('shop')} className="bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-800 flex items-center gap-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors">
            <Coins size={14} className="text-amber-500" />
            <span className="text-xs font-black text-amber-600 dark:text-amber-400 tabular-nums">{stats.coins || 0}</span>
          </button>
          <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
            <Trophy size={14} className="text-blue-500" fill="currentColor" />
            <span className="text-xs font-black tabular-nums">{stats.totalPoints.toLocaleString()}</span>
          </div>
        </div>
      </header>


      <main className="flex-1 px-6 py-4 pb-32 space-y-8 max-w-2xl mx-auto w-full">
        <AnimatePresence>
          {showDailyQuestReward && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-emerald-500 rounded-3xl p-4 text-white shadow-lg shadow-emerald-500/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Tagesziel erreicht!</p>
                    <p className="text-xs font-bold">Hol dir deine Belohnung ab!</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newStats = claimDailyReward();
                    setStats(newStats);
                    if (user) syncUserStats(newStats);
                    setShowDailyQuestReward(false);
                  }}
                  className="bg-white text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Einlösen
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero: Quick Start */}
        <motion.div variants={itemVariants}>
          <button 
            onClick={() => {
              setSelectedDifficulty('all');
              setScreen('difficultySelection');
              setSelectedCategory('all');
            }}
            className="w-full text-left bg-slate-900 dark:bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group transition-transform active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-colors" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Play size={24} fill="currentColor" className="ml-1" />
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-2">Schnelles Quiz</h2>
              <p className="text-white/60 text-sm font-medium max-w-[200px]">10 zufällige Fragen aus allen Kategorien.</p>
            </div>
            <div className="absolute right-8 bottom-8 w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-xl group-hover:translate-x-2 transition-transform">
              <ArrowRight size={24} />
            </div>
          </button>
        </motion.div>

        {/* Game Modes Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button 
            variants={itemVariants}
            onClick={() => setScreen('duelSelection')}
            className="card-minimal p-6 text-left group"
          >
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Swords size={20} />
            </div>
            <h3 className="font-black text-sm uppercase tracking-widest mb-1">Duelle</h3>
            <p className="text-[10px] text-slate-400 font-bold">Multiplayer</p>
          </motion.button>

          <motion.button 
            variants={itemVariants}
            onClick={() => setScreen('blitzIntro')}
            className="card-minimal p-6 text-left group"
          >
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap size={20} />
            </div>
            <h3 className="font-black text-sm uppercase tracking-widest mb-1">Blitz</h3>
            <p className="text-[10px] text-slate-400 font-bold">60 Sek. Action</p>
          </motion.button>

          <motion.button 
            variants={itemVariants}
            onClick={() => {
              setSelectedCategory('daily');
              setSelectedDifficulty('all');
              startQuiz('daily');
            }}
            className="card-minimal p-6 text-left group"
          >
            <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar size={20} />
            </div>
            <h3 className="font-black text-sm uppercase tracking-widest mb-1">Daily</h3>
            <p className="text-[10px] text-slate-400 font-bold">Täglicher Bonus</p>
          </motion.button>

          <motion.button 
            variants={itemVariants}
            onClick={() => setScreen('categories')}
            className="card-minimal p-6 text-left group"
          >
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <LayoutGrid size={20} />
            </div>
            <h3 className="font-black text-sm uppercase tracking-widest mb-1">Themen</h3>
            <p className="text-[10px] text-slate-400 font-bold">Alle Kategorien</p>
          </motion.button>
        </div>

        {/* Review Section */}
        {stats.wrongQuestions && stats.wrongQuestions.length > 0 && (
          <motion.button 
            variants={itemVariants}
            onClick={() => setScreen('review')}
            className="w-full card-minimal p-5 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center">
                <RotateCcw size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-black text-sm uppercase tracking-widest">Fehler wiederholen</h3>
                <p className="text-[10px] text-slate-400 font-bold">{stats.wrongQuestions.length} Fragen gespeichert</p>
              </div>
            </div>
            <ArrowRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        )}

        {/* Top Categories */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-1">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Top Themen</h2>
            <button onClick={() => setScreen('categories')} className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">Alle sehen</button>
          </div>
          <div className="space-y-3">
            {CATEGORIES.slice(0, 4).map(cat => {
              const Icon = ICON_MAP[cat.icon];
              return (
                <button 
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setScreen('difficultySelection');
                  }}
                  className="w-full card-minimal p-4 flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${cat.color} text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-none`}>
                      <Icon size={24} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-black text-slate-800 dark:text-slate-100">{cat.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{cat.id}</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </motion.div>
  );

  const renderCreateQuizMenu = () => {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar"
      >
        <header className="shrink-0 px-6 pt-12 pb-6 flex items-center gap-4 sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-50">
          <button onClick={() => setScreen('categories')} className="p-2.5 -ml-2 text-slate-400 hover:text-purple-500 transition-colors">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Neues Quiz</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">
              Erstellungsmethode wählen
            </p>
          </div>
        </header>

        <main className="flex-1 px-6 py-8 pb-32 space-y-6 max-w-2xl mx-auto w-full">
          <button 
            onClick={() => setScreen('customTopicSelection')}
            className="w-full text-left bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-[2rem] p-8 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden group hover:scale-[1.02] transition-transform"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-colors" />
            <div className="relative z-10">
              <Sparkles size={40} className="mb-6 text-purple-100" />
              <h2 className="text-2xl font-black mb-3">Mit KI generieren</h2>
              <p className="text-purple-100/90 text-sm font-medium leading-relaxed">
                Gib einfach ein Thema ein und unsere KI erstellt in Sekunden ein komplettes Quiz für dich. Perfekt zum schnellen Lernen.
              </p>
            </div>
          </button>

          <button 
            onClick={() => {
              setManualQuizTitle('');
              setManualQuizQuestions([]);
              setManualCurrentQ('');
              setManualOptions(['', '', '', '']);
              setManualCorrect(0);
              setScreen('createManualQuiz');
            }}
            className="w-full text-left bg-white dark:bg-slate-900 rounded-[2rem] p-8 border-2 border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-blue-500/30 hover:shadow-lg transition-all"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
                <PenTool size={24} />
              </div>
              <h2 className="text-2xl font-black mb-3 text-slate-900 dark:text-white">Manuell erstellen</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                Schreibe deine eigenen Fragen und Antworten. Ideal für spezifische Prüfungen oder persönliche Quizze.
              </p>
            </div>
          </button>
        </main>
      </motion.div>
    );
  };

  const renderCreateManualQuiz = () => {
    const isQuestionValid = manualCurrentQ.trim() && manualOptions.every(o => o.trim());
    const isQuizValid = manualQuizTitle.trim() && manualQuizQuestions.length > 0;

    const addQuestion = () => {
      if (!isQuestionValid) return;
      const newQ: Question = {
        id: `man-${Date.now()}`,
        question: manualCurrentQ,
        options: [...manualOptions],
        correctAnswer: manualCorrect,
        category: 'custom',
        difficulty: 'mittel',
        explanation: 'Manuell erstellte Frage.'
      };

      if (manualEditingIndex !== null) {
        setManualQuizQuestions(prev => {
          const updated = [...prev];
          updated[manualEditingIndex] = newQ;
          return updated;
        });
        setManualEditingIndex(null);
      } else {
        setManualQuizQuestions(prev => [...prev, newQ]);
      }
      
      setManualCurrentQ('');
      setManualOptions(['', '', '', '']);
      setManualCorrect(0);
    };

    const editQuestion = (index: number) => {
      const q = manualQuizQuestions[index];
      setManualCurrentQ(q.question);
      setManualOptions([...q.options]);
      setManualCorrect(q.correctAnswer);
      setManualEditingIndex(index);
      
      // Scroll to top to edit
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteQuestion = (index: number) => {
      setManualQuizQuestions(prev => prev.filter((_, i) => i !== index));
      if (manualEditingIndex === index) {
        setManualEditingIndex(null);
        setManualCurrentQ('');
        setManualOptions(['', '', '', '']);
        setManualCorrect(0);
      } else if (manualEditingIndex !== null && manualEditingIndex > index) {
        setManualEditingIndex(manualEditingIndex - 1);
      }
    };

    const saveManualQuiz = () => {
      if (!isQuizValid) return;
      const newProject = {
        id: `proj-${Date.now()}`,
        title: manualQuizTitle,
        questions: manualQuizQuestions,
        createdAt: Date.now()
      };
      const newStats = {
        ...stats,
        customQuizzes: [...(stats.customQuizzes || []), newProject]
      };
      setStats(newStats);
      saveStats(newStats);
      setScreen('projects');
    };

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar pb-32"
      >
        <header className="shrink-0 px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <button onClick={() => setScreen('createQuizMenu')} className="p-2.5 -ml-2 text-slate-400 hover:text-blue-500 transition-colors">
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Quiz Editor</h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">
                {manualQuizQuestions.length} Fragen hinzugefügt
              </p>
            </div>
          </div>
          <Button 
            size="sm" 
            disabled={!isQuizValid}
            onClick={saveManualQuiz}
            className="bg-blue-600 text-white"
          >
            Speichern
          </Button>
        </header>

        <main className="flex-1 px-6 py-6 space-y-8 max-w-2xl mx-auto w-full">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quiz Titel</label>
            <input
              type="text"
              value={manualQuizTitle}
              onChange={(e) => setManualQuizTitle(e.target.value)}
              placeholder="z.B. Geschichte Test 1"
              className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              {manualEditingIndex !== null ? `Frage ${manualEditingIndex + 1} bearbeiten` : 'Neue Frage'}
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Frage</label>
              <textarea
                value={manualCurrentQ}
                onChange={(e) => setManualCurrentQ(e.target.value)}
                placeholder="Wie lautet die Frage?"
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Antworten (Wähle die richtige)</label>
              {manualOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <button
                    onClick={() => setManualCorrect(idx)}
                    className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      manualCorrect === idx 
                        ? 'border-emerald-500 bg-emerald-500 text-white' 
                        : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500/50'
                    }`}
                  >
                    {manualCorrect === idx && <Check size={14} strokeWidth={3} />}
                  </button>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...manualOptions];
                      newOpts[idx] = e.target.value;
                      setManualOptions(newOpts);
                    }}
                    placeholder={`Antwort ${idx + 1}`}
                    className={`flex-1 bg-slate-50 dark:bg-slate-950 border-2 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none transition-colors ${
                      manualCorrect === idx ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <Button 
                fullWidth 
                variant="secondary"
                disabled={!isQuestionValid}
                onClick={addQuestion}
                className={manualEditingIndex !== null ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" : ""}
              >
                {manualEditingIndex !== null ? (
                  <>
                    <Check size={18} className="mr-2" />
                    Änderungen speichern
                  </>
                ) : (
                  <>
                    <Plus size={18} className="mr-2" />
                    Frage hinzufügen
                  </>
                )}
              </Button>
              
              {manualEditingIndex !== null && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setManualEditingIndex(null);
                    setManualCurrentQ('');
                    setManualOptions(['', '', '', '']);
                    setManualCorrect(0);
                  }}
                  className="px-4"
                >
                  Abbrechen
                </Button>
              )}
            </div>
          </div>

          {manualQuizQuestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-black text-lg text-slate-900 dark:text-white">Hinzugefügte Fragen ({manualQuizQuestions.length})</h3>
              <div className="space-y-3">
                {manualQuizQuestions.map((q, idx) => (
                  <div key={idx} className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border ${manualEditingIndex === idx ? 'border-blue-500 shadow-md' : 'border-slate-100 dark:border-slate-800'} transition-all`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{idx + 1}. {q.question}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => editQuestion(idx)}
                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteQuestion(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className={`text-xs p-2 rounded-lg ${oIdx === q.correctAnswer ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold' : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400'}`}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </motion.div>
    );
  };

  const renderProjects = () => {
    const projects = stats.customQuizzes || [];

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar"
      >
        <header className="shrink-0 px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <button onClick={() => setScreen('categories')} className="p-2.5 -ml-2 text-slate-400 hover:text-blue-500 transition-colors">
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Meine Projekte</h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">
                {projects.length} Gespeicherte Quizze
              </p>
            </div>
          </div>
          <button 
            onClick={() => setScreen('createQuizMenu')}
            className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
          </button>
        </header>

        <main className="flex-1 px-6 py-6 pb-32 space-y-4 max-w-2xl mx-auto w-full">
          {projects.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <FolderOpen size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Noch keine Projekte</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Erstelle dein erstes eigenes Quiz, entweder manuell oder mit Hilfe der KI.</p>
              <Button onClick={() => setScreen('createQuizMenu')} className="bg-blue-600 text-white">
                Neues Quiz erstellen
              </Button>
            </div>
          ) : (
            projects.map(project => (
              <div key={project.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white mb-1">{project.title}</h3>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1"><HelpCircle size={14} /> {project.questions.length} Fragen</span>
                    <span>•</span>
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button 
                  onClick={() => startQuiz('project', 'all', false, project.questions)}
                  className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors"
                >
                  <Play size={20} className="fill-current ml-1" />
                </button>
              </div>
            ))
          )}
        </main>
      </motion.div>
    );
  };

  const renderCustomTopicSelection = () => {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar"
      >
        <header className="shrink-0 px-6 pt-12 pb-6 flex items-center gap-4 sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-50">
          <button onClick={() => setScreen('createQuizMenu')} className="p-2.5 -ml-2 text-slate-400 hover:text-purple-500 transition-colors">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">KI Quiz</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">
              Thema wählen
            </p>
          </div>
        </header>
        
        <main className="flex-1 px-6 pb-32 space-y-8 max-w-2xl mx-auto w-full">
          <section className="space-y-4">
            <div className="bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-3xl p-6 text-white shadow-lg shadow-purple-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="relative z-10">
                <Sparkles size={32} className="mb-4 text-purple-100" />
                <h2 className="text-2xl font-black mb-2">Worüber möchtest du ein Quiz spielen?</h2>
                <p className="text-purple-100/80 text-sm font-medium">Gib ein beliebiges Thema ein. Die KI generiert in Sekunden ein maßgeschneidertes Quiz für dich.</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
                Dein Thema
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="z.B. Französische Vokabeln, Harry Potter, Quantenphysik..."
                className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
              />
              
              <div className="mt-4 flex flex-wrap gap-2">
                {['Hauptstädte Europas', 'Biologie Klasse 8', 'Filme der 90er', 'Python Programmierung'].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setCustomTopic(suggestion)}
                    className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-slate-950 dark:via-slate-950 z-50">
          <div className="max-w-2xl mx-auto space-y-3">
            <Button 
              fullWidth 
              size="lg" 
              disabled={!customTopic.trim() || isGeneratingQuestions}
              onClick={() => {
                if (customTopic.trim()) {
                  setSelectedCategory('custom');
                  setScreen('difficultySelection');
                }
              }}
              className="py-5 rounded-2xl text-lg bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white shadow-xl shadow-purple-500/20 group relative overflow-hidden disabled:opacity-50 disabled:grayscale"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="flex items-center justify-center gap-2 relative z-10">
                Weiter zu den Einstellungen
                <ArrowRight size={20} className="fill-current" />
              </span>
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderDifficultySelection = () => {
    const difficulties: { id: Difficulty | 'all'; title: string; description: string; icon: any; color: string; badge?: string }[] = [
      { id: 'all', title: 'Gemischt', description: 'Alle Schwierigkeitsgrade bunt gemischt.', icon: LayoutGrid, color: 'bg-slate-500' },
      { id: 'leicht', title: 'Leicht', description: 'Perfekt für den Einstieg und zum Aufwärmen.', icon: Leaf, color: 'bg-emerald-500' },
      { id: 'mittel', title: 'Mittel', description: 'Die goldene Mitte für Fortgeschrittene.', icon: Zap, color: 'bg-blue-500' },
      { id: 'schwer', title: 'Schwer', description: 'Echte Herausforderung für Experten.', icon: Flame, color: 'bg-rose-500' },
    ];

    const category = CATEGORIES.find(c => c.id === selectedCategory);

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar"
      >
        <header className="shrink-0 px-6 pt-12 pb-6 flex items-center gap-4 sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-50">
          <button onClick={() => setScreen(selectedCategory === 'all' ? 'home' : (selectedCategory === 'custom' ? 'customTopicSelection' : 'categories'))} className="p-2.5 -ml-2 text-slate-400 hover:text-blue-500 transition-colors">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Spiel-Setup</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5 truncate max-w-[200px]">
              {category ? category.title : (selectedCategory === 'custom' ? customTopic : 'Alle Themen')}
            </p>
          </div>
        </header>
        
        <main className="flex-1 px-6 pb-32 space-y-8 max-w-2xl mx-auto w-full">
          {/* Difficulty Selection */}
          <section>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">Schwierigkeit</h2>
            <div className="grid grid-cols-1 gap-3">
              {difficulties.map(diff => {
                const Icon = diff.icon;
                const isSelected = selectedDifficulty === diff.id;
                
                return (
                  <motion.button 
                    key={diff.id} 
                    variants={itemVariants}
                    onClick={() => setSelectedDifficulty(diff.id)}
                    className={`w-full p-4 text-left group relative overflow-hidden flex items-center justify-between rounded-2xl transition-all border-2 ${isSelected ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-transparent bg-white dark:bg-slate-900 shadow-sm hover:shadow-md'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${diff.color} text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-none transition-transform ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                        <Icon size={24} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className={`font-bold text-base ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{diff.title}</h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{diff.description}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Game Settings */}
          <section className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Settings size={16} className="text-blue-500" />
              Einstellungen
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Anzahl der Fragen</label>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                    {customQuestionCount === 0 ? 'Unendlich' : customQuestionCount}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="30" 
                  step="5"
                  value={customQuestionCount} 
                  onChange={(e) => setCustomQuestionCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 uppercase">
                  <span>Unendlich</span>
                  <span>15</span>
                  <span>30</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Zeit pro Frage</label>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                    {customTimeLimit === 0 ? 'Ohne Zeit' : `${customTimeLimit}s`}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="60" 
                  step="5"
                  value={customTimeLimit} 
                  onChange={(e) => setCustomTimeLimit(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 uppercase">
                  <span>Ohne Zeit</span>
                  <span>30s</span>
                  <span>60s</span>
                </div>
              </div>
            </div>
          </section>
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-slate-950 dark:via-slate-950 z-50">
          <div className="max-w-2xl mx-auto">
            <Button 
              fullWidth 
              size="lg" 
              disabled={isGeneratingQuestions}
              onClick={() => startQuiz(selectedCategory, selectedDifficulty)}
              className="py-5 rounded-2xl text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 group relative overflow-hidden disabled:opacity-50 disabled:grayscale"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="flex items-center justify-center gap-2 relative z-10">
                {isGeneratingQuestions ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generiere...
                  </span>
                ) : (
                  <>
                    <Play size={20} className="fill-current" />
                    Quiz Starten
                  </>
                )}
              </span>
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderCategories = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-y-auto no-scrollbar"
    >
      <header className="shrink-0 px-6 pt-12 pb-8 flex items-center gap-4 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50">
        <button onClick={() => setScreen('home')} className="p-2.5 -ml-2 text-slate-400 hover:text-blue-500 transition-colors">
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Themenbereiche</h1>
      </header>
      
      <main className="flex-1 px-6 py-6 pb-32 space-y-4 max-w-2xl mx-auto w-full">
        <motion.button 
          variants={itemVariants}
          onClick={() => {
            setSelectedCategory('custom');
            setScreen('projects');
          }}
          className="w-full card-minimal p-5 text-left group flex items-center justify-between border-2 border-transparent hover:border-purple-500/30 bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/10 dark:to-fuchsia-900/10"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
              <FolderOpen size={28} />
            </div>
            <div className="text-left">
              <h3 className="font-black text-lg text-slate-900 dark:text-white mb-1">Meine Projekte</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Eigene Quizze erstellen, speichern und spielen.</p>
            </div>
          </div>
          <ArrowRight size={20} className="text-purple-300 group-hover:text-purple-500 transition-colors" />
        </motion.button>

        <div className="flex items-center gap-4 py-2">
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standard Themen</span>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
        </div>

        {CATEGORIES.map(cat => {
          const Icon = ICON_MAP[cat.icon];
          const catStats = stats.categoryStats?.[cat.id];
          const roundsPlayed = catStats?.roundsPlayed || 0;
          const successRate = catStats?.totalQuestions ? Math.round((catStats.correctAnswers / catStats.totalQuestions) * 100) : 0;

          return (
            <motion.button 
              key={cat.id} 
              variants={itemVariants}
              onClick={() => {
                setSelectedCategory(cat.id);
                setScreen('difficultySelection');
              }}
              className="w-full card-minimal p-5 text-left group flex items-center justify-between"
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 ${cat.color} text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-none group-hover:scale-110 transition-transform`}>
                  <Icon size={28} />
                </div>
                <div className="text-left">
                  <h3 className="font-black text-lg text-slate-900 dark:text-white mb-1">{cat.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{cat.id}</span>
                    {roundsPlayed > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] text-emerald-500 font-black tracking-widest">{successRate}% Erfolg</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
            </motion.button>
          );
        })}
      </main>
    </motion.div>
  );

  const renderDailyIntro = () => {
    const today = new Date().toISOString().split('T')[0];
    const alreadyPlayed = stats.lastDailyRewardDate === today;

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-y-auto no-scrollbar"
      >
        <header className="shrink-0 px-6 pt-12 pb-8 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50">
          <button onClick={() => setScreen('home')} className="p-2.5 -ml-2 text-slate-400 hover:text-blue-500 transition-colors">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/30 rounded-2xl border border-amber-100 dark:border-amber-900/50">
            <Flame size={18} className="text-amber-500" fill="currentColor" />
            <span className="text-sm font-black text-amber-700 dark:text-amber-400">{stats.currentStreak} Tage Streak</span>
          </div>
        </header>

        <main className="flex-1 px-8 py-12 flex flex-col items-center text-center max-w-md mx-auto w-full">
          <motion.div
            variants={itemVariants}
            className="w-40 h-40 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-amber-200 dark:shadow-none mb-12 relative"
          >
            <Calendar size={64} className="text-white" strokeWidth={2.5} />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4 mb-12">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Daily Challenge</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Stelle dich der heutigen Auswahl von 10 exklusiven Fragen und sichere dir deinen täglichen Bonus!
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full grid grid-cols-2 gap-4 mb-12">
            <div className="card-minimal p-6 flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <Zap size={20} fill="currentColor" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Belohnung</span>
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">+50 Pkt</span>
            </div>
            <div className="card-minimal p-6 flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Target size={20} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fragen</span>
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">10 Stück</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full mt-auto">
            {alreadyPlayed ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-6 py-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/30 flex flex-col items-center gap-3">
                <CheckCircle2 size={32} />
                <span className="font-black text-lg">Heute bereits erledigt!</span>
                <Button onClick={() => setScreen('home')} variant="secondary" fullWidth className="mt-4">Zurück zum Home</Button>
              </div>
            ) : (
              <Button 
                fullWidth 
                size="lg" 
                onClick={() => setScreen('quiz')}
                className="py-6 rounded-[2rem] text-xl bg-gradient-to-r from-amber-500 to-orange-600"
              >
                Herausforderung starten
              </Button>
            )}
            <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nur einmal täglich verfügbar</p>
          </motion.div>
        </main>
      </motion.div>
    );
  };

  const renderBlitzIntro = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full bg-slate-950 text-white overflow-y-auto no-scrollbar"
    >
      <header className="shrink-0 px-6 pt-12 pb-8 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-md z-50">
        <button onClick={() => setScreen('home')} className="p-2.5 -ml-2 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-2xl border border-orange-500/20">
          <Zap size={18} className="text-orange-500" fill="currentColor" />
          <span className="text-sm font-black text-orange-400">Blitzrunde</span>
        </div>
      </header>

      <main className="flex-1 px-8 py-12 flex flex-col items-center text-center max-w-md mx-auto w-full">
        <motion.div
          variants={itemVariants}
          className="w-40 h-40 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-orange-500/20 mb-12 relative"
        >
          <Clock size={64} className="text-white" strokeWidth={2.5} />
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4 mb-12">
          <h1 className="text-3xl font-black text-white tracking-tight">60 Sekunden Action</h1>
          <p className="text-slate-400 font-medium leading-relaxed">
            Beantworte so viele Fragen wie möglich, bevor die Zeit abläuft. Jede Sekunde zählt!
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full grid grid-cols-2 gap-4 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center mb-3">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Punkte</span>
            <span className="text-xl font-black text-white">+20 Pkt</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center mb-3">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Zeit</span>
            <span className="text-xl font-black text-white">60 Sek</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full mt-auto">
          <Button 
            fullWidth 
            size="lg" 
            onClick={() => startQuiz('blitz')}
            className="py-6 rounded-[2rem] text-xl bg-gradient-to-r from-orange-500 to-amber-500 border-none text-white"
          >
            Jetzt starten
          </Button>
          <p className="mt-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Bist du bereit?</p>
        </motion.div>
      </main>
    </motion.div>
  );

  const renderBlitzQuiz = () => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (!currentQuestion) return null;

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`flex flex-col h-full bg-slate-950 text-white transition-colors duration-300 ${
          selectedOption !== null 
            ? (selectedOption === currentQuestion.correctAnswer ? 'bg-emerald-950/20' : 'bg-rose-950/20') 
            : ''
        }`}
      >
        {/* Blitz Progress Bar */}
        <div className="h-2 w-full bg-white/5 overflow-hidden relative z-50">
          <motion.div 
            initial={{ width: "100%" }}
            animate={{ width: `${(blitzTimeLeft / 60) * 100}%` }}
            transition={{ duration: 1, ease: "linear" }}
            className={`h-full bg-gradient-to-r from-orange-500 to-amber-400`}
          />
        </div>

        {/* Header */}
        <motion.header variants={itemVariants} className="px-6 pt-8 pb-4 flex justify-between items-center relative z-40">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-1">Blitzrunde</span>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              <span className={`text-2xl font-display font-black tabular-nums ${blitzTimeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                {blitzTimeLeft}s
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Punkte</span>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
              <Star size={16} className="text-amber-400" fill="currentColor" />
              <span className="text-xl font-display font-black">{score}</span>
              
              <AnimatePresence>
                {lastPointsEarned !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -30, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-2 right-0 font-black text-emerald-400 text-lg pointer-events-none"
                  >
                    +{lastPointsEarned}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 px-6 py-8 flex flex-col max-w-2xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              {/* Question Card */}
              <div className="mb-8 text-center px-6 py-12 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl" />
                <h2 className="text-2xl md:text-3xl font-display font-black text-white leading-tight tracking-tight">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option, idx) => {
                  let state = 'default';
                  if (selectedOption !== null) {
                    if (idx === currentQuestion.correctAnswer) state = 'correct';
                    else if (idx === selectedOption) state = 'wrong';
                    else state = 'disabled';
                  }

                  return (
                    <motion.button
                      key={idx}
                      disabled={selectedOption !== null}
                      onClick={() => handleAnswer(idx)}
                      whileTap={state === 'default' ? { scale: 0.98 } : {}}
                      className={`
                        w-full p-5 text-left rounded-[2rem] font-bold transition-all border-2 flex items-center gap-4
                        ${state === 'default' ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : ''}
                        ${state === 'correct' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : ''}
                        ${state === 'wrong' ? 'bg-rose-500/20 border-rose-50 border-rose-500 text-rose-400 animate-shake' : ''}
                        ${state === 'disabled' ? 'opacity-30' : ''}
                      `}
                    >
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0
                        ${state === 'default' ? 'bg-white/10 text-white/50' : ''}
                        ${state === 'correct' ? 'bg-emerald-500 text-white' : ''}
                        ${state === 'wrong' ? 'bg-rose-500 text-white' : ''}
                      `}>
                        {['A', 'B', 'C', 'D'][idx]}
                      </div>
                      <span className="flex-1 text-base md:text-lg tracking-tight leading-tight">
                        {option}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    );
  };

  const renderDuelSelection = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar"
    >
      <header className="shrink-0 px-6 pt-12 pb-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 relative z-10">
        <button 
          onClick={() => setScreen('home')}
          className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight">Online Duelle</h1>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Wähle deinen Modus</p>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 space-y-6 pb-32">
        
        {/* Ranked Matchmaking */}
        <motion.div variants={itemVariants}>
          <Card 
            className="p-6 border-none shadow-premium dark:shadow-none hover:shadow-premium-hover group cursor-pointer bg-gradient-to-br from-blue-500 to-indigo-600 text-white relative overflow-hidden"
            onClick={() => setScreen('matchmaking')}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20">
                  <Crosshair size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-display font-black mb-1 tracking-tight">Gegner finden</h3>
                <p className="text-blue-100 text-xs font-medium max-w-[200px]">
                  Öffentliche Matches gegen Spieler auf deinem Niveau.
                </p>
              </div>
              <ArrowRight size={24} className="text-white/50 group-hover:text-white group-hover:translate-x-2 transition-all" />
            </div>
          </Card>
        </motion.div>

        {/* 2v2 Mode */}
        <motion.div variants={itemVariants}>
          <Card 
            className="p-6 border-none shadow-premium dark:shadow-none hover:shadow-premium-hover group cursor-pointer bg-white dark:bg-slate-900 relative overflow-hidden"
            onClick={() => {
              setSearchMode('2v2' as any);
              setScreen('matchmaking');
            }}
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mb-4 border border-amber-100 dark:border-amber-900/50">
                  <Users size={24} className="text-amber-500" />
                </div>
                <h3 className="text-xl font-display font-black mb-1 tracking-tight text-slate-900 dark:text-white">2 gegen 2</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium max-w-[200px]">
                  Team-Duell! Spiele mit einem Partner gegen ein anderes Team.
                </p>
              </div>
              <ArrowRight size={24} className="text-slate-300 dark:text-slate-600 group-hover:text-amber-500 group-hover:translate-x-2 transition-all" />
            </div>
          </Card>
        </motion.div>

        {/* Private Lobby Create */}
        <motion.div variants={itemVariants}>
          <Card 
            className="p-6 border-none shadow-premium dark:shadow-none hover:shadow-premium-hover group cursor-pointer bg-white dark:bg-slate-900 relative overflow-hidden"
            onClick={() => setScreen('createLobby')}
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mb-4 border border-purple-100 dark:border-purple-900/50">
                  <UserPlus size={24} className="text-purple-600" />
                </div>
                <h3 className="text-xl font-display font-black mb-1 tracking-tight text-slate-900 dark:text-white">Private Lobby</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium max-w-[200px]">
                  Eröffne einen Raum für bis zu 10 Freunde.
                </p>
              </div>
              <ArrowRight size={24} className="text-slate-300 dark:text-slate-600 group-hover:text-purple-600 group-hover:translate-x-2 transition-all" />
            </div>
          </Card>
        </motion.div>

        {/* Private Lobby Join */}
        <motion.div variants={itemVariants}>
          <Card 
            className="p-6 border-none shadow-premium dark:shadow-none hover:shadow-premium-hover group cursor-pointer bg-white dark:bg-slate-900 relative overflow-hidden"
            onClick={() => setScreen('joinLobby')}
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                  <Hash size={24} className="text-slate-600 dark:text-slate-400" />
                </div>
                <h3 className="text-xl font-display font-black mb-1 tracking-tight text-slate-900 dark:text-white">Mit Code beitreten</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium max-w-[200px]">
                  Tritt einer privaten Lobby bei.
                </p>
              </div>
              <ArrowRight size={24} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-600 group-hover:translate-x-2 transition-all" />
            </div>
          </Card>
        </motion.div>

      </main>
    </motion.div>
  );

  const renderCreateLobby = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar"
    >
      <header className="shrink-0 px-6 pt-12 pb-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 relative z-10">
        <button 
          onClick={() => setScreen('duelSelection')}
          className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight">Lobby erstellen</h1>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Privates Spiel</p>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 flex flex-col max-w-md mx-auto w-full pb-32">
        <motion.div variants={itemVariants} className="space-y-8 flex-1">
          
          {/* Max Players */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Maximale Spielerzahl</label>
            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 4, 6, 8, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setLobbyMaxPlayers(num)}
                  className={`py-4 rounded-2xl font-black text-lg transition-all border-2 ${
                    lobbyMaxPlayers === num ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Kategorie</label>
            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-6 px-6">
              <button
                onClick={() => setLobbyCategory('all')}
                className={`flex-shrink-0 px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                  lobbyCategory === 'all' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                Mix (Alle)
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setLobbyCategory(cat.id as CategoryId)}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                    lobbyCategory === cat.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>

          {/* Questions Count */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Anzahl Fragen</label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => setLobbyQuestionCount(num)}
                  className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                    lobbyQuestionCount === num ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Zeit pro Frage</label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 15, 20, 30].map((num) => (
                <button
                  key={num}
                  onClick={() => setLobbyTimer(num)}
                  className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                    lobbyTimer === num ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  {num}s
                </button>
              ))}
            </div>
          </div>

        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 pb-8">
          <Button 
            fullWidth 
            size="lg" 
            onClick={() => {
              setLobbyCode('X7K9P'); // Mock code
              setScreen('lobbyRoom');
            }}
            className="py-5 text-lg shadow-xl shadow-blue-500/20 dark:shadow-none"
          >
            Lobby jetzt eröffnen
          </Button>
        </motion.div>
      </main>
    </motion.div>
  );

  const renderJoinLobby = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar"
    >
      <header className="shrink-0 px-6 pt-12 pb-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 relative z-10">
        <button 
          onClick={() => {
            setJoinError('');
            setScreen('duelSelection');
          }}
          className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight">Beitreten</h1>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mit Code spielen</p>
        </div>
      </header>

      <main className="flex-1 px-6 py-12 flex flex-col max-w-md mx-auto w-full pb-32">
        <motion.div variants={itemVariants} className="space-y-8 flex-1">
          <div className="text-center space-y-2 mb-8">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Hash size={32} strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Code eingeben</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gib den 5-stelligen Code ein, den du vom Host erhalten hast.
            </p>
          </div>

          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="z.B. X7K9P" 
              className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-5 text-center text-3xl font-black tracking-[0.2em] text-slate-900 dark:text-white uppercase focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700"
              maxLength={5}
              onChange={(e) => {
                setJoinError('');
                setLobbyCode(e.target.value.toUpperCase());
              }}
              value={lobbyCode}
            />
            {joinError && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-500 text-sm font-bold text-center flex items-center justify-center gap-2"
              >
                <AlertCircle size={16} /> {joinError}
              </motion.p>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8">
          <Button 
            fullWidth 
            size="lg" 
            onClick={() => {
              if (lobbyCode.length === 5) {
                setScreen('lobbyRoom');
              } else {
                setJoinError('Bitte gib einen gültigen 5-stelligen Code ein.');
              }
            }}
            disabled={lobbyCode.length < 5}
            className="py-5 text-lg shadow-xl shadow-blue-500/20 dark:shadow-none"
          >
            Lobby beitreten
          </Button>
        </motion.div>
      </main>
    </motion.div>
  );

  const renderLobbyRoom = () => {
    const players = lobby ? Object.values(lobby.players) as MultiplayerPlayer[] : [];
    const hostId = lobby?.hostId || user?.uid;
    const maxPlayers = lobby?.maxPlayers || lobbyMaxPlayers;
    const emptySlots = Math.max(0, maxPlayers - players.length);

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full bg-slate-900 text-white overflow-y-auto no-scrollbar"
      >
        <header className="shrink-0 px-6 pt-12 pb-6 border-b border-white/10 flex justify-between items-center relative z-10 bg-slate-900/80 backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Privates Duell</span>
            <h1 className="text-2xl font-display font-black tracking-tight">Warteraum</h1>
          </div>
          <button 
            onClick={() => setScreen('duelSelection')}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all"
          >
            <LogOut size={20} strokeWidth={2.5} />
          </button>
        </header>

        <main className="flex-1 px-6 py-8 flex flex-col max-w-md mx-auto w-full space-y-8 pb-32">
          {/* Code Display */}
          <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lobby Code</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl font-display font-black tracking-[0.2em] text-white">{lobbyCode || 'X7K9P'}</span>
              <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors text-indigo-300">
                <Copy size={18} />
              </button>
            </div>
          </motion.div>

          {/* Player List */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex justify-between items-end px-2">
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">Spieler ({Math.max(1, players.length)}/{maxPlayers})</h3>
              {emptySlots > 0 && (
                <span className="text-[10px] font-bold text-indigo-400 animate-pulse">Wartet auf Gegner...</span>
              )}
            </div>
            
            <div className="space-y-3">
              {/* Actual Players */}
              {players.length > 0 ? (
                players.map((p) => {
                  const isHost = p.uid === hostId;
                  const isMe = p.uid === user?.uid;
                  
                  return (
                    <div key={p.uid} className={`bg-indigo-500/20 border border-indigo-500/30 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden ${isMe ? 'ring-1 ring-indigo-400/50' : ''}`}>
                      {isHost && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
                      <div className="w-12 h-12 bg-indigo-500/30 rounded-full flex items-center justify-center text-indigo-200 font-black text-lg overflow-hidden border border-indigo-500/30">
                        {p.photoURL ? (
                          <img src={p.photoURL} alt={p.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          p.displayName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-white text-lg flex items-center gap-2">
                          {p.displayName} {isMe && <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full ml-1">Du</span>}
                          {p.uid.startsWith('bot_') && <span className="text-[10px] bg-rose-500/30 text-rose-200 px-2 py-0.5 rounded-full ml-1">Bot</span>}
                          {isHost && <Crown size={14} className="text-amber-400" />}
                        </h4>
                        <p className="text-xs text-indigo-300 font-medium">
                          {isHost ? 'Host' : 'Spieler'} • {p.status === 'ready' ? 'Bereit' : 'Wartet'}
                        </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${p.status === 'ready' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`} />
                    </div>
                  );
                })
              ) : (
                /* Fallback if no players in lobby state yet (e.g. preview mode) */
                <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                  <div className="w-12 h-12 bg-indigo-500/30 rounded-full flex items-center justify-center text-indigo-200 font-black text-lg overflow-hidden border border-indigo-500/30">
                    {stats.customPhotoURL || user?.photoURL ? (
                      <img src={stats.customPhotoURL || user?.photoURL!} alt={stats.customName || user?.displayName || 'Profil'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      (stats.customName || user?.displayName) ? (stats.customName || user?.displayName)!.charAt(0).toUpperCase() : 'D'
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-white text-lg flex items-center gap-2">
                      {stats.customName || user?.displayName || 'Spieler 1'} <Crown size={14} className="text-amber-400" />
                    </h4>
                    <p className="text-xs text-indigo-300 font-medium">Host • Bereit</p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
              )}

              {/* Empty Slots */}
              {Array.from({ length: emptySlots > 0 ? emptySlots : (players.length === 0 ? maxPlayers - 1 : 0) }).map((_, idx) => (
                <div key={`empty-${idx}`} className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-4 flex items-center gap-4 opacity-50">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-slate-500">
                    <User size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-400 text-lg">Wartet...</h4>
                    <p className="text-xs text-slate-500 font-medium">Platz {Math.max(1, players.length) + idx + 1}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-slate-600 border-t-slate-400 animate-spin" />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-auto pt-8">
            <Button 
              fullWidth 
              size="lg" 
              disabled={players.length < 2 && lobbyMaxPlayers > 1} // Disabled until someone joins (if not testing alone)
              onClick={() => {
                // Start the quiz with lobby settings
                const cat = lobby?.categoryId || 'all';
                startQuiz(cat as any);
              }}
              className="py-6 rounded-[2rem] shadow-2xl text-xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-500/20 group relative overflow-hidden disabled:opacity-50 disabled:grayscale"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="flex items-center justify-center gap-3 relative z-10">
                Spiel starten
                <Swords size={22} className="group-hover:rotate-12 transition-transform" />
              </span>
            </Button>
            <p className="text-center text-[10px] font-bold text-slate-500 mt-4 uppercase tracking-widest">
              {maxPlayers > 4 ? 'Match-Format (1v1, 3p, 4p) wird beim Start gewählt' : 'Warte auf weitere Spieler'}
            </p>
          </motion.div>
        </main>
      </motion.div>
    );
  };

  const renderMatchmaking = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-y-auto no-scrollbar"
    >
      <header className="shrink-0 px-6 pt-12 pb-6 border-b border-slate-200 dark:border-white/10 flex items-center gap-4 relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <button 
          onClick={() => {
            setIsSearching(false);
            setScreen('duelSelection');
          }}
          className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl transition-all"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-2xl font-display font-black tracking-tight">Gegner finden</h1>
          <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Öffentliches Match</p>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 flex flex-col max-w-md mx-auto w-full pb-32">
        {!isSearching ? (
          <motion.div variants={itemVariants} className="space-y-8 flex-1">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Modus wählen</label>
              <div className="space-y-3">
                {[
                  { id: '1v1', title: '1 gegen 1', desc: 'Klassisches Duell', icon: User },
                  { id: '2v2', title: '2 gegen 2', desc: 'Team-Duell', icon: Users },
                  { id: '3p', title: '3 Spieler', desc: 'Jeder gegen Jeden', icon: Users },
                  { id: '4p', title: '4 Spieler', desc: 'Volles Haus', icon: Users }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSearchMode(mode.id as any)}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                      searchMode === mode.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-900 dark:text-white' 
                        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      searchMode === mode.id ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                    }`}>
                      <mode.icon size={24} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-black text-lg">{mode.title}</h4>
                      <p className="text-xs font-medium opacity-70">{mode.desc}</p>
                    </div>
                    {searchMode === mode.id && <CheckCircle2 size={24} className="ml-auto text-blue-500 dark:text-blue-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-8">
              <Button 
                fullWidth 
                size="lg" 
                disabled={!searchMode}
                onClick={() => {
                  setMatchFound(false);
                  setIsSearching(true);
                }}
                className="py-5 text-lg shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 text-white"
              >
                Suche starten
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
          >
            <div className="relative w-48 h-48 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 2, 2.5], opacity: [0.5, 0.2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 bg-blue-500 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                className="absolute inset-0 bg-indigo-500 rounded-full"
              />
              <div className="relative z-10 w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                <Radar size={40} className="animate-spin-slow" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{matchFound ? 'Gegner gefunden!' : 'Suche Gegner...'}</h3>
              <p className="text-blue-600 dark:text-blue-300 font-medium">Modus: {searchMode === '1v1' ? '1 gegen 1' : searchMode === '2v2' ? '2 gegen 2' : searchMode === '3p' ? '3 Spieler' : '4 Spieler'}</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Dein Rang: {onlineProfile.rankInfo.league} ({onlineProfile.rankInfo.rating})</p>
            </div>

            {matchFound ? (
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full border-4 border-blue-500 p-1">
                    <img src={stats.customPhotoURL || user?.photoURL || 'https://picsum.photos/seed/me/200/200'} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <span className="font-black text-xs">{stats.customName || user?.displayName || 'Du'}</span>
                </div>
                <div className="text-2xl font-black text-blue-500 animate-pulse">VS</div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full border-4 border-rose-500 p-1">
                    <img src={(Object.values(lobby?.players || {}) as MultiplayerPlayer[]).find(p => p.uid.startsWith('bot_'))?.photoURL || 'https://picsum.photos/seed/bot/200/200'} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <span className="font-black text-xs">{(Object.values(lobby?.players || {}) as MultiplayerPlayer[]).find(p => p.uid.startsWith('bot_'))?.displayName || 'Gegner'}</span>
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setIsSearching(false)}
                className="border-slate-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
              >
                Suche abbrechen
              </Button>
            )}
          </motion.div>
        )}
      </main>
    </motion.div>
  );

  const renderRankings = () => {
    const currentLeagueInfo = getLeagueForRating(onlineProfile.rankInfo.rating);
    const nextLeagueInfo = getNextLeague(currentLeagueInfo.name);
    const progress = nextLeagueInfo 
      ? ((onlineProfile.rankInfo.rating - currentLeagueInfo.minRating) / (nextLeagueInfo.minRating - currentLeagueInfo.minRating)) * 100
      : 100;

    return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar"
    >
      <header className="shrink-0 px-6 pt-12 pb-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 relative z-10">
        <button 
          onClick={() => setScreen('duelSelection')}
          className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight">Liga & Rang</h1>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Saison 1</p>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 space-y-6 pb-32 max-w-md mx-auto w-full">
        
        {/* Current Rank Card */}
        <motion.div variants={itemVariants}>
          <Card className={`p-8 border-none shadow-premium dark:shadow-none bg-gradient-to-br ${currentLeagueInfo.color} text-white text-center relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
            
            <div className={`w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)] mb-6 border-4 border-white/20 backdrop-blur-sm`}>
              <Shield size={48} className="text-white drop-shadow-md" />
            </div>
            
            <h2 className="text-3xl font-display font-black tracking-tight mb-1">{currentLeagueInfo.name}</h2>
            <p className="text-white/80 font-bold text-lg mb-8">{onlineProfile.rankInfo.rating} RP</p>
            
            <div className="space-y-2 text-left">
              <div className="flex justify-between text-xs font-bold text-white/90">
                <span>{nextLeagueInfo ? `Fortschritt zu ${nextLeagueInfo.name}` : 'Höchster Rang erreicht'}</span>
                <span>{nextLeagueInfo ? `${onlineProfile.rankInfo.rating} / ${nextLeagueInfo.minRating}` : 'MAX'}</span>
              </div>
              <div className="h-3 bg-black/20 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          <Card className="p-4 border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Trophy size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Siege</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{onlineProfile.rankInfo.wins}</p>
          </Card>
          <Card className="p-4 border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 flex items-center justify-center mb-3">
              <Activity size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Win Rate</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {Math.round((onlineProfile.rankInfo.wins / onlineProfile.rankInfo.matchesPlayed) * 100)}%
            </p>
          </Card>
        </motion.div>

        {/* Match History Preview */}
        <motion.div variants={itemVariants}>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Letzte Matches</h3>
          <Card className="p-4 border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Sieg (1v1)</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Vor 2 Stunden</p>
                </div>
              </div>
              <span className="font-black text-emerald-500 dark:text-emerald-400">+24 RP</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 flex items-center justify-center">
                  <TrendingDown size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Niederlage (4p)</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Gestern</p>
                </div>
              </div>
              <span className="font-black text-rose-500 dark:text-rose-400">-12 RP</span>
            </div>
          </Card>
        </motion.div>

      </main>
    </motion.div>
  );
  };

  const renderQuiz = () => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (!currentQuestion) return null;

    const progress = isEndless ? 100 : ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

    const isDaily = selectedCategory === 'daily';
    const isReview = selectedCategory === 'review';

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`flex flex-col h-full transition-colors duration-500 ${
        selectedOption !== null 
          ? (selectedOption === currentQuestion.correctAnswer ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : 'bg-rose-50/30 dark:bg-rose-900/10') 
          : (isDaily ? 'bg-amber-50/20 dark:bg-amber-950/10' : isReview ? 'bg-rose-50/10 dark:bg-rose-950/10' : 'bg-[#F8FAFC] dark:bg-slate-950')
      }`}>
        {/* Top Progress Bar */}
        {!isEndless && (
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative z-50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-full ${isDaily ? 'bg-gradient-to-r from-amber-400 to-orange-500' : isReview ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500'}`}
            />
          </div>
        )}

        <header className="shrink-0 px-6 py-6 flex justify-between items-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setScreen('home')}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X size={24} strokeWidth={2.5} />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                {isDaily ? 'Daily Challenge' : isReview ? 'Review Mode' : 'Quiz'}
              </span>
              <div className="flex items-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <Heart 
                    key={i}
                    size={14} 
                    className={i < lives ? "text-rose-500" : "text-slate-200 dark:text-slate-800"} 
                    fill={i < lives ? "currentColor" : "none"} 
                    strokeWidth={2.5}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {maxTime > 0 ? (
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-50 dark:text-slate-900" />
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray="125.6"
                    animate={{ 
                      strokeDashoffset: 125.6 - (125.6 * timeLeft) / maxTime,
                      stroke: timeLeft < 5 ? "#ef4444" : "#3b82f6"
                    }}
                    transition={{ duration: 1, ease: "linear" }}
                    strokeLinecap="round"
                  />
                </svg>
                <span className={`absolute text-sm font-black tabular-nums ${timeLeft < 5 ? "text-rose-600 animate-pulse" : "text-slate-700 dark:text-slate-200"}`}>
                  {timeLeft}
                </span>
              </div>
            ) : (
              <div className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-full">
                <Zap size={20} className="text-blue-500" />
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Trophy size={16} className="text-blue-500" fill="currentColor" />
              <span className="text-sm font-black tabular-nums text-slate-900 dark:text-white">
                <CountUp end={score} duration={0.5} />
              </span>
            </div>
          </div>
        </header>

        {/* Main Quiz Area */}
        <main className="flex-1 px-6 py-8 overflow-y-auto no-scrollbar flex flex-col max-w-2xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="flex-1 flex flex-col"
            >
              {/* Question Context */}
              <div className="mb-6 flex justify-between items-center">
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (stats.powerUps?.fiftyFifty && stats.powerUps.fiftyFifty > 0 && !activeFiftyFifty.includes(currentQuestionIndex) && selectedOption === null) {
                        usePowerUp('fiftyFifty');
                        setActiveFiftyFifty([...activeFiftyFifty, currentQuestionIndex]);
                        
                        // Find 2 incorrect options
                        const incorrectIndices = currentQuestion.options
                          .map((_, idx) => idx)
                          .filter(idx => idx !== currentQuestion.correctAnswer);
                        
                        // Shuffle and pick 2
                        const shuffled = incorrectIndices.sort(() => 0.5 - Math.random());
                        setEliminatedOptions(shuffled.slice(0, 2));
                      }
                    }}
                    disabled={selectedOption !== null || activeFiftyFifty.includes(currentQuestionIndex) || !(stats.powerUps?.fiftyFifty)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${activeFiftyFifty.includes(currentQuestionIndex) ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'} disabled:opacity-50`}
                  >
                    <span>50:50</span>
                    <span className="bg-white/20 px-1.5 rounded-md">{stats.powerUps?.fiftyFifty || 0}</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (stats.powerUps?.timeFreeze && stats.powerUps.timeFreeze > 0 && !isTimeFrozen && selectedOption === null) {
                        usePowerUp('timeFreeze');
                        setIsTimeFrozen(true);
                      }
                    }}
                    disabled={selectedOption !== null || isTimeFrozen || !(stats.powerUps?.timeFreeze)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${isTimeFrozen ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'} disabled:opacity-50`}
                  >
                    <span>❄️</span>
                    <span className="bg-white/20 px-1.5 rounded-md">{stats.powerUps?.timeFreeze || 0}</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (stats.powerUps?.secondChance && stats.powerUps.secondChance > 0 && !hasSecondChance && selectedOption === null) {
                        usePowerUp('secondChance');
                        setHasSecondChance(true);
                      }
                    }}
                    disabled={selectedOption !== null || hasSecondChance || !(stats.powerUps?.secondChance)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${hasSecondChance ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'} disabled:opacity-50`}
                  >
                    <span>❤️</span>
                    <span className="bg-white/20 px-1.5 rounded-md">{stats.powerUps?.secondChance || 0}</span>
                  </button>
                </div>
                <span className="px-4 py-1.5 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 text-[10px] font-black rounded-xl uppercase tracking-widest border border-slate-100 dark:border-slate-800">
                  {isEndless ? `Frage ${currentQuestionIndex + 1}` : `Frage ${currentQuestionIndex + 1} von ${quizQuestions.length}`}
                </span>
              </div>

              {/* Question Card */}
              <div className="mb-12 text-center px-6 py-12 bg-white dark:bg-slate-950 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-900 relative overflow-hidden group/q">
                {selectedOption === -1 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-rose-500/10 flex items-center justify-center z-20 backdrop-blur-[2px]"
                  >
                    <span className="bg-rose-600 text-white px-6 py-2 rounded-xl font-black text-sm shadow-lg shadow-rose-500/20 animate-bounce">
                      Zeit abgelaufen! ⏰
                    </span>
                  </motion.div>
                )}

                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight text-balance relative z-10">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Question Image (e.g. Flags) */}
              {currentQuestion.imageUrl && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 flex justify-center"
                >
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                    <img 
                      src={currentQuestion.imageUrl} 
                      alt="Question" 
                      className="max-h-48 md:max-h-64 w-auto object-contain rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </motion.div>
              )}

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-4 mb-10 relative">
                {selectedOption !== null && selectedOption === currentQuestion.correctAnswer && <Confetti />}
                {currentQuestion.options.map((option, idx) => {
                  if (eliminatedOptions.includes(idx)) {
                    return (
                      <div key={idx} className="w-full p-5 text-left rounded-3xl border-2 border-transparent opacity-0 pointer-events-none">
                        {/* Placeholder to keep layout stable */}
                      </div>
                    );
                  }

                  let state = 'default';
                  if (selectedOption !== null) {
                    if (idx === currentQuestion.correctAnswer) state = 'correct';
                    else if (idx === selectedOption) state = 'wrong';
                    else state = 'disabled';
                  }

                  return (
                    <motion.button
                      key={idx}
                      disabled={selectedOption !== null}
                      onClick={() => handleAnswer(idx)}
                      whileHover={state === 'default' ? { scale: 1.01, x: 4 } : {}}
                      whileTap={state === 'default' ? { scale: 0.99 } : {}}
                      className={`
                        w-full p-5 text-left rounded-3xl font-bold transition-all border-2 flex items-center gap-4 group relative overflow-hidden
                        ${state === 'default' ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500/50' : ''}
                        ${state === 'correct' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400' : ''}
                        ${state === 'wrong' ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-500 text-rose-700 dark:text-rose-400 animate-shake' : ''}
                        ${state === 'disabled' ? 'bg-slate-50 dark:bg-slate-900/50 border-transparent text-slate-300 dark:text-slate-700' : ''}
                      `}
                    >
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-all
                        ${state === 'default' ? 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-500 group-hover:text-white' : ''}
                        ${state === 'correct' ? 'bg-emerald-500 text-white' : ''}
                        ${state === 'wrong' ? 'bg-rose-500 text-white' : ''}
                        ${state === 'disabled' ? 'bg-slate-100 dark:bg-slate-800 text-slate-300' : ''}
                      `}>
                        {['A', 'B', 'C', 'D'][idx]}
                      </div>

                      <span className="flex-1 text-base md:text-lg tracking-tight leading-tight">
                        {option}
                      </span>

                      {state === 'correct' && <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />}
                      {state === 'wrong' && <XCircle size={24} className="text-rose-500 shrink-0" />}
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation Section */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-auto"
                  >
                    <div className={`p-6 rounded-[2.5rem] border-2 ${
                      selectedOption === currentQuestion.correctAnswer 
                        ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30' 
                        : 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30'
                    }`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                          selectedOption === currentQuestion.correctAnswer ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}>
                          {selectedOption === currentQuestion.correctAnswer ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                        </div>
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${
                            selectedOption === currentQuestion.correctAnswer ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {selectedOption === currentQuestion.correctAnswer ? 'Richtig!' : 'Falsch!'}
                          </p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Wusstest du schon?</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Action Area */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div 
              initial={{ y: 120 }}
              animate={{ y: 0 }}
              exit={{ y: 120 }}
              className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 rounded-t-[3.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_-20px_60px_rgba(0,0,0,0.3)] relative z-50"
            >
              {/* Auto-advance indicator */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
                <motion.div 
                  key={currentQuestionIndex}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 8, ease: "linear" }}
                  className="h-full bg-blue-500"
                />
              </div>

              <Button 
                fullWidth 
                onClick={nextQuestion} 
                size="lg" 
                className="py-6 rounded-[2rem] shadow-2xl shadow-blue-200 dark:shadow-none text-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              >
                {currentQuestionIndex + 1 === quizQuestions.length || lives === 0 ? 'Ergebnis ansehen' : 'Nächste Frage'}
                <ArrowRight size={24} className="ml-3" strokeWidth={3} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderResult = () => {
    const isDaily = selectedCategory === 'daily';
    const isBlitz = selectedCategory === 'blitz';
    const totalQuestions = (isBlitz || isEndless) ? (lives <= 0 ? currentQuestionIndex + 1 : currentQuestionIndex) : quizQuestions.length;
    const correctAnswersCount = quizQuestions.filter((q, idx) => idx < totalQuestions && userAnswers[idx] === q.correctAnswer).length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0;
    
    // Performance-based messages
    const getPerformanceMessage = () => {
      if (isBlitz) {
        if (correctAnswersCount >= 25) return { 
          title: 'Blitz-Legende!', 
          sub: `Wahnsinn! Du hast ${correctAnswersCount} Fragen in 60 Sekunden geknackt.`, 
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          icon: <Zap className="text-amber-500" size={48} fill="currentColor" />
        };
        if (correctAnswersCount >= 15) return { 
          title: 'Blitz-Profi!', 
          sub: `${correctAnswersCount} richtige Antworten! Dein Gehirn läuft auf Hochtouren.`, 
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          icon: <Zap className="text-blue-500" size={48} fill="currentColor" />
        };
        return { 
          title: 'Blitz-Starter!', 
          sub: `${correctAnswersCount} richtige Antworten. Nächstes Mal knackst du die 15!`, 
          color: 'text-slate-600 dark:text-slate-400',
          bg: 'bg-slate-50 dark:bg-slate-900/20',
          icon: <Zap className="text-slate-400" size={48} fill="currentColor" />
        };
      }

      if (selectedCategory === 'review') {
        if (accuracy === 100) return { 
          title: 'Fehler gemeistert!', 
          sub: 'Du hast alle deine Fehler korrigiert. Dein Wissen ist jetzt lückenlos!', 
          color: 'text-rose-600 dark:text-rose-400',
          bg: 'bg-rose-50 dark:bg-rose-900/20',
          icon: <CheckCircle2 className="text-rose-500" size={48} />
        };
        return { 
          title: 'Guter Fortschritt!', 
          sub: `Du hast ${correctAnswersCount} von ${totalQuestions} Fehlern korrigiert. Bleib dran!`, 
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          icon: <RotateCcw className="text-amber-500" size={48} />
        };
      }
      
      if (accuracy === 100) return { 
        title: 'Perfektion!', 
        sub: 'Du hast jede einzelne Frage absolut korrekt beantwortet. Wahnsinn!', 
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        icon: <Crown className="text-amber-500" size={48} />
      };
      if (accuracy >= 80) return { 
        title: 'Herausragend!', 
        sub: 'Dein Wissen ist auf einem extrem hohen Niveau. Fast perfekt!', 
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        icon: <Trophy className="text-emerald-500" size={48} />
      };
      if (accuracy >= 60) return { 
        title: 'Starke Leistung!', 
        sub: 'Ein wirklich gutes Ergebnis. Du kennst dich super aus!', 
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        icon: <Star className="text-blue-500" size={48} />
      };
      if (accuracy >= 40) return { 
        title: 'Gut gemacht!', 
        sub: 'Du hast ein solides Fundament. Mit jeder Runde wirst du besser.', 
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        icon: <Target className="text-indigo-500" size={48} />
      };
      return { 
        title: 'Dranbleiben!', 
        sub: 'Aller Anfang ist schwer. Spiel noch eine Runde und lerne dazu!', 
        color: 'text-slate-600 dark:text-slate-400',
        bg: 'bg-slate-50 dark:bg-slate-900/20',
        icon: <RotateCcw className="text-slate-400" size={48} />
      };
    };

    const message = getPerformanceMessage();
    const isSuccess = accuracy >= 50 || isBlitz;
    const isReview = selectedCategory === 'review';
    const today = new Date().toISOString().split('T')[0];
    const earnedDailyBonus = isDaily && stats.lastDailyRewardDate === today;
    const levelInfo = getLevelInfo(stats.totalPoints);

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full bg-slate-50/30 dark:bg-slate-950/30 px-6 py-10 text-center overflow-y-auto no-scrollbar relative"
      >
        {/* Background Decoration */}
        <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b via-white dark:via-slate-950 to-transparent -z-10 ${isDaily ? 'from-amber-50/50 dark:from-amber-900/20' : isReview ? 'from-rose-50/50 dark:from-rose-900/20' : isBlitz ? 'from-orange-50/50 dark:from-orange-900/20' : 'from-blue-50/50 dark:from-blue-900/20'}`} />
        
        <div className="flex-1 flex flex-col items-center py-4 max-w-md mx-auto w-full">
          {/* Main Visual Header */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            className="relative mb-10 mt-4"
          >
            {/* Animated Rings */}
            <AnimatePresence>
              {(isSuccess || isReview || isBlitz) && (
                <>
                  <motion.div 
                    animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={`absolute inset-0 rounded-full blur-3xl -z-10 ${isDaily ? 'bg-amber-400' : isReview ? 'bg-rose-400' : isBlitz ? 'bg-orange-400' : 'bg-blue-400'}`}
                  />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-full opacity-40 -z-10"
                  />
                </>
              )}
            </AnimatePresence>

            <div className={`w-40 h-40 rounded-[3.5rem] flex items-center justify-center shadow-2xl relative z-10 bg-white dark:bg-slate-900 border-8 ${accuracy >= 80 || isBlitz ? 'border-amber-100 dark:border-amber-900/30' : isReview ? 'border-rose-100 dark:border-rose-900/30' : 'border-slate-50 dark:border-slate-800'}`}>
              <motion.div
                initial={{ rotate: -20, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                {isBlitz ? <Zap size={80} className="text-orange-500" fill="currentColor" /> :
                 isReview ? <RotateCcw size={80} className="text-rose-500" /> :
                 accuracy === 100 ? <Crown size={80} className="text-amber-500" fill="currentColor" /> :
                 accuracy >= 70 ? <Trophy size={80} className="text-amber-400" fill="currentColor" /> :
                 <Star size={80} className="text-blue-400" fill="currentColor" />}
              </motion.div>
              
              {(accuracy >= 90 || (isReview && accuracy === 100)) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, x: 20, y: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -top-3 -right-3 bg-emerald-500 text-white p-2.5 rounded-2xl shadow-lg border-4 border-white dark:border-slate-900"
                >
                  <Check size={20} strokeWidth={4} />
                </motion.div>
              )}
            </div>
          </motion.div>
          
          {/* Message Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h1 className={`text-4xl md:text-5xl font-display font-black mb-3 tracking-tight ${message.color}`}>
              {message.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-[320px] mx-auto leading-relaxed text-base md:text-lg px-4">
              {message.sub}
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="w-full space-y-4 mb-10">
            {/* Score Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-premium border border-slate-100 dark:border-slate-800 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
              
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-3">Deine Punkte</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-display font-black text-slate-900 dark:text-white">
                    <CountUp end={score} start={0} duration={2} />
                  </span>
                  <span className="text-xl font-black text-blue-500/50 dark:text-blue-400/30">pts</span>
                </div>

                <div className="mt-6 flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Schwierigkeit</span>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {selectedDifficulty === 'all' ? 'Gemischt' : 
                       selectedDifficulty === 'leicht' ? 'Leicht' : 
                       selectedDifficulty === 'mittel' ? 'Mittel' : 'Schwer'}
                    </span>
                  </div>
                  <div className="w-[1px] h-8 bg-slate-100 dark:bg-slate-800" />
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Richtig</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{correctAnswersCount} / {totalQuestions}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-100 dark:bg-slate-800" />
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Genauigkeit</span>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">{accuracy}%</span>
                  </div>
                </div>
              </div>

              {earnedDailyBonus && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-center gap-2"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-400 text-white flex items-center justify-center shadow-sm">
                    <Star size={12} fill="currentColor" />
                  </div>
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">+50 Daily Bonus erhalten</span>
                </motion.div>
              )}
            </motion.div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-slate-100 dark:border-slate-800 flex flex-col items-center shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400 flex items-center justify-center mb-2">
                  <Flame size={20} fill="currentColor" />
                </div>
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Streak</span>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.currentStreak}</span>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-slate-100 dark:border-slate-800 flex flex-col items-center shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 flex items-center justify-center mb-2">
                  <Trophy size={20} />
                </div>
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Runden</span>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.roundsPlayed}</span>
              </motion.div>
            </div>

            {/* Level Progress */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 shadow-premium border border-slate-100 dark:border-slate-800 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-2xl shadow-inner dark:shadow-none ${getLevelInfo(stats.totalPoints).color}`}>
                    {getLevelInfo(stats.totalPoints).icon}
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1.5">Dein Rang</p>
                    <h4 className={`font-black text-base tracking-tight leading-none ${getLevelInfo(stats.totalPoints).color}`}>{getLevelInfo(stats.totalPoints).name}</h4>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-1">LVL</span>
                  <span className="font-black text-sm text-slate-900 dark:text-white">{getLevelInfo(stats.totalPoints).level}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${getLevelInfo(stats.totalPoints).progress}%` }}
                    transition={{ duration: 2, ease: "circOut", delay: 1 }}
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full shadow-lg"
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {Math.round(getLevelInfo(stats.totalPoints).progress)}%
                  </span>
                  {getLevelInfo(stats.totalPoints).pointsToNext > 0 && (
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      +{getLevelInfo(stats.totalPoints).pointsToNext} bis {getLevelInfo(stats.totalPoints).nextLevelName}
                    </span>
                  )}
                </div>
              </div>

              {isLevelUp && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 bg-blue-600/95 flex flex-col items-center justify-center text-white z-20 rounded-[2.5rem]"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                    className="mb-2"
                  >
                    <Trophy size={40} fill="currentColor" className="text-amber-400" />
                  </motion.div>
                  <h3 className="text-xl font-display font-black uppercase tracking-tighter">Level Up!</h3>
                  <p className="text-[10px] font-black opacity-80 uppercase tracking-widest mt-1">Du bist jetzt {getLevelInfo(stats.totalPoints).name}</p>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="mt-4 bg-white text-blue-600 border-none px-6 py-2 rounded-xl text-[10px] font-black"
                    onClick={() => setIsLevelUp(false)}
                  >
                    Großartig!
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* Weekly Goal Progress */}
            {stats.weeklyGoal && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-premium border border-slate-100 dark:border-slate-800 relative overflow-hidden ${stats.weeklyGoal.current >= stats.weeklyGoal.target ? 'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800' : ''}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${stats.weeklyGoal.current >= stats.weeklyGoal.target ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'} flex items-center justify-center`}>
                      {stats.weeklyGoal.current >= stats.weeklyGoal.target ? <CheckCircle2 size={16} /> : <Target size={16} />}
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Wochenziel</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {stats.weeklyGoal.type === 'rounds' && 'Quizrunden'}
                        {stats.weeklyGoal.type === 'correctAnswers' && 'Richtige Antworten'}
                        {stats.weeklyGoal.type === 'dailyChallenges' && 'Daily Challenges'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Fortschritt</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{stats.weeklyGoal.current} / {stats.weeklyGoal.target}</p>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (stats.weeklyGoal.current / stats.weeklyGoal.target) * 100)}%` }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className={`h-full rounded-full ${stats.weeklyGoal.current >= stats.weeklyGoal.target ? 'bg-emerald-500' : 'bg-blue-500'}`}
                  />
                </div>
                
                {stats.weeklyGoal.current >= stats.weeklyGoal.target && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2 }}
                    className="mt-3 flex items-center justify-center gap-2"
                  >
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Wochenziel erreicht! 🎉</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="w-full space-y-4"
          >
            {stats.wrongQuestions && stats.wrongQuestions.length > 0 && (
              <Button 
                fullWidth 
                onClick={() => setScreen('review')} 
                size="lg" 
                className="py-6 rounded-[2rem] shadow-2xl text-xl bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-200 dark:shadow-none group relative overflow-hidden text-white"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="flex items-center justify-center gap-3 relative z-10">
                  Fehler wiederholen
                  <RotateCcw size={22} className="group-hover:-rotate-180 transition-transform duration-700" />
                </span>
              </Button>
            )}
            
            <Button 
              fullWidth 
              onClick={() => startQuiz(selectedCategory)} 
              size="lg" 
              className={`py-6 rounded-[2rem] shadow-2xl text-xl group relative overflow-hidden text-white ${isDaily ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-200 dark:shadow-none' : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200 dark:shadow-none'}`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="flex items-center justify-center gap-3 relative z-10">
                Nochmal spielen
                <RotateCcw size={22} className="group-hover:rotate-180 transition-transform duration-700" />
              </span>
            </Button>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                fullWidth 
                variant="secondary" 
                onClick={() => setScreen('home')} 
                className="py-4 rounded-[1.5rem] border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                Startseite
              </Button>
              <Button 
                fullWidth 
                variant="secondary" 
                onClick={() => {
                  setScreen('home');
                  setTimeout(() => {
                    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }} 
                className={`py-4 rounded-[1.5rem] border-slate-200 dark:border-slate-800 font-black text-[11px] uppercase tracking-[0.2em] transition-all ${isDaily ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/20' : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'}`}
              >
                Kategorien
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const renderLeaderboard = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50 scroll-smooth overflow-y-auto no-scrollbar"
    >
      <motion.header variants={itemVariants} className="shrink-0 px-6 pt-12 pb-6 bg-white dark:bg-slate-900 rounded-b-[3rem] shadow-sm dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 dark:bg-blue-900/20 rounded-full blur-2xl -mr-16 -mt-16" />
        <div className="flex items-center justify-between relative z-10 mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setScreen('home')} className="p-2.5 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight">Leaderboard</h1>
          </div>
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
            <TrendingUp size={22} strokeWidth={2.5} />
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl relative z-10">
          <button
            onClick={() => setLeaderboardTab('global')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${leaderboardTab === 'global' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            Global
          </button>
          <button
            onClick={() => setLeaderboardTab('friends')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${leaderboardTab === 'friends' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            Freunde
          </button>
        </div>
      </motion.header>

      <main className="flex-1 px-6 py-8 space-y-4 pb-32 max-w-2xl mx-auto w-full">
        {leaderboardTab === 'friends' ? (
          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-300 dark:text-blue-700 rounded-full flex items-center justify-center mb-4">
              <Users size={40} />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2">Freunde finden</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[250px] mx-auto leading-relaxed">
              Die Freundesliste wird in einem zukünftigen Update hinzugefügt. Bald kannst du dich hier mit deinen Freunden messen!
            </p>
          </motion.div>
        ) : (
          leaderboard.map((entry, idx) => {
            const isTop3 = idx < 3;
            const rankColors = [
              'bg-amber-400 text-white shadow-amber-200 dark:shadow-none',
              'bg-slate-300 text-white shadow-slate-200 dark:shadow-none',
              'bg-amber-600 text-white shadow-amber-700/20 dark:shadow-none'
            ];

            return (
              <motion.div 
                key={entry.uid} 
                variants={itemVariants}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`flex items-center p-5 rounded-[2rem] bg-white dark:bg-slate-900 shadow-premium border-2 transition-all ${entry.uid === user?.uid ? 'border-blue-500/20 dark:border-blue-500/40 bg-blue-50/30 dark:bg-blue-900/20' : 'border-transparent'}`}
              >
                <div className="w-10 flex justify-center mr-2">
                  {isTop3 ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-lg ${rankColors[idx]}`}>
                      {idx + 1}
                    </div>
                  ) : (
                    <div className="font-black text-slate-300 dark:text-slate-700 text-base">#{idx + 1}</div>
                  )}
                </div>
                
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden mr-4 border-2 border-white dark:border-slate-800 shadow-sm ring-2 ring-slate-50 dark:ring-slate-950">
                  {entry.photoURL ? (
                    <img src={entry.photoURL} alt={entry.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold text-lg">
                      {entry.displayName.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm leading-tight tracking-tight">{entry.displayName}</h4>
                  <p className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-black tracking-widest mt-1">
                    {idx === 0 ? '🏆 Großmeister' : idx < 5 ? '🔥 Experte' : '🧠 Entdecker'}
                  </p>
                </div>
                
                <div className="text-right">
                  <span className="text-xl font-display font-black text-blue-600 dark:text-blue-400">{entry.totalPoints.toLocaleString()}</span>
                  <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Punkte</p>
                </div>
              </motion.div>
            );
          })
        )}
      </main>
    </motion.div>
  );

  const renderProfile = () => {
    const levelInfo = getLevelInfo(stats.totalPoints);
    const successRate = stats.totalQuestionsAnswered > 0 
      ? Math.round((stats.correctAnswers / stats.totalQuestionsAnswered) * 100) 
      : 0;

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 200;
            const MAX_HEIGHT = 200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            const updatedStats = saveCustomPhoto(resizedDataUrl);
            setStats(updatedStats);
            if (user) {
              syncUserStats(updatedStats);
            }
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-y-auto no-scrollbar"
      >
        <header className="shrink-0 px-6 pt-12 pb-12 flex flex-col items-center text-center bg-slate-50 dark:bg-slate-900 rounded-b-[3rem]">
          <div className="w-full flex justify-between mb-8">
            <button 
              onClick={() => {
                const isEnabled = soundManager.toggleSound();
                setSoundEnabled(isEnabled);
              }}
              className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
            >
              {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
            <button 
              onClick={() => setScreen('settings')}
              className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
            >
              <Settings size={24} />
            </button>
          </div>

          <div className="relative mb-6">
            <div 
              className="w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 overflow-hidden cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {stats.customPhotoURL || user?.photoURL ? (
                <img 
                  src={stats.customPhotoURL || user?.photoURL!} 
                  alt="Profile" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <span className="text-5xl">{levelInfo.icon}</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex items-center justify-center border border-slate-100 dark:border-slate-700">
              <span className="text-xs font-black text-blue-600">{levelInfo.level}</span>
            </div>
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.customName || user?.displayName || 'Dein Profil'}
          </h1>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1">{levelInfo.name}</p>
          {stats.equippedTitle && (
            <span className="mt-2 text-xs font-black text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              {stats.equippedTitle}
            </span>
          )}
        </header>

        <main className="flex-1 px-6 py-10 pb-32 space-y-8 max-w-md mx-auto w-full">
          <div className="grid grid-cols-2 gap-4">
            <div className="card-minimal p-6 flex flex-col items-center">
              <Trophy size={24} className="text-amber-500 mb-2" fill="currentColor" />
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">{stats.totalPoints}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Punkte</span>
            </div>
            <div className="card-minimal p-6 flex flex-col items-center">
              <Target size={24} className="text-blue-500 mb-2" />
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">{successRate}%</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Erfolg</span>
            </div>
          </div>

          <div className="card-minimal p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level Fortschritt</span>
              <span className="text-[10px] font-black text-blue-600">{Math.round(levelInfo.progress)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              fullWidth 
              variant="outline" 
              onClick={() => setScreen('shop')}
              className="py-4 justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500">
                  <Coins size={16} />
                </div>
                <span className="font-bold text-sm">Shop & Power-Ups</span>
              </div>
              <span className="text-xs font-black text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full">{stats.coins || 0} Münzen</span>
            </Button>

            <Button 
              fullWidth 
              variant="secondary" 
              onClick={() => setScreen('rankings')}
              className="py-4 justify-between px-6"
            >
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-blue-500" />
                <span className="font-bold">Bestenliste</span>
              </div>
              <ChevronLeft size={20} className="rotate-180 text-slate-300" />
            </Button>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Star size={16} className="text-amber-500" />
              Deine Erfolge
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {ACHIEVEMENTS.map(achievement => {
                const isUnlocked = stats.achievements?.includes(achievement.id) || false;
                return (
                  <div 
                    key={achievement.id} 
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isUnlocked 
                        ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50' 
                        : 'bg-slate-50 dark:bg-slate-900 border-transparent opacity-60 grayscale'
                    }`}
                  >
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <h4 className={`font-black text-sm mb-1 ${isUnlocked ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {achievement.title}
                    </h4>
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                      {achievement.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {user ? (
            <Button 
              fullWidth 
              variant="secondary" 
              onClick={() => logout()}
              className="py-4 text-rose-500 border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-900/10"
            >
              Abmelden
            </Button>
          ) : (
            <div className="space-y-3">
              <Button 
                fullWidth 
                onClick={() => signInWithGoogle()}
                className="py-4 bg-blue-600 text-white"
              >
                Mit Google anmelden
              </Button>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center max-w-[250px] mx-auto">
                Mit der Anmeldung stimmst du unseren <button onClick={() => setScreen('terms')} className="underline">Nutzungsbedingungen</button> und der <button onClick={() => setScreen('privacy')} className="underline">Datenschutzerklärung</button> zu.
              </p>
            </div>
          )}
        </main>
      </motion.div>
    );
  };

  const renderReview = () => {
    const wrongCount = stats.wrongQuestions?.length || 0;

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 scroll-smooth overflow-y-auto no-scrollbar"
      >
        <motion.header variants={itemVariants} className="shrink-0 px-6 pt-12 pb-8 flex items-center justify-between bg-white dark:bg-slate-900 rounded-b-[3rem] shadow-sm dark:shadow-none border-b border-slate-100 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/50 dark:bg-rose-900/10 rounded-full blur-2xl -mr-16 -mt-16" />
          <div className="flex items-center gap-4 relative z-10">
            <button onClick={() => setScreen('home')} className="p-2.5 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight text-left">Fehler wiederholen</h1>
          </div>
          <div className="relative z-10 w-10 h-10 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center shadow-sm">
            <RotateCcw size={22} strokeWidth={2.5} />
          </div>
        </motion.header>

        <main className="flex-1 px-6 py-10 space-y-10 pb-32 max-w-2xl mx-auto w-full">
          {wrongCount === 0 ? (
            <motion.div variants={itemVariants} className="text-center py-20 px-8">
              <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
                <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white mb-3 tracking-tight">Alles perfekt!</h2>
              <p className="text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                Du hast aktuell keine falsch beantworteten Fragen gespeichert. Mach weiter so!
              </p>
              <Button 
                onClick={() => setScreen('home')} 
                className="mt-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-none shadow-premium dark:shadow-none py-5 px-10 rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                Zurück zum Start
              </Button>
            </motion.div>
          ) : (
            <>
              <motion.div variants={itemVariants} className="text-center">
                <div className="inline-flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-full text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-rose-100 dark:border-rose-900/30">
                  <AlertCircle size={14} />
                  <span>{wrongCount} {wrongCount === 1 ? 'Fehler' : 'Fehler'} gespeichert</span>
                </div>
                <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">Lerne aus deinen Fehlern</h2>
                <p className="text-slate-400 dark:text-slate-500 font-medium px-4 leading-relaxed">
                  Wiederhole die Fragen, die du falsch beantwortet hast, um dein Wissen zu festigen.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4">
                <Card className="bg-gradient-to-br from-rose-600 to-rose-700 text-white border-none p-8 rounded-[3rem] relative overflow-hidden shadow-2xl group dark:shadow-none">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-20 -mt-20 blur-3xl" 
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                        <Play size={28} fill="currentColor" className="ml-1" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-display font-black text-xl leading-tight tracking-tight">Wiederholung starten</h4>
                        <p className="text-rose-100/70 text-xs font-medium mt-1">Alle {wrongCount} Fragen üben</p>
                      </div>
                    </div>
                    <Button 
                      fullWidth 
                      onClick={() => startQuiz('review')}
                      className="bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border-none py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl dark:shadow-none group-hover:scale-[1.02] transition-transform"
                    >
                      Jetzt wiederholen
                    </Button>
                  </div>
                </Card>

                <div className="pt-4 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2 text-left">Deine Fehlerliste</h3>
                  {stats.wrongQuestions?.map((q, i) => (
                    <motion.div 
                      key={q.id} 
                      variants={itemVariants}
                      className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-premium dark:shadow-none border border-slate-50 dark:border-slate-800 flex items-start gap-4"
                    >
                      <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center shrink-0 text-xs font-black">
                        {i + 1}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                            {q.category}
                          </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-100 text-sm font-bold leading-relaxed mb-3">{q.question}</p>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                          <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">Richtige Antwort</p>
                          <p className="text-emerald-800 dark:text-emerald-300 text-xs font-bold">{q.options[q.correctAnswer]}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </main>
      </motion.div>
    );
  };

  const renderShop = () => {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar"
      >
        <header className="shrink-0 px-6 pt-12 pb-6 flex items-center justify-between relative z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setScreen('profile')} 
            className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 rounded-2xl transition-all"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-1">Shop</span>
            <h1 className="text-lg font-display font-black tracking-tight text-slate-900 dark:text-white">Power-Ups & Mehr</h1>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-xl">
            <Coins size={16} className="text-amber-500" />
            <span className="text-sm font-black text-amber-500">{stats.coins || 0}</span>
          </div>
        </header>

        <main className="flex-1 px-6 py-8 pb-32 space-y-8 max-w-2xl mx-auto w-full">
          {/* Power-Ups */}
          <section>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Power-Ups</h2>
            <div className="grid gap-4">
              {[
                { id: 'fiftyFifty', name: '50:50 Joker', desc: 'Entfernt zwei falsche Antworten.', icon: '⚖️', cost: 50, count: stats.powerUps?.fiftyFifty || 0 },
                { id: 'timeFreeze', name: 'Zeit-Freeze', desc: 'Hält den Timer an.', icon: '❄️', cost: 75, count: stats.powerUps?.timeFreeze || 0 },
                { id: 'secondChance', name: 'Zweite Chance', desc: 'Ein weiterer Versuch bei falscher Antwort.', icon: '❤️', cost: 100, count: stats.powerUps?.secondChance || 0 }
              ].map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white">{item.name}</h3>
                      <span className="text-xs font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg">Im Besitz: {item.count}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{item.desc}</p>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        const updated = buyPowerUp(item.id as any, item.cost);
                        setStats(updated);
                      }}
                      disabled={(stats.coins || 0) < item.cost}
                      className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-none"
                    >
                      Kaufen für {item.cost} <Coins size={14} className="ml-1 inline" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Avatars */}
          <section>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Avatare</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'default', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', cost: 0 },
                { id: 'avatar1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', cost: 200 },
                { id: 'avatar2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jude', cost: 300 },
                { id: 'avatar3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avery', cost: 500 },
                { id: 'avatar4', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot1', cost: 800 },
                { id: 'avatar5', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot2', cost: 1000 }
              ].map(item => {
                const isUnlocked = stats.unlockedAvatars?.includes(item.id);
                const isEquipped = stats.customPhotoURL === item.url || (item.id === 'default' && !stats.customPhotoURL);
                
                return (
                  <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center gap-3">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden">
                      <img src={item.url} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-full">
                      {!isUnlocked && <p className="text-xs text-slate-500 mb-2">{item.cost} Münzen</p>}
                      {isEquipped ? (
                        <span className="block w-full text-xs font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-2 rounded-xl">Ausgerüstet</span>
                      ) : isUnlocked ? (
                        <Button fullWidth size="sm" variant="outline" onClick={() => setStats(equipAvatar(item.id, item.url))}>Ausrüsten</Button>
                      ) : (
                        <Button 
                          fullWidth
                          size="sm" 
                          onClick={() => setStats(buyAvatar(item.id, item.cost, item.url))}
                          disabled={(stats.coins || 0) < item.cost}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-none"
                        >
                          Kaufen
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Titles */}
          <section>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Titel</h2>
            <div className="grid gap-4">
              {[
                { id: 'Neuling', name: 'Neuling', cost: 0 },
                { id: 'Quiz-Gott', name: 'Quiz-Gott', cost: 500 },
                { id: 'Alleswisser', name: 'Alleswisser', cost: 1000 },
                { id: 'Legende', name: 'Legende', cost: 2500 }
              ].map(item => {
                const isUnlocked = stats.unlockedTitles?.includes(item.id);
                const isEquipped = stats.equippedTitle === item.id;
                
                return (
                  <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{item.name}</h3>
                      {!isUnlocked && <p className="text-xs text-slate-500 mt-1">{item.cost} Münzen</p>}
                    </div>
                    {isEquipped ? (
                      <span className="text-xs font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-xl">Ausgerüstet</span>
                    ) : isUnlocked ? (
                      <Button size="sm" variant="outline" onClick={() => setStats(equipTitle(item.id))}>Ausrüsten</Button>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => setStats(buyTitle(item.id, item.cost))}
                        disabled={(stats.coins || 0) < item.cost}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-none"
                      >
                        Kaufen
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </motion.div>
    );
  };

  const renderImpressum = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar"
    >
      <header className="shrink-0 px-6 pt-12 pb-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center relative z-10">
        <button 
          onClick={() => setScreen('settings')}
          className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-display font-black ml-4 text-slate-900 dark:text-white">Impressum</h1>
      </header>
      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full pb-32">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 prose dark:prose-invert prose-sm max-w-none">
          <h3>Angaben gemäß § 5 TMG</h3>
          <p>
            Max Mustermann<br />
            Musterstraße 1<br />
            12345 Musterstadt
          </p>
          <p className="text-rose-500 text-xs font-bold mt-2">
            (Hinweis: Dies sind Platzhalter-Daten. Bitte vor Veröffentlichung mit echten Daten ersetzen!)
          </p>
          <h3>Kontakt</h3>
          <p>
            Telefon: +49 (0) 123 44 55 66<br />
            E-Mail: info@musterstadt.de
          </p>
          <h3>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
          <p>
            Max Mustermann<br />
            Musterstraße 1<br />
            12345 Musterstadt
          </p>
        </div>
      </main>
    </motion.div>
  );

  const renderPrivacy = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar"
    >
      <header className="shrink-0 px-6 pt-12 pb-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center relative z-10">
        <button 
          onClick={() => setScreen('settings')}
          className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-display font-black ml-4 text-slate-900 dark:text-white">Datenschutz</h1>
      </header>
      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full pb-32">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 prose dark:prose-invert prose-sm max-w-none">
          <h3>1. Datenschutz auf einen Blick</h3>
          <p>Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>
          
          <h3>2. Datenerfassung in dieser App</h3>
          <h4>Google Firebase</h4>
          <p>Diese App nutzt Firebase (Google Inc.) für die Authentifizierung (Google Login) und zur Speicherung von Spieldaten (Firestore). Dabei werden Ihre E-Mail-Adresse, Ihr Name und Ihr Profilbild verarbeitet, sofern Sie sich anmelden.</p>
          
          <h4>Lokale Speicherung (Local Storage)</h4>
          <p>Um Ihre Spieleinstellungen und Fortschritte auch ohne Anmeldung zu speichern, nutzen wir den lokalen Speicher Ihres Browsers (Local Storage).</p>
          
          <h4>KI-Funktionen (Gemini API)</h4>
          <p>Für die Generierung von Quizfragen nutzen wir die Gemini API von Google. Eingegebene Themen werden zur Verarbeitung an Google-Server gesendet.</p>

          <h3>3. Ihre Rechte</h3>
          <p>Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Sie können Ihr Konto jederzeit in den Einstellungen löschen.</p>
        </div>
      </main>
    </motion.div>
  );

  const renderTerms = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar"
    >
      <header className="shrink-0 px-6 pt-12 pb-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center relative z-10">
        <button 
          onClick={() => setScreen('settings')}
          className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-display font-black ml-4 text-slate-900 dark:text-white">Nutzungsbedingungen</h1>
      </header>
      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full pb-32">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 prose dark:prose-invert prose-sm max-w-none">
          <h3>1. Geltungsbereich</h3>
          <p>Diese Nutzungsbedingungen gelten für die Nutzung der Quiz-App "WissenPur". Durch die Nutzung der App stimmen Sie diesen Bedingungen zu.</p>
          
          <h3>2. Nutzung der App</h3>
          <p>Die App darf nur für legale Zwecke genutzt werden. Jegliche Manipulation der Highscores, Cheating oder das Ausnutzen von Fehlern (Bugs) ist untersagt und kann zur Sperrung des Accounts führen.</p>
          
          <h3>3. KI-Generierte Inhalte</h3>
          <p>Die App nutzt Künstliche Intelligenz zur Generierung von Fragen. Wir übernehmen keine Gewähr für die Richtigkeit, Vollständigkeit oder Aktualität der generierten Fragen und Antworten.</p>

          <h3>4. Haftungsbeschränkung</h3>
          <p>Wir haften nicht für Schäden, die durch die Nutzung der App entstehen, es sei denn, sie beruhen auf Vorsatz oder grober Fahrlässigkeit.</p>

          <h3>5. Änderungen</h3>
          <p>Wir behalten uns das Recht vor, diese Nutzungsbedingungen jederzeit zu ändern. Die fortgesetzte Nutzung der App nach einer Änderung gilt als Zustimmung zu den neuen Bedingungen.</p>
        </div>
      </main>
    </motion.div>
  );

  const renderSettings = () => {
    const handleSaveProfile = () => {
      const ageNum = parseInt(editAge);
      const updatedStats = saveUserDetails(editName, isNaN(ageNum) ? undefined : ageNum);
      setStats(updatedStats);
      if (user) {
        syncUserStats(updatedStats);
      }
      setIsEditing(false);
    };

    return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar"
    >
      <header className="shrink-0 px-6 pt-12 pb-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center relative z-10">
        <button 
          onClick={() => setScreen('home')}
          className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-display font-black ml-4 text-slate-900 dark:text-white">Einstellungen</h1>
      </header>

      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full space-y-8 pb-32">
        <section>
          <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Account</h2>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800">
            {user ? (
              <div className="p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {stats.customPhotoURL || user.photoURL ? (
                      <img src={stats.customPhotoURL || user.photoURL!} alt="Profile" className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-black text-xl">
                        {(stats.customName || user.displayName)?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{stats.customName || user.displayName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      {stats.age && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stats.age} Jahre alt</p>}
                    </div>
                  </div>
                  <Button variant="secondary" onClick={logout} className="text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 border-none shrink-0">
                    Abmelden
                  </Button>
                </div>
                
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Profil bearbeiten</h3>
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest"
                    >
                      {isEditing ? 'Abbrechen' : 'Bearbeiten'}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Anzeigename</label>
                          <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="Dein Name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Alter (optional)</label>
                          <input 
                            type="number" 
                            value={editAge}
                            onChange={(e) => setEditAge(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="Dein Alter"
                          />
                        </div>
                        <Button onClick={handleSaveProfile} fullWidth className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200">
                          Speichern
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                  {!showDeleteConfirm ? (
                    <Button 
                      variant="outline" 
                      fullWidth 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="border-rose-200 dark:border-rose-900/50 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    >
                      Konto löschen
                    </Button>
                  ) : (
                    <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                      <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-3 text-center">Möchtest du dein Konto wirklich löschen? Dies kann nicht rückgängig gemacht werden.</p>
                      {deleteError && <p className="text-xs text-rose-500 mb-3 text-center">{deleteError}</p>}
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          fullWidth 
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteError('');
                          }}
                        >
                          Abbrechen
                        </Button>
                        <Button 
                          fullWidth 
                          onClick={async () => {
                            try {
                              await auth.currentUser?.delete();
                              logout();
                              setShowDeleteConfirm(false);
                            } catch (error: any) {
                              if (error.code === 'auth/requires-recent-login') {
                                setDeleteError("Bitte melde dich erneut an, um dein Konto zu löschen.");
                              } else {
                                setDeleteError("Fehler beim Löschen des Kontos.");
                              }
                            }
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white border-none"
                        >
                          Ja, löschen
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center">
                  <User size={32} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white mb-1">Nicht angemeldet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[250px] mx-auto">Melde dich an, um deine Fortschritte zu speichern und in der Rangliste zu erscheinen.</p>
                </div>
                <Button onClick={signInWithGoogle} className="bg-blue-600 hover:bg-blue-700 text-white w-full max-w-[200px]">
                  Mit Google anmelden
                </Button>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[250px] mx-auto mt-2">
                  Mit der Anmeldung stimmst du unseren <button onClick={() => setScreen('terms')} className="underline">Nutzungsbedingungen</button> und der <button onClick={() => setScreen('privacy')} className="underline">Datenschutzerklärung</button> zu.
                </p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Darstellung</h2>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl flex items-center justify-center">
                  <Settings size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Hell/Dunkel umschalten</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const newStats = { ...stats, darkMode: !stats.darkMode };
                  setStats(newStats);
                  saveStats(newStats);
                  if (user) syncUserStats(newStats);
                }}
                className={`w-12 h-6 rounded-full relative transition-colors ${stats.darkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <motion.div 
                  layout
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                  initial={false}
                  animate={{ left: stats.darkMode ? '1.5rem' : '0.25rem' }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">App Info</h2>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 dark:shadow-none">
              <Zap size={32} fill="currentColor" />
            </div>
            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">WissenPur</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">Version 1.0.0</p>
            
            <div className="flex justify-center gap-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <button onClick={() => setScreen('privacy')} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Datenschutz</button>
              <span>•</span>
              <button onClick={() => setScreen('impressum')} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Impressum</button>
              <span>•</span>
              <button onClick={() => setScreen('terms')} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">AGB</button>
            </div>
          </div>
        </section>
      </main>
    </motion.div>
    );
  };

  return (
    <ErrorBoundary>
      <div className={`w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto h-[100dvh] md:h-[95vh] md:my-[2.5vh] md:rounded-[2.5rem] bg-white dark:bg-slate-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/50 relative overflow-hidden md:shadow-2xl md:border md:border-slate-200 dark:md:border-slate-800 ${stats.darkMode ? 'dark' : ''}`}>
        <AnimatePresence>
          {showIntro && (
            <motion.div 
              key="intro"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 text-white"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 100, delay: 0.2 }}
                className="w-28 h-28 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl ring-4 ring-white/30"
              >
                <Zap size={56} className="text-white" fill="currentColor" />
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-5xl font-black tracking-tight mb-2"
              >
                WissenPur
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "40px" }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="h-1.5 bg-blue-400 rounded-full mb-4"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="text-blue-200 font-bold tracking-[0.2em] uppercase text-xs"
              >
                Das ultimative Quiz
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isGeneratingQuestions && (
            <motion.div 
              key="generating"
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-[90] flex flex-col items-center justify-center bg-white/80 dark:bg-slate-950/80"
            >
              <div className="relative flex items-center justify-center mb-12">
                {/* Glowing background orb */}
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    rotate: [0, 90, 180, 270, 360],
                    borderRadius: ["30%", "50%", "30%"],
                  }}
                  transition={{
                    duration: 4,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                  className="w-32 h-32 bg-gradient-to-tr from-blue-500/40 to-purple-500/40 blur-2xl absolute"
                />
                
                {/* Central Icon Container */}
                <motion.div
                  animate={{
                    y: [-5, 5, -5],
                  }}
                  transition={{
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                  className="w-24 h-24 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex items-center justify-center relative z-10 border border-slate-100 dark:border-slate-800 overflow-hidden"
                >
                  {/* Scanning line effect */}
                  <motion.div
                    animate={{ top: ["-10%", "110%"] }}
                    transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                    className="absolute left-0 right-0 h-1 bg-blue-500/50 blur-[2px] z-20"
                  />
                  
                  {/* Rotating dashed border */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                    className="absolute inset-2 rounded-2xl border-2 border-dashed border-blue-500/30"
                  />
                  
                  <Cpu size={40} className="text-blue-500 relative z-10" />
                </motion.div>
                
                {/* Orbiting particles */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`orbit-${i}`}
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 3 + i,
                      ease: "linear",
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                    className="absolute w-40 h-40 rounded-full border border-blue-500/10"
                    style={{ borderStyle: i % 2 === 0 ? 'dashed' : 'solid' }}
                  >
                    <div 
                      className={`absolute w-3 h-3 rounded-full ${i === 0 ? 'bg-blue-400' : i === 1 ? 'bg-purple-400' : 'bg-emerald-400'} shadow-lg`}
                      style={{ top: -6, left: '50%', marginLeft: -6 }}
                    />
                  </motion.div>
                ))}
              </div>
              
              <motion.h2 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl font-display font-black text-slate-800 dark:text-white mb-4 tracking-tight text-center"
              >
                KI generiert Fragen
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}
                >
                  ...
                </motion.span>
              </motion.h2>
              
              <div className="flex gap-2 mb-8">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={`dot-${i}`}
                    animate={{ 
                      y: [0, -10, 0],
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{ 
                      duration: 1, 
                      delay: i * 0.15, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-3 h-3 rounded-full bg-blue-500"
                  />
                ))}
              </div>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-slate-500 dark:text-slate-400 text-center max-w-sm font-medium leading-relaxed px-6"
              >
                Dein personalisiertes Quiz wird aus über 1.000.000 Möglichkeiten zusammengestellt. Bitte habe einen Moment Geduld.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
          >
            {screen === 'home' && renderHome()}
            {screen === 'howToPlay' && renderHowToPlay()}
            {screen === 'customTopicSelection' && renderCustomTopicSelection()}
            {screen === 'createQuizMenu' && renderCreateQuizMenu()}
            {screen === 'createManualQuiz' && renderCreateManualQuiz()}
            {screen === 'projects' && renderProjects()}
            {screen === 'difficultySelection' && renderDifficultySelection()}
        {screen === 'categories' && renderCategories()}
            {screen === 'daily' && renderDailyIntro()}
            {screen === 'blitzIntro' && renderBlitzIntro()}
            {screen === 'blitzQuiz' && renderBlitzQuiz()}
            {screen === 'duelSelection' && renderDuelSelection()}
            {screen === 'createLobby' && renderCreateLobby()}
            {screen === 'joinLobby' && renderJoinLobby()}
            {screen === 'lobbyRoom' && renderLobbyRoom()}
            {screen === 'matchmaking' && renderMatchmaking()}
            {screen === 'rankings' && renderRankings()}
            {screen === 'quiz' && renderQuiz()}
            {screen === 'result' && renderResult()}
            {screen === 'profile' && renderProfile()}
            {screen === 'shop' && renderShop()}
            {screen === 'leaderboard' && renderLeaderboard()}
            {screen === 'review' && renderReview()}
            {screen === 'settings' && renderSettings()}
            {screen === 'impressum' && renderImpressum()}
            {screen === 'privacy' && renderPrivacy()}
            {screen === 'terms' && renderTerms()}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {screen !== 'quiz' && screen !== 'daily' && screen !== 'blitzQuiz' && screen !== 'createLobby' && screen !== 'joinLobby' && screen !== 'lobbyRoom' && screen !== 'matchmaking' && screen !== 'rankings' && screen !== 'settings' && screen !== 'howToPlay' && screen !== 'impressum' && screen !== 'privacy' && screen !== 'terms' && (
            <motion.nav 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="absolute bottom-8 left-8 right-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-[0_25px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] rounded-[2.5rem] px-4 py-3.5 flex justify-around items-center z-50"
            >
              {[
                { id: 'home', icon: Play, label: 'Home' },
                { id: 'categories', icon: LayoutGrid, label: 'Themen' },
                { id: 'duelSelection', icon: Swords, label: 'Online' },
                { id: 'profile', icon: User, label: 'Profil' }
              ].map((tab) => {
                const isActive = tab.id === 'home' ? screen === 'home' : 
                                tab.id === 'categories' ? screen === 'categories' : 
                                tab.id === 'duelSelection' ? screen === 'duelSelection' :
                                (screen === 'profile' || screen === 'shop');
                const Icon = tab.icon;
                
                return (
                  <button 
                    key={tab.id}
                    onClick={() => {
                      soundManager.init();
                      soundManager.playClick();
                      setScreen(tab.id as any);
                    }} 
                    className={`relative flex flex-col items-center gap-1.5 py-1 px-5 transition-all duration-500 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-blue-50/80 dark:bg-blue-900/30 rounded-2xl -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <motion.div
                      animate={isActive ? { scale: 1.15, y: -2 } : { scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Icon size={22} fill={isActive ? "currentColor" : "none"} strokeWidth={isActive ? 2.5 : 2} />
                    </motion.div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-0.5'}`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
