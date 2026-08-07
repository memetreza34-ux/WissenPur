import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test, { after, before, beforeEach } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

const projectId = 'demo-wissenpur-rules';
let testEnv: RulesTestEnvironment;

const profile = (uid: string) => ({
  uid,
  displayName: uid,
  photoURL: '',
  wrongQuestions: [],
  customQuizzes: [],
  darkMode: false,
});

const serverEconomy = (uid: string) => ({
  ...profile(uid),
  economyVersion: 1,
  totalPoints: 120,
  coins: 30,
  currentStreak: 2,
  bestStreak: 3,
  roundsPlayed: 4,
  correctAnswers: 20,
  totalQuestionsAnswered: 30,
  achievements: [],
  powerUps: {
    fiftyFifty: 3,
    timeFreeze: 3,
    secondChance: 3,
  },
});

const validLearningPlan = () => ({
  version: 1,
  examTitle: 'AP1 Elektrotechnik',
  examDate: '2026-10-01',
  category: 'technik',
  dailyMinutes: 20,
  weeklyDays: 5,
  createdAt: 1_786_000_000_000,
  updatedAt: 1_786_000_000_000,
  completedSessions: 0,
  lastCompletedDate: null,
});

const seed = async (path: string, value: Record<string, unknown>) => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), path), value);
  });
};

