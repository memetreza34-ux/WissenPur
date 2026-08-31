import type { CustomQuiz } from '../types';
import { applyLearningLibraryPolicy } from './learningLibraryPolicy';

export interface LearningLibraryMergeResult {
  decks: CustomQuiz[];
  localNormalized: boolean;
  cloudNormalized: boolean;
  mergedNormalized: boolean;
}

/**
 * Merges the current-device library with a Firestore library without silently
 * discarding guest/offline work during auth hydration.
 *
 * Conflict policy:
 * - local/current-device deck wins when both sides use the same deck ID;
 * - cloud-only decks are appended and preserved;
 * - local decks are placed first so their question IDs remain stable if a
 *   different cloud deck happens to reuse the same question ID;
 * - the complete union is run through the central library policy again so all
 *   deck/question/byte limits and global ID uniqueness still apply.
 *
 * This is intentionally not a full multi-device conflict-free sync protocol.
 * Deletion tombstones and per-deck updatedAt metadata would be required for
 * deterministic cross-device delete/edit conflict resolution.
 */
export const mergeLearningLibraries = (
  localValue: unknown,
  cloudValue: unknown,
): LearningLibraryMergeResult => {
  const local = applyLearningLibraryPolicy(localValue);
  const cloud = applyLearningLibraryPolicy(cloudValue);

  const localDeckIds = new Set(local.decks.map((deck) => deck.id));
  const union: CustomQuiz[] = [
    ...local.decks,
    ...cloud.decks.filter((deck) => !localDeckIds.has(deck.id)),
  ];
  const merged = applyLearningLibraryPolicy(union);

  return {
    decks: merged.decks,
    localNormalized: local.changed,
    cloudNormalized: cloud.changed,
    mergedNormalized: merged.changed,
  };
};
