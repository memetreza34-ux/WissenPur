import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  getStats,
  isLocalAccountDataReadable,
  prepareLocalAccountDataForWrite,
} from '../storage';
import { CategoryId } from '../types';
import { syncUserStats } from './firebaseService';
import { getReviewTargetCount } from './reviewQueue';

export type LearningPlanPhase = 'foundation' | 'consolidation' | 'exam';

export interface LearningPlan {
  version: 1;
  examTitle: string;
  examDate: string;
  category: CategoryId | 'all';
  dailyMinutes: 10 | 20 | 30 | 45;
  weeklyDays: 3 | 4 | 5 | 6 | 7;
  createdAt: number;
  updatedAt: number;
  completedSessions: number;
  lastCompletedDate: string | null;
}

export interface LearningPlanRecommendation {
  daysRemaining: number;
  plannedSessions: number;
  remainingSessions: number;
  totalMinutesRemaining: number;
  questionsToday: number;
  cardsToday: number;
  phase: LearningPlanPhase;
  phaseLabel: string;
  focus: string;
}

const STORAGE_KEY = 'wissenpur_learning_plan';

class LearningPlanAuthSessionChangedError extends Error {
  constructor() {
    super('Die Kontositzung hat sich während der Lernplan-Synchronisierung geändert.');
    this.name = 'LearningPlanAuthSessionChangedError';
  }
}

const assertActiveAuthUid = (expectedUid: string): void => {
  if (auth.currentUser?.uid !== expectedUid) {
    throw new LearningPlanAuthSessionChangedError();
  }
};

const isCategory = (value: unknown): value is CategoryId | 'all' =>
  typeof value === 'string' && [
    'all', 'allgemein', 'geschichte', 'geografie', 'wissenschaft', 'technik',
    'sprache', 'deutschland', 'tiere', 'weltall', 'sport', 'kunst', 'musik',
    'filme', 'literatur', 'medizin', 'natur', 'wirtschaft', 'politik',
    'mythologie', 'videospiele', 'flaggen',
  ].includes(value);

const normalizePlan = (value: unknown): LearningPlan | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const title = typeof candidate.examTitle === 'string'
    ? candidate.examTitle.trim().slice(0, 100)
    : '';
  const examDate = typeof candidate.examDate === 'string'
    ? candidate.examDate.slice(0, 10)
    : '';
  const dailyMinutes = [10, 20, 30, 45].includes(Number(candidate.dailyMinutes))
    ? Number(candidate.dailyMinutes) as LearningPlan['dailyMinutes']
    : 20;
  const weeklyDays = [3, 4, 5, 6, 7].includes(Number(candidate.weeklyDays))
    ? Number(candidate.weeklyDays) as LearningPlan['weeklyDays']
    : 5;

  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(examDate) || !isCategory(candidate.category)) {
    return null;
  }

  return {
    version: 1,
    examTitle: title,
    examDate,
    category: candidate.category,
    dailyMinutes,
    weeklyDays,
    createdAt: typeof candidate.createdAt === 'number' ? candidate.createdAt : Date.now(),
    updatedAt: typeof candidate.updatedAt === 'number' ? candidate.updatedAt : Date.now(),
    completedSessions: typeof candidate.completedSessions === 'number'
      ? Math.max(0, Math.trunc(candidate.completedSessions))
      : 0,
    lastCompletedDate: typeof candidate.lastCompletedDate === 'string'
      ? candidate.lastCompletedDate.slice(0, 10)
      : null,
  };
};

const ensureCloudProfile = async (expectedUid: string) => {
  assertActiveAuthUid(expectedUid);
  await syncUserStats(getStats());
  assertActiveAuthUid(expectedUid);
};

export const getLocalLearningPlan = (): LearningPlan | null => {
  if (!isLocalAccountDataReadable()) return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return normalizePlan(JSON.parse(raw));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const saveLearningPlan = async (plan: LearningPlan): Promise<LearningPlan> => {
  const normalized = normalizePlan(plan);
  if (!normalized) throw new Error('Der Lernplan enthält ungültige Angaben.');

  const expectedUid = auth.currentUser?.uid || null;
  prepareLocalAccountDataForWrite();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));

  if (expectedUid) {
    await ensureCloudProfile(expectedUid);
    assertActiveAuthUid(expectedUid);
    await setDoc(
      doc(db, 'users', expectedUid),
      { learningPlan: normalized },
      { merge: true },
    );
    assertActiveAuthUid(expectedUid);
  }
  return normalized;
};

export const loadLearningPlan = async (): Promise<LearningPlan | null> => {
  const expectedUid = auth.currentUser?.uid || null;
  if (expectedUid) prepareLocalAccountDataForWrite();
  const local = getLocalLearningPlan();
  if (!expectedUid) return local;

  const snapshot = await getDoc(doc(db, 'users', expectedUid));
  assertActiveAuthUid(expectedUid);
  const cloud = snapshot.exists() ? normalizePlan(snapshot.data().learningPlan) : null;
  const selected = cloud && (!local || cloud.updatedAt >= local.updatedAt) ? cloud : local;

  assertActiveAuthUid(expectedUid);
  if (selected) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  return selected;
};

export const removeLearningPlan = async (): Promise<void> => {
  const expectedUid = auth.currentUser?.uid || null;
  prepareLocalAccountDataForWrite();
  localStorage.removeItem(STORAGE_KEY);
  if (expectedUid) {
    await ensureCloudProfile(expectedUid);
    assertActiveAuthUid(expectedUid);
    await setDoc(
      doc(db, 'users', expectedUid),
      { learningPlan: null },
      { merge: true },
    );
    assertActiveAuthUid(expectedUid);
  }
};

export const buildLearningRecommendation = (
  plan: LearningPlan,
  dueCards: number,
  today = new Date(),
): LearningPlanRecommendation => {
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const exam = new Date(`${plan.examDate}T00:00:00`);
  const daysRemaining = Math.max(
    0,
    Math.ceil((exam.getTime() - todayStart.getTime()) / 86_400_000),
  );
  const plannedSessions = Math.max(
    1,
    Math.ceil((Math.max(1, daysRemaining) / 7) * plan.weeklyDays),
  );
  const remainingSessions = Math.max(0, plannedSessions - plan.completedSessions);
  const phase: LearningPlanPhase = daysRemaining <= 3
    ? 'exam'
    : daysRemaining <= 14
      ? 'consolidation'
      : 'foundation';
  const questionsToday = plan.dailyMinutes <= 10
    ? 8
    : plan.dailyMinutes <= 20
      ? 12
      : plan.dailyMinutes <= 30
        ? 18
        : 25;
  const cardsToday = getReviewTargetCount(dueCards, plan.dailyMinutes);

  return {
    daysRemaining,
    plannedSessions,
    remainingSessions,
    totalMinutesRemaining: remainingSessions * plan.dailyMinutes,
    questionsToday,
    cardsToday,
    phase,
    phaseLabel: phase === 'exam'
      ? 'Prüfungsphase'
      : phase === 'consolidation'
        ? 'Festigungsphase'
        : 'Grundlagenphase',
    focus: phase === 'exam'
      ? 'Probeklausur, Fehlerfragen und kurze Wiederholungen'
      : phase === 'consolidation'
        ? 'Gemischte Prüfungsfragen und gezielte Lücken schließen'
        : 'Grundlagen aufbauen und Karteikarten regelmäßig wiederholen',
  };
};
