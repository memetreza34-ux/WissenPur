import assert from 'node:assert/strict';
import test from 'node:test';
import { readSessionAnswerKey } from '../src/sessionAnswerKey.js';

test('answer snapshots are validated and returned in question order', () => {
  const result = readSessionAnswerKey([
    {
      questionId: 'q2',
      correctAnswer: 0,
      optionCount: 4,
      explanation: ' Zweite Erklärung ',
    },
    {
      questionId: 'q1',
      correctAnswer: 2,
      optionCount: 4,
      explanation: 'Erste Erklärung',
    },
  ], ['q1', 'q2']);

  assert.deepEqual(result, [
    {
      questionId: 'q1',
      correctAnswer: 2,
      optionCount: 4,
      explanation: 'Erste Erklärung',
    },
    {
      questionId: 'q2',
      correctAnswer: 0,
      optionCount: 4,
      explanation: 'Zweite Erklärung',
    },
  ]);
});

test('answer snapshots reject incomplete, duplicate and foreign entries', () => {
  assert.equal(readSessionAnswerKey([], ['q1']), null);
  assert.equal(readSessionAnswerKey([
    { questionId: 'q1', correctAnswer: 0, optionCount: 4, explanation: '' },
    { questionId: 'q1', correctAnswer: 1, optionCount: 4, explanation: '' },
  ], ['q1', 'q2']), null);
  assert.equal(readSessionAnswerKey([
    { questionId: 'foreign', correctAnswer: 0, optionCount: 4, explanation: '' },
  ], ['q1']), null);
});

test('answer snapshots reject impossible answer indexes and option counts', () => {
  assert.equal(readSessionAnswerKey([
    { questionId: 'q1', correctAnswer: 4, optionCount: 4, explanation: '' },
  ], ['q1']), null);
  assert.equal(readSessionAnswerKey([
    { questionId: 'q1', correctAnswer: 0, optionCount: 1, explanation: '' },
  ], ['q1']), null);
  assert.equal(readSessionAnswerKey([
    { questionId: 'q1', correctAnswer: -1, optionCount: 4, explanation: '' },
  ], ['q1']), null);
});
