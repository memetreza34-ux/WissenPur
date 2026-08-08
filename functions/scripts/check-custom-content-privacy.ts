import assert from 'node:assert/strict';
import { applyLearningLibraryPolicy } from '../../wissenpur/src/services/learningLibraryPolicy.ts';
import type { CustomQuiz, Question } from '../../wissenpur/src/types.ts';

const baseQuestion: Question = {
  id: 'privacy-question',
  category: 'allgemein',
  question: 'Welche Antwort ist korrekt?',
  options: ['A', 'B'],
  correctAnswer: 0,
  explanation: 'A ist korrekt.',
  difficulty: 'leicht',
};

const deckWithRemoteImage: CustomQuiz = {
  id: 'privacy-deck',
  title: 'Privacy Test',
  createdAt: 1,
  questions: [{
    ...baseQuestion,
    imageUrl: 'https://tracking.example.invalid/pixel.png?uid=123',
  }],
};

const remoteResult = applyLearningLibraryPolicy([deckWithRemoteImage]);
assert.equal(remoteResult.changed, true, 'Ein externes Bild muss die Bibliothek als geändert markieren.');
assert.equal(remoteResult.reason, 'invalid-entry');
assert.equal(remoteResult.decks.length, 1);
assert.equal(remoteResult.decks[0]?.questions.length, 1);
assert.equal(remoteResult.decks[0]?.questions[0]?.imageUrl, undefined, 'Externe Custom-Deck-Bilder müssen entfernt werden.');

const deckWithLocalImage: CustomQuiz = {
  ...deckWithRemoteImage,
  id: 'privacy-deck-local',
  questions: [{
    ...baseQuestion,
    id: 'privacy-question-local',
    imageUrl: '/assets/local-question.png',
  }],
};
const localResult = applyLearningLibraryPolicy([deckWithLocalImage]);
assert.equal(localResult.changed, true);
assert.equal(localResult.decks[0]?.questions[0]?.imageUrl, undefined, 'Custom-Decks unterstützen keinen versteckten Bildkanal, auch nicht über manipulierte lokale Pfade.');

const cleanDeck: CustomQuiz = {
  ...deckWithRemoteImage,
  id: 'privacy-clean',
  questions: [{ ...baseQuestion, id: 'privacy-question-clean' }],
};
const cleanResult = applyLearningLibraryPolicy([cleanDeck]);
assert.equal(cleanResult.changed, false);
assert.deepEqual(cleanResult.decks, [cleanDeck]);

console.log('Custom-Lernsets können keine externen oder manipulierten imageUrl-Requests einschleusen.');
