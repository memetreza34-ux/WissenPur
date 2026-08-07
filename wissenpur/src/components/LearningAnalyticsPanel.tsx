import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  CalendarClock,
  Minus,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { CATEGORIES } from '../data';
import { auth } from '../firebase';
import {
  ANALYTICS_OWNER_KEY,
  ANALYTICS_STORAGE_KEY,
  appendLearningSession,
  buildLearningAnalytics,
  createEconomySnapshot,
  deriveRankedSession,
  normalizeLearningHistory,
  type EconomySnapshot,
  type LearningSessionRecord,
} from '../services/learningAnalytics';
import { getStats } from '../storage';
import { Card } from './UI';

const ownerKey = (): string => auth.currentUser?.uid || 'anonymous';

const readHistory = (): LearningSessionRecord[] => {
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    return normalizeLearningHistory(raw ? JSON.parse(raw) : []);
  } catch {
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
    return [];
  }
};

const writeHistory = (history: readonly LearningSessionRecord[]) => {
  const normalized = normalizeLearningHistory(history);
  localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent('wissenpur:analytics-updated', { detail: normalized }));
  return normalized;
};

const ensureAnalyticsOwner = (): LearningSessionRecord[] => {
  const nextOwner = ownerKey();
  const previousOwner = localStorage.getItem(ANALYTICS_OWNER_KEY);
  if (previousOwner && previousOwner !== nextOwner) {
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  }
  localStorage.setItem(ANALYTICS_OWNER_KEY, nextOwner);
  return readHistory();
};

const clearAnalytics = () => {
  localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  localStorage.removeItem(ANALYTICS_OWNER_KEY);
};

const categoryTitle = (category: string): string => {
  if (category === 'all') return 'Gemischt';
  if (category === 'daily') return 'Daily Challenge';
  return CATEGORIES.find((entry) => entry.id === category)?.title || category;
};

const formatDate = (timestamp: number): string =>
  new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));

const dueCardCount = (): number => {
  const now = Date.now();
  return (getStats().customQuizzes || []).reduce(
    (total, deck) => total + deck.questions.filter((question) =>
      !question.srsData || question.srsData.nextReviewDate <= now,
    ).length,
    0,
  );
};

const trendMeta = (points: number | null) => {
  if (points === null) return { label: 'Noch kein Vergleich', icon: Minus, className: 'text-slate-500' };
  if (points > 0) return { label: `+${points} Prozentpunkte`, icon: ArrowUpRight, className: 'text-emerald-600' };
  if (points < 0) return { label: `${points} Prozentpunkte`, icon: ArrowDownRight, className: 'text-rose-600' };
  return { label: 'Unverändert', icon: Minus, className: 'text-slate-500' };
};

