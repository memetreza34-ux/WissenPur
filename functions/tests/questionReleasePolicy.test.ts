import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isTimeSensitiveRankedQuestion,
  normalizeQuestionText,
  selectReleaseQuestions,
} from '../src/questionReleasePolicy.js';

const candidate = (
  id: string,
  question: string,
  explanation = 'Eine stabile Erklärung.',
  category = 'allgemein',
) => ({ id, question, explanation, category });

test('normalization detects wording duplicates despite punctuation and case', () => {
  assert.equal(
    normalizeQuestionText('Welche Sprache hat die meisten Muttersprachler?'),
    normalizeQuestionText(' welche  SPRACHE hat die meisten Muttersprachler!!! '),
  );
});

test('time-sensitive ranked questions are recognized', () => {
  const unsafe = [
    candidate('q1', 'Welcher Planet hat die meisten Monde?', 'Saturn hat nach aktuellem Stand (2023) die meisten entdeckten Monde.'),
    candidate('q2', 'Wer hält den Rekord für die meisten Wochen an der Weltrangliste?'),
    candidate('q3', 'Welches Land hat die meisten Einwohner der Welt?'),
    candidate('q4', 'Wer ist der amtierende Präsident?'),
    candidate('q5', 'Welche Sprache hat die meisten Muttersprachler weltweit?'),
  ];

  for (const question of unsafe) {
    assert.equal(isTimeSensitiveRankedQuestion(question), true, question.id);
  }
});

test('stable historical and scientific questions remain eligible', () => {
  const safe = [
    candidate('q1', 'Wer war der erste Präsident der USA?', 'George Washington amtierte von 1789 bis 1797.'),
    candidate('q2', 'Wie viele Bundesländer hat Deutschland?'),
    candidate('q3', 'Welche Einheit wird für elektrische Spannung verwendet?'),
    candidate('q4', 'Welches Land gewann die Fußball-Weltmeisterschaft 2014?'),
  ];

  for (const question of safe) {
    assert.equal(isTimeSensitiveRankedQuestion(question), false, question.id);
  }
});

test('release selection excludes stale and duplicate questions with reasons', () => {
  const result = selectReleaseQuestions([
    candidate('safe-1', 'Wie viele Minuten hat eine Stunde?'),
    candidate('duplicate', 'WIE VIELE Minuten hat eine Stunde!!!'),
    candidate('stale', 'Welcher Tennisspieler führt aktuell die Weltrangliste?'),
    candidate('safe-2', 'Was ist die Quadratwurzel von 81?'),
  ]);

  assert.deepEqual(result.accepted.map((question) => question.id), [
    'safe-1',
    'safe-2',
  ]);
  assert.deepEqual(result.excluded, [
    {
      id: 'duplicate',
      category: 'allgemein',
      reason: 'duplicate-question',
      duplicateOf: 'safe-1',
    },
    {
      id: 'stale',
      category: 'allgemein',
      reason: 'time-sensitive',
    },
  ]);
});
