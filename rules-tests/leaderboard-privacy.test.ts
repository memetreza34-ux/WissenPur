import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test, { after, before, beforeEach } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const projectId = 'demo-wissenpur-leaderboard-privacy';
let testEnv: RulesTestEnvironment;

const seed = async (path: string, value: Record<string, unknown>) => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), path), value);
  });
};

const validLeaderboard = (uid = 'alice') => ({
  uid,
  displayName: 'Alice',
  photoURL: '/avatars/aneka.svg',
  totalPoints: 120,
  economyVersion: 1,
});

before(async () => {
  const [host = '127.0.0.1', portText = '8080'] =
    (process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080').split(':');
  const rules = await readFile(resolve(process.cwd(), '../wissenpur/firestore.rules'), 'utf8');

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

test('minimal trusted leaderboard document is public-readable', async () => {
  await seed('trustedLeaderboard/alice', validLeaderboard());
  const anonymous = testEnv.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(anonymous, 'trustedLeaderboard/alice')));
});

test('empty local avatar is allowed for users without a shop avatar', async () => {
  await seed('trustedLeaderboard/alice', {
    ...validLeaderboard(),
    photoURL: '',
  });
  const anonymous = testEnv.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(anonymous, 'trustedLeaderboard/alice')));
});

test('unexpected sensitive fields fail closed for public leaderboard reads', async () => {
  await seed('trustedLeaderboard/alice', {
    ...validLeaderboard(),
    email: 'alice@example.invalid',
  });
  const anonymous = testEnv.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(anonymous, 'trustedLeaderboard/alice')));
});

test('external avatar URLs fail closed for public leaderboard reads', async () => {
  await seed('trustedLeaderboard/alice', {
    ...validLeaderboard(),
    photoURL: 'https://accounts.google.com/avatar.png',
  });
  const anonymous = testEnv.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(anonymous, 'trustedLeaderboard/alice')));
});

test('mismatched identity and malformed score fail closed', async () => {
  const anonymous = testEnv.unauthenticatedContext().firestore();

  await seed('trustedLeaderboard/alice', validLeaderboard('bob'));
  await assertFails(getDoc(doc(anonymous, 'trustedLeaderboard/alice')));

  await testEnv.clearFirestore();
  await seed('trustedLeaderboard/alice', {
    ...validLeaderboard(),
    totalPoints: -1,
  });
  await assertFails(getDoc(doc(anonymous, 'trustedLeaderboard/alice')));
});
