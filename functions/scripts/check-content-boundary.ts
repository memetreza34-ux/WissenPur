import {
  CATEGORIES as RANKED_CATEGORIES,
  QUESTIONS as RANKED_QUESTIONS,
} from '../content/rankedQuestions.ts';
import {
  CATEGORIES as PUBLIC_CATEGORIES,
  QUESTIONS as OFFLINE_QUESTIONS,
} from '../../wissenpur/src/data.ts';

const rankedIds = new Set(RANKED_QUESTIONS.map((question) => question.id));
const offlineIds = new Set(OFFLINE_QUESTIONS.map((question) => question.id));

const duplicateRankedIds = RANKED_QUESTIONS
  .map((question) => question.id)
  .filter((id, index, ids) => ids.indexOf(id) !== index);
const duplicateOfflineIds = OFFLINE_QUESTIONS
  .map((question) => question.id)
  .filter((id, index, ids) => ids.indexOf(id) !== index);

if (duplicateRankedIds.length > 0) {
  throw new Error(`Duplicate ranked IDs: ${[...new Set(duplicateRankedIds)].join(', ')}`);
}
if (duplicateOfflineIds.length > 0) {
  throw new Error(`Duplicate offline IDs: ${[...new Set(duplicateOfflineIds)].join(', ')}`);
}

const rankedCategoryIds = RANKED_CATEGORIES.map((category) => category.id);
const publicCategoryIds = PUBLIC_CATEGORIES.map((category) => category.id);
const duplicateRankedCategoryIds = rankedCategoryIds.filter(
  (id, index, ids) => ids.indexOf(id) !== index,
);
const duplicatePublicCategoryIds = publicCategoryIds.filter(
  (id, index, ids) => ids.indexOf(id) !== index,
);
if (duplicateRankedCategoryIds.length > 0) {
  throw new Error(`Duplicate ranked category IDs: ${[...new Set(duplicateRankedCategoryIds)].join(', ')}`);
}
if (duplicatePublicCategoryIds.length > 0) {
  throw new Error(`Duplicate public category IDs: ${[...new Set(duplicatePublicCategoryIds)].join(', ')}`);
}

const sortedRankedCategories = [...rankedCategoryIds].sort();
const sortedPublicCategories = [...publicCategoryIds].sort();
if (JSON.stringify(sortedRankedCategories) !== JSON.stringify(sortedPublicCategories)) {
  const rankedOnly = sortedRankedCategories.filter((id) => !sortedPublicCategories.includes(id));
  const publicOnly = sortedPublicCategories.filter((id) => !sortedRankedCategories.includes(id));
  throw new Error(
    `Ranked/public category catalogs differ. Ranked-only: ${rankedOnly.join(', ') || 'none'}; public-only: ${publicOnly.join(', ') || 'none'}.`,
  );
}

const rankedCategorySet = new Set(rankedCategoryIds);
const publicCategorySet = new Set(publicCategoryIds);
for (const question of RANKED_QUESTIONS) {
  if (!rankedCategorySet.has(question.category)) {
    throw new Error(`Ranked question ${question.id} uses undeclared category ${question.category}.`);
  }
}
for (const question of OFFLINE_QUESTIONS) {
  if (!publicCategorySet.has(question.category)) {
    throw new Error(`Offline question ${question.id} uses undeclared category ${question.category}.`);
  }
}

const invalidOfflineIds = [...offlineIds].filter((id) => !id.startsWith('offline-'));
if (invalidOfflineIds.length > 0) {
  throw new Error(`Public practice questions must use offline-* IDs: ${invalidOfflineIds.join(', ')}`);
}

const invalidRankedIds = [...rankedIds].filter((id) => id.startsWith('offline-'));
if (invalidRankedIds.length > 0) {
  throw new Error(`Ranked questions may not use offline-* IDs: ${invalidRankedIds.join(', ')}`);
}

const overlap = [...offlineIds].filter((id) => rankedIds.has(id));
if (overlap.length > 0) {
  throw new Error(`Ranked and offline question IDs overlap: ${overlap.join(', ')}`);
}

for (const question of OFFLINE_QUESTIONS) {
  if (question.options.length !== 4) {
    throw new Error(`Offline question ${question.id} must contain exactly four options.`);
  }
  if (!Number.isInteger(question.correctAnswer) || question.correctAnswer < 0 || question.correctAnswer > 3) {
    throw new Error(`Offline question ${question.id} has an invalid correct answer.`);
  }
  if (question.imageUrl) {
    throw new Error(`Offline question ${question.id} may not trigger an external image request.`);
  }
}

for (const question of RANKED_QUESTIONS) {
  if (question.imageUrl) {
    throw new Error(`Ranked question ${question.id} may not trigger an external image request until a same-origin asset pipeline is explicitly released.`);
  }
}

console.log(
  `Content boundary verified: ${RANKED_QUESTIONS.length} ranked questions, ${OFFLINE_QUESTIONS.length} offline questions and ${publicCategoryIds.length} aligned categories; no question-triggered remote images.`,
);
