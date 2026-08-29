import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getEffectivePublicLeaderboardLimit,
  normalizePublicLeaderboardLimit,
  redactPublicLeaderboardAccountIds,
  sanitizePublicLeaderboardAvatar,
  sanitizePublicLeaderboardEntry,
  selectPublicLeaderboardEntries,
} from '../src/leaderboardPublicCore.js';

test('leaderboard limit defaults and clamps safely', () => {
  assert.equal(normalizePublicLeaderboardLimit(undefined), 10);
  assert.equal(normalizePublicLeaderboardLimit(0), 1);
  assert.equal(normalizePublicLeaderboardLimit(1), 1);
  assert.equal(normalizePublicLeaderboardLimit(25), 25);
  assert.equal(normalizePublicLeaderboardLimit(500), 100);
  assert.equal(normalizePublicLeaderboardLimit(1.5), null);
  assert.equal(normalizePublicLeaderboardLimit('10'), null);
});

test('guest leaderboard responses are capped more tightly than authenticated responses', () => {
  assert.equal(getEffectivePublicLeaderboardLimit(10, false), 10);
  assert.equal(getEffectivePublicLeaderboardLimit(100, false), 25);
  assert.equal(getEffectivePublicLeaderboardLimit(100, true), 100);
  assert.equal(getEffectivePublicLeaderboardLimit(5, true), 5);
});

test('only released same-origin avatar paths survive', () => {
  assert.equal(sanitizePublicLeaderboardAvatar('/avatars/aneka.svg'), '/avatars/aneka.svg');
  assert.equal(sanitizePublicLeaderboardAvatar('/avatars/robot-gold.svg'), '/avatars/robot-gold.svg');
  assert.equal(sanitizePublicLeaderboardAvatar('https://accounts.google.com/avatar.png'), '');
  assert.equal(sanitizePublicLeaderboardAvatar('//evil.example/avatar.svg'), '');
  assert.equal(sanitizePublicLeaderboardAvatar('/avatars/../secret.svg'), '');
  assert.equal(sanitizePublicLeaderboardAvatar('/avatars/a.png'), '');
});

test('valid row is reduced to the public display schema', () => {
  const entry = sanitizePublicLeaderboardEntry('alice', {
    uid: 'alice',
    displayName: '  Alice   Lernprofi  ',
    photoURL: '/avatars/aneka.svg',
    totalPoints: 1234,
    economyVersion: 1,
    updatedAt: new Date(),
    email: 'should-not-leak@example.invalid',
    customQuizzes: ['secret'],
  });

  assert.deepEqual(entry, {
    uid: 'alice',
    displayName: 'Alice Lernprofi',
    photoURL: '/avatars/aneka.svg',
    totalPoints: 1234,
  });
  assert.equal('email' in (entry || {}), false);
  assert.equal('customQuizzes' in (entry || {}), false);
});

test('malformed identity, version or scores are dropped', () => {
  const base = {
    uid: 'alice',
    displayName: 'Alice',
    photoURL: '',
    totalPoints: 10,
    economyVersion: 1,
  };

  assert.equal(sanitizePublicLeaderboardEntry('alice', { ...base, uid: 'bob' }), null);
  assert.equal(sanitizePublicLeaderboardEntry('alice', { ...base, displayName: '' }), null);
  assert.equal(sanitizePublicLeaderboardEntry('alice', { ...base, economyVersion: 0 }), null);
  assert.equal(sanitizePublicLeaderboardEntry('alice', { ...base, totalPoints: -1 }), null);
  assert.equal(sanitizePublicLeaderboardEntry('alice', { ...base, totalPoints: 1.2 }), null);
  assert.equal(sanitizePublicLeaderboardEntry('alice', { ...base, totalPoints: 100_000_001 }), null);
});

test('selection skips malformed rows and honors the requested output limit', () => {
  const entries = selectPublicLeaderboardEntries([
    {
      id: 'broken',
      data: {
        uid: 'other',
        displayName: 'Broken',
        photoURL: '',
        totalPoints: 999,
        economyVersion: 1,
      },
    },
    {
      id: 'alice',
      data: {
        uid: 'alice',
        displayName: 'Alice',
        photoURL: '/avatars/aneka.svg',
        totalPoints: 500,
        economyVersion: 1,
      },
    },
    {
      id: 'bob',
      data: {
        uid: 'bob',
        displayName: 'Bob',
        photoURL: 'https://external.invalid/bob.png',
        totalPoints: 400,
        economyVersion: 1,
      },
    },
    {
      id: 'carol',
      data: {
        uid: 'carol',
        displayName: 'Carol',
        photoURL: '',
        totalPoints: 300,
        economyVersion: 1,
      },
    },
  ], 2);

  assert.deepEqual(entries, [
    {
      uid: 'alice',
      displayName: 'Alice',
      photoURL: '/avatars/aneka.svg',
      totalPoints: 500,
    },
    {
      uid: 'bob',
      displayName: 'Bob',
      photoURL: '',
      totalPoints: 400,
    },
  ]);
});

test('guest transport redacts every stable account identifier', () => {
  const source = [
    { uid: 'alice-firebase-uid', displayName: 'Alice', photoURL: '', totalPoints: 500 },
    { uid: 'bob-firebase-uid', displayName: 'Bob', photoURL: '', totalPoints: 400 },
  ];

  const redacted = redactPublicLeaderboardAccountIds(source);

  assert.deepEqual(redacted.map((entry) => entry.uid), ['rank-1', 'rank-2']);
  assert.equal(source[0]?.uid, 'alice-firebase-uid', 'Redaktion darf den internen Cache nicht mutieren.');
});

test('authenticated transport reveals only the caller own known uid', () => {
  const source = [
    { uid: 'alice-firebase-uid', displayName: 'Alice', photoURL: '', totalPoints: 500 },
    { uid: 'bob-firebase-uid', displayName: 'Bob', photoURL: '', totalPoints: 400 },
    { uid: 'carol-firebase-uid', displayName: 'Carol', photoURL: '', totalPoints: 300 },
  ];

  const redacted = redactPublicLeaderboardAccountIds(source, 'bob-firebase-uid');

  assert.deepEqual(
    redacted.map((entry) => entry.uid),
    ['rank-1', 'bob-firebase-uid', 'rank-3'],
  );
  assert.equal(redacted[1]?.displayName, 'Bob');
  assert.equal(redacted[1]?.totalPoints, 400);
});
