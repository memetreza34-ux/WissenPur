import assert from 'node:assert/strict';
import test from 'node:test';
import { sanitizeQuizSessionForExport } from '../src/accountExportCore.js';

test('account exports never contain the trusted answer key', () => {
  const source = {
    uid: 'alice',
    status: 'active',
    questionIds: ['q1', 'q2'],
    answerKey: [
      { questionId: 'q1', correctAnswer: 2, optionCount: 4 },
      { questionId: 'q2', correctAnswer: 0, optionCount: 4 },
    ],
    expiresAt: '2026-08-06T17:30:00.000Z',
  };

  const sanitized = sanitizeQuizSessionForExport(source);

  assert.deepEqual(sanitized, {
    uid: 'alice',
    status: 'active',
    questionIds: ['q1', 'q2'],
    expiresAt: '2026-08-06T17:30:00.000Z',
  });
  assert.ok(!('answerKey' in sanitized));
  assert.ok('answerKey' in source, 'The source object must remain unchanged.');
});

test('submitted public result metadata remains exportable', () => {
  const sanitized = sanitizeQuizSessionForExport({
    uid: 'alice',
    status: 'submitted',
    result: {
      correct: 7,
      total: 10,
      pointsEarned: 70,
    },
    answerKey: [{ questionId: 'q1', correctAnswer: 2 }],
  });

  assert.deepEqual(sanitized, {
    uid: 'alice',
    status: 'submitted',
    result: {
      correct: 7,
      total: 10,
      pointsEarned: 70,
    },
  });
});