export const LearningAnalyticsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<LearningSessionRecord[]>(() => ensureAnalyticsOwner());
  const [statsRevision, setStatsRevision] = useState(0);
  const baselineRef = useRef<EconomySnapshot>(createEconomySnapshot(getStats()));
  const hydrationSuppressUntilRef = useRef(Date.now() + 3_000);

  useEffect(() => onAuthStateChanged(auth, () => {
    setHistory(ensureAnalyticsOwner());
    baselineRef.current = createEconomySnapshot(getStats());
    hydrationSuppressUntilRef.current = Date.now() + 5_000;
    setStatsRevision((value) => value + 1);
  }), []);

  useEffect(() => {
    const reset = () => {
      clearAnalytics();
      setHistory([]);
      baselineRef.current = createEconomySnapshot(getStats());
      hydrationSuppressUntilRef.current = Date.now() + 3_000;
    };
    window.addEventListener('wissenpur:account-storage-reset', reset);
    return () => window.removeEventListener('wissenpur:account-storage-reset', reset);
  }, []);

  useEffect(() => {
    const analyticsUpdated = () => setHistory(readHistory());
    const statsUpdated = () => setStatsRevision((value) => value + 1);
    window.addEventListener('wissenpur:analytics-updated', analyticsUpdated);
    window.addEventListener('wissenpur:stats-updated', statsUpdated);
    return () => {
      window.removeEventListener('wissenpur:analytics-updated', analyticsUpdated);
      window.removeEventListener('wissenpur:stats-updated', statsUpdated);
    };
  }, []);

  useEffect(() => {
    const check = () => {
      const next = createEconomySnapshot(getStats());
      const before = baselineRef.current;
      baselineRef.current = next;
      if (Date.now() < hydrationSuppressUntilRef.current) return;
      const session = deriveRankedSession(before, next);
      if (!session) return;
      setHistory((current) => writeHistory(appendLearningSession(current, session)));
      setStatsRevision((value) => value + 1);
    };
    const timer = window.setInterval(check, 1500);
    return () => window.clearInterval(timer);
  }, []);

  const stats = useMemo(() => getStats(), [statsRevision]);
  const dueCards = useMemo(() => dueCardCount(), [statsRevision, history]);
  const summary = useMemo(
    () => buildLearningAnalytics(history, stats.categoryStats, dueCards),
    [dueCards, history, stats.categoryStats],
  );
  const trend = trendMeta(summary.trendPoints);
  const TrendIcon = trend.icon;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStatsRevision((value) => value + 1);
          setHistory(ensureAnalyticsOwner());
          setIsOpen(true);
        }}
        className="fixed bottom-60 right-4 z-[80] flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-xs font-black text-slate-700 shadow-xl backdrop-blur-xl hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100"
        aria-label="Lernanalyse öffnen"
      >
        <BarChart3 size={18} className="text-emerald-600" />
        Analyse
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[140] overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Persönliche Lernanalyse</p>
                <h1 className="text-2xl font-black">Fortschritt verstehen</h1>
              </div>
              <button type="button" aria-label="Lernanalyse schließen" onClick={() => setIsOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X /></button>
            </div>
          </header>

          <main className="mx-auto max-w-4xl space-y-6 p-5 pb-24">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
              Die Zeitreihe beginnt mit dieser Release-Version. Sie enthält nur kompakte Lernmetriken auf diesem Gerät – keine Antworten oder Fragentexte – und beeinflusst weder Punkte noch Rangliste.
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="p-5"><Activity className="text-blue-600" size={21} /><p className="mt-3 text-3xl font-black">{summary.sessions}</p><p className="text-xs font-bold text-slate-500">erfasste neue Prüfungen</p></Card>
              <Card className="p-5"><Target className="text-emerald-600" size={21} /><p className="mt-3 text-3xl font-black">{summary.recentAccuracy === null ? '–' : `${summary.recentAccuracy}%`}</p><p className="text-xs font-bold text-slate-500">letzte 5 Prüfungen</p></Card>
              <Card className="p-5"><TrendingUp className={trend.className} size={21} /><p className={`mt-3 text-lg font-black ${trend.className}`}><TrendIcon className="mr-1 inline" size={18} />{trend.label}</p><p className="text-xs font-bold text-slate-500">gegen die 5 davor</p></Card>
            </div>

            <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-100">Empfehlung für heute</p>
                  <h2 className="mt-2 text-2xl font-black">{summary.recommendation.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm font-medium text-emerald-100/90">{summary.recommendation.detail}</p>
                </div>
                <Brain size={46} className="shrink-0 text-white/30" />
              </div>
              <p className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-100"><ArrowRight size={15} /> Öffne danach „Lernen“ oder „Lernsets“ und starte die empfohlene Einheit.</p>
            </Card>

            <section>
              <div className="mb-3"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Wissensprofil</p><h2 className="text-xl font-black">Stärken und Schwächen</h2></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-rose-500">Aktueller Fokus</p>
                  {summary.weakestCategory ? <><h3 className="mt-2 text-xl font-black">{categoryTitle(summary.weakestCategory.category)}</h3><p className="mt-2 text-sm text-slate-500">{summary.weakestCategory.accuracy}% richtig · {summary.weakestCategory.total} Fragen · {summary.weakestCategory.rounds} Runden</p></> : <p className="mt-3 text-sm text-slate-500">Noch nicht genug Kategoriedaten.</p>}
                </Card>
                <Card className="p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Stärkster Bereich</p>
                  {summary.strongestCategory ? <><h3 className="mt-2 text-xl font-black">{categoryTitle(summary.strongestCategory.category)}</h3><p className="mt-2 text-sm text-slate-500">{summary.strongestCategory.accuracy}% richtig · {summary.strongestCategory.total} Fragen · {summary.strongestCategory.rounds} Runden</p></> : <p className="mt-3 text-sm text-slate-500">Noch nicht genug Kategoriedaten.</p>}
                </Card>
              </div>
            </section>

            <section>
              <div className="mb-3"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prüfungshistorie</p><h2 className="text-xl font-black">Letzte Sitzungen</h2></div>
              {history.length === 0 ? (
                <div className="rounded-[2rem] border-2 border-dashed border-slate-200 p-10 text-center dark:border-slate-800">
                  <CalendarClock className="mx-auto text-slate-300" size={42} />
                  <h3 className="mt-4 font-black">Noch keine neue Prüfung erfasst</h3>
                  <p className="mt-2 text-sm text-slate-500">Spiele eine gewertete Runde. Danach erscheint sie automatisch hier.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.slice(0, 12).map((session) => (
                    <Card key={session.id} className="flex items-center gap-4 p-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-black ${session.accuracy >= 80 ? 'bg-emerald-100 text-emerald-700' : session.accuracy >= 50 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{session.accuracy}%</div>
                      <div className="min-w-0 flex-1"><h3 className="truncate font-black">{session.label}</h3><p className="mt-1 text-xs text-slate-500">{categoryTitle(session.category)} · {session.correct}/{session.total} richtig · {formatDate(session.completedAt)}</p></div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      )}
    </>
  );
};