before(async () => {
  const [host = '127.0.0.1', portText = '8080'] =
    (process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080').split(':');
  const rules = await readFile(
    resolve(process.cwd(), '../wissenpur/firestore.rules'),
    'utf8',
  );

  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      host,
      port: Number(portText),
      rules,
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

after(async () => {
  await testEnv.cleanup();
});

test('a user can create and read only their own profile document', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  const bob = testEnv.authenticatedContext('bob').firestore();
  const anonymous = testEnv.unauthenticatedContext().firestore();
  const aliceRef = doc(alice, 'users/alice');

  await assertSucceeds(setDoc(aliceRef, profile('alice')));
  await assertSucceeds(getDoc(aliceRef));
  await assertFails(getDoc(doc(bob, 'users/alice')));
  await assertFails(getDoc(doc(anonymous, 'users/alice')));
  await assertFails(deleteDoc(aliceRef));
});

test('the browser cannot create or update economy and shop-avatar fields', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();

  await assertFails(setDoc(doc(alice, 'users/alice'), {
    ...profile('alice'),
    totalPoints: 9_999_999,
    coins: 1_000_000,
  }));
  await assertFails(setDoc(doc(alice, 'users/alice'), {
    ...profile('alice'),
    customPhotoURL: 'https://tracker.example/avatar.png',
  }));

  await seed('users/alice', serverEconomy('alice'));
  await assertSucceeds(updateDoc(doc(alice, 'users/alice'), {
    customName: 'Alice Lernprofil',
    darkMode: true,
  }));
  await assertFails(updateDoc(doc(alice, 'users/alice'), {
    totalPoints: 999_999,
  }));
  await assertFails(updateDoc(doc(alice, 'users/alice'), {
    coins: 999_999,
  }));
  await assertFails(updateDoc(doc(alice, 'users/alice'), {
    achievements: ['legend'],
  }));
  await assertFails(updateDoc(doc(alice, 'users/alice'), {
    customPhotoURL: 'https://tracker.example/avatar.png',
  }));
});

test('valid learning plans are allowed and malformed or extended plans are rejected', async () => {
  await seed('users/alice', serverEconomy('alice'));
  const alice = testEnv.authenticatedContext('alice').firestore();
  const userRef = doc(alice, 'users/alice');

  await assertSucceeds(updateDoc(userRef, {
    learningPlan: validLearningPlan(),
  }));

  await assertFails(updateDoc(userRef, {
    learningPlan: {
      ...validLearningPlan(),
      hiddenAdminFlag: true,
    },
  }));

  await assertFails(updateDoc(userRef, {
    learningPlan: {
      version: 1,
      examTitle: 'Ungültig',
      examDate: 'morgen',
      category: 'technik',
      dailyMinutes: 11,
      weeklyDays: 20,
      createdAt: 20,
      updatedAt: 10,
      completedSessions: -1,
      lastCompletedDate: 'irgendwann',
    },
  }));
});

test('custom difficulty times accept only known keys and safe integer ranges', async () => {
  await seed('users/alice', serverEconomy('alice'));
  const alice = testEnv.authenticatedContext('alice').firestore();
  const userRef = doc(alice, 'users/alice');

  await assertSucceeds(updateDoc(userRef, {
    customDifficultyTimes: {
      leicht: 25,
      mittel: 15,
      schwer: 10,
      all: 20,
    },
  }));
  await assertFails(updateDoc(userRef, {
    customDifficultyTimes: {
      leicht: 25,
      ultra: 10,
    },
  }));
  await assertFails(updateDoc(userRef, {
    customDifficultyTimes: {
      leicht: 2,
    },
  }));
  await assertFails(updateDoc(userRef, {
    customDifficultyTimes: {
      mittel: '15',
    },
  }));
});

test('profile learning lists enforce their top-level item limits', async () => {
  await seed('users/alice', serverEconomy('alice'));
  const alice = testEnv.authenticatedContext('alice').firestore();
  const userRef = doc(alice, 'users/alice');

  await assertSucceeds(updateDoc(userRef, {
    wrongQuestions: Array.from({ length: 300 }, (_, index) => ({ id: `q-${index}` })),
    customQuizzes: Array.from({ length: 100 }, (_, index) => ({ id: `deck-${index}` })),
  }));
  await assertFails(updateDoc(userRef, {
    wrongQuestions: Array.from({ length: 301 }, (_, index) => ({ id: `q-${index}` })),
  }));
  await assertFails(updateDoc(userRef, {
    customQuizzes: Array.from({ length: 101 }, (_, index) => ({ id: `deck-${index}` })),
  }));
});

test('trusted leaderboard is public-read and browser-write protected', async () => {
  await seed('trustedLeaderboard/alice', {
    uid: 'alice',
    displayName: 'Alice',
    photoURL: '',
    totalPoints: 120,
    economyVersion: 1,
  });

  const anonymous = testEnv.unauthenticatedContext().firestore();
  const alice = testEnv.authenticatedContext('alice').firestore();
  const admin = testEnv.authenticatedContext('admin', { admin: true }).firestore();

  await assertSucceeds(getDoc(doc(anonymous, 'trustedLeaderboard/alice')));
  await assertFails(setDoc(doc(alice, 'trustedLeaderboard/alice'), {
    uid: 'alice',
    displayName: 'Alice',
    totalPoints: 999_999,
  }));
  await assertFails(deleteDoc(doc(alice, 'trustedLeaderboard/alice')));
  await assertFails(setDoc(doc(admin, 'trustedLeaderboard/alice'), {
    uid: 'alice',
    displayName: 'Admin manipulation',
    totalPoints: 999_999,
  }));
  await assertFails(deleteDoc(doc(admin, 'trustedLeaderboard/alice')));
});

test('quiz answer snapshots and server rate limits stay completely private', async () => {
  await seed('quizSessions/session-1', {
    uid: 'alice',
    questionIds: ['q1'],
    answerKey: [{
      questionId: 'q1',
      correctAnswer: 2,
      optionCount: 4,
      explanation: 'Geheim',
    }],
    status: 'active',
  });
  await seed('serverRateLimits/alice', {
    uid: 'alice',
    quizStarts: 1,
  });

  const alice = testEnv.authenticatedContext('alice').firestore();
  const admin = testEnv.authenticatedContext('admin', { admin: true }).firestore();

  await assertFails(getDoc(doc(alice, 'quizSessions/session-1')));
  await assertFails(setDoc(doc(alice, 'quizSessions/session-2'), { uid: 'alice' }));
  await assertFails(getDoc(doc(alice, 'serverRateLimits/alice')));
  await assertFails(setDoc(doc(alice, 'serverRateLimits/alice'), { quizStarts: 0 }));

  // Admin SDK operations bypass rules in production. The browser admin claim
  // intentionally still cannot inspect answer keys or rate-limit internals.
  await assertFails(getDoc(doc(admin, 'quizSessions/session-1')));
  await assertFails(getDoc(doc(admin, 'serverRateLimits/alice')));
});

test('legacy leaderboard and disabled multiplayer data are admin-only', async () => {
  await seed('leaderboard/alice', {
    uid: 'alice',
    displayName: 'Legacy Alice',
    totalPoints: 999_999,
  });
  await seed('lobbies/lobby-1', { hostId: 'alice' });
  await seed('duels/duel-1', { player1Uid: 'alice', player2Uid: 'bob' });

  const alice = testEnv.authenticatedContext('alice').firestore();
  const admin = testEnv.authenticatedContext('admin', { admin: true }).firestore();

  await assertFails(getDoc(doc(alice, 'leaderboard/alice')));
  await assertFails(getDoc(doc(alice, 'lobbies/lobby-1')));
  await assertFails(getDoc(doc(alice, 'duels/duel-1')));

  await assertSucceeds(getDoc(doc(admin, 'leaderboard/alice')));
  await assertSucceeds(getDoc(doc(admin, 'lobbies/lobby-1')));
  await assertSucceeds(getDoc(doc(admin, 'duels/duel-1')));
});
