import { useEffect, useMemo, useState } from 'react';
import {
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Pencil,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { CATEGORIES } from '../data';
import { auth } from '../firebase';
import { getStats } from '../storage';
import { CategoryId } from '../types';
import {
  buildLearningRecommendation,
  getLocalLearningPlan,
  LearningPlan,
  loadLearningPlan,
  removeLearningPlan,
  saveLearningPlan,
} from '../services/learningPlanService';
import { Button, ProgressBar } from './UI';

const todayKey = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

const defaultExamDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const getDueCards = () => {
  const now = Date.now();
  return (getStats().customQuizzes || [])
    .flatMap((deck) => deck.questions)
    .filter((question) => !question.srsData || question.srsData.nextReviewDate <= now)
    .length;
};

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message.replace(/^Firebase:\s*/i, '');
  }
  return 'Der Lernplan konnte nicht gespeichert werden.';
};

export const LearningPlanPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [plan, setPlan] = useState<LearningPlan | null>(() => getLocalLearningPlan());
  const [dueCards, setDueCards] = useState(getDueCards);
  const [message, setMessage] = useState<string | null>(null);
  const [examTitle, setExamTitle] = useState(plan?.examTitle || 'Meine nächste Prüfung');
  const [examDate, setExamDate] = useState(plan?.examDate || defaultExamDate());
  const [category, setCategory] = useState<CategoryId | 'all'>(plan?.category || 'all');
  const [dailyMinutes, setDailyMinutes] = useState<LearningPlan['dailyMinutes']>(plan?.dailyMinutes || 20);
  const [weeklyDays, setWeeklyDays] = useState<LearningPlan['weeklyDays']>(plan?.weeklyDays || 5);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async () => {
      try {
        const loaded = await loadLearningPlan();
        if (loaded) {
          setPlan(loaded);
          setExamTitle(loaded.examTitle);
          setExamDate(loaded.examDate);
          setCategory(loaded.category);
          setDailyMinutes(loaded.dailyMinutes);
          setWeeklyDays(loaded.weeklyDays);
        }
      } catch (error) {
        console.warn('Lernplan konnte nicht aus der Cloud geladen werden.', error);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const refresh = () => setDueCards(getDueCards());
    window.addEventListener('wissenpur:stats-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('wissenpur:stats-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const recommendation = useMemo(
    () => plan ? buildLearningRecommendation(plan, dueCards) : null,
    [plan, dueCards],
  );

  const save = async () => {
    const title = examTitle.trim();
    if (!title) {
      setMessage('Gib einen Namen für die Prüfung oder das Lernziel ein.');
      return;
    }
    if (examDate < todayKey()) {
      setMessage('Das Prüfungsdatum darf nicht in der Vergangenheit liegen.');
      return;
    }

    setIsBusy(true);
    setMessage(null);
    try {
      const now = Date.now();
      const next: LearningPlan = {
        version: 1,
        examTitle: title.slice(0, 100),
        examDate,
        category,
        dailyMinutes,
        weeklyDays,
        createdAt: plan?.createdAt || now,
        updatedAt: now,
        completedSessions: plan?.completedSessions || 0,
        lastCompletedDate: plan?.lastCompletedDate || null,
      };
      const saved = await saveLearningPlan(next);
      setPlan(saved);
      setIsEditing(false);
      setMessage('Lernplan gespeichert.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  };

  const completeToday = async () => {
    if (!plan || plan.lastCompletedDate === todayKey()) return;
    setIsBusy(true);
    try {
      const next = await saveLearningPlan({
        ...plan,
        updatedAt: Date.now(),
        completedSessions: plan.completedSessions + 1,
        lastCompletedDate: todayKey(),
      });
      setPlan(next);
      setMessage('Heutige Lerneinheit abgeschlossen.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  };

  const remove = async () => {
    setIsBusy(true);
    try {
      await removeLearningPlan();
      setPlan(null);
      setIsEditing(true);
      setMessage('Lernplan entfernt.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  };

  const completedToday = plan?.lastCompletedDate === todayKey();
  const progress = recommendation && recommendation.plannedSessions > 0
    ? Math.min(100, (plan!.completedSessions / recommendation.plannedSessions) * 100)
    : 0;
  const categoryTitle = category === 'all'
    ? 'Gemischtes Wissen'
    : CATEGORIES.find((entry) => entry.id === category)?.title || category;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMessage(null);
          setIsEditing(!plan);
          setIsOpen(true);
        }}
        className="fixed bottom-28 left-4 z-[80] flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-xs font-black text-slate-700 shadow-xl backdrop-blur-xl hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100"
        aria-label="Prüfungs-Lernplan öffnen"
      >
        <CalendarDays size={18} className="text-purple-600" />
        Plan
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="learning-plan-title"
            className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">
                  Adaptiver Lernplan
                </p>
                <h2 id="learning-plan-title" className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                  {plan && !isEditing ? plan.examTitle : 'Prüfung planen'}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Lernplan schließen"
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {message && (
              <div role="status" className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-sm font-bold text-purple-900 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-100">
                {message}
              </div>
            )}

            {isEditing || !plan ? (
              <div className="mt-6 space-y-5">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Prüfung oder Lernziel</span>
                  <input
                    value={examTitle}
                    onChange={(event) => setExamTitle(event.target.value)}
                    maxLength={100}
                    className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-transparent px-4 py-3 font-bold outline-none focus:border-purple-500 dark:border-slate-700"
                    placeholder="z. B. AP1 Elektrotechnik"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Prüfungsdatum</span>
                    <input
                      type="date"
                      min={todayKey()}
                      value={examDate}
                      onChange={(event) => setExamDate(event.target.value)}
                      className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-transparent px-4 py-3 font-bold outline-none focus:border-purple-500 dark:border-slate-700"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Fach</span>
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value as CategoryId | 'all')}
                      className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950"
                    >
                      <option value="all">Gemischt</option>
                      {CATEGORIES.map((entry) => <option key={entry.id} value={entry.id}>{entry.title}</option>)}
                    </select>
                  </label>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Zeit pro Lerneinheit</p>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {([10, 20, 30, 45] as const).map((minutes) => (
                      <button
                        key={minutes}
                        type="button"
                        onClick={() => setDailyMinutes(minutes)}
                        className={`rounded-xl px-2 py-3 text-sm font-black ${dailyMinutes === minutes ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
                      >
                        {minutes} min
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Lerntage pro Woche</p>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {([3, 4, 5, 6, 7] as const).map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setWeeklyDays(days)}
                        className={`rounded-xl py-3 text-sm font-black ${weeklyDays === days ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
                      >
                        {days}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {plan && <Button variant="outline" disabled={isBusy} onClick={() => setIsEditing(false)}>Abbrechen</Button>}
                  <Button fullWidth={!plan} disabled={isBusy} onClick={save}>{isBusy ? 'Speichert …' : 'Plan erstellen'}</Button>
                </div>
              </div>
            ) : recommendation ? (
              <div className="mt-6 space-y-5">
                <div className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-purple-600 to-indigo-700 p-6 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-purple-100">{recommendation.phaseLabel}</p>
                      <h3 className="mt-2 text-2xl font-black">Noch {recommendation.daysRemaining} Tage</h3>
                      <p className="mt-2 text-sm font-medium text-purple-100/85">{recommendation.focus}</p>
                    </div>
                    <Target size={42} className="shrink-0 text-white/30" />
                  </div>
                  <div className="mt-5 rounded-2xl bg-white/10 p-4">
                    <div className="flex items-center justify-between text-xs font-black"><span>{plan.completedSessions} Einheiten erledigt</span><span>{Math.round(progress)}%</span></div>
                    <div className="mt-2"><ProgressBar progress={progress} color="bg-white" glow={false} /></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"><Clock3 className="text-purple-600" size={20} /><p className="mt-2 text-xl font-black">{plan.dailyMinutes} min</p><p className="text-xs text-slate-500">heute einplanen</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"><CalendarDays className="text-blue-600" size={20} /><p className="mt-2 text-xl font-black">{recommendation.remainingSessions}</p><p className="text-xs text-slate-500">Einheiten übrig</p></div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                  <div className="flex items-center gap-3"><BookOpenCheck className="text-emerald-600" /><div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Heutige Einheit</p><h3 className="font-black">{categoryTitle}</h3></div></div>
                  <ol className="mt-4 space-y-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                    <li className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800"><span>Karteikarten wiederholen</span><span>{recommendation.cardsToday}</span></li>
                    <li className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800"><span>Prüfungsfragen bearbeiten</span><span>{recommendation.questionsToday}</span></li>
                    <li className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800"><span>Fehler kurz erklären</span><span>5 min</span></li>
                  </ol>
                  <p className="mt-4 text-xs font-medium text-slate-500">Öffne anschließend den Bereich „Lernen“ und wähle {categoryTitle}. Der Plan zählt nur bewusst bestätigte Lerneinheiten.</p>
                </div>

                <Button fullWidth size="lg" disabled={isBusy || completedToday} onClick={completeToday}>
                  <CheckCircle2 size={19} />
                  {completedToday ? 'Heute bereits abgeschlossen' : 'Heutige Einheit abschließen'}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" disabled={isBusy} onClick={() => setIsEditing(true)}><Pencil size={17} /> Bearbeiten</Button>
                  <Button variant="danger" disabled={isBusy} onClick={remove}><Trash2 size={17} /> Entfernen</Button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      )}
    </>
  );
};
