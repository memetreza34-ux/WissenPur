/**
 * Security & Anti-Cheat Utilities for WissenPur
 */

/**
 * Escapes HTML characters to prevent XSS attacks in user-generated content.
 */
export const sanitizeInput = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

/**
 * Validates whether a display name conforms to security and length limits.
 */
export const isValidDisplayName = (name: string): boolean => {
  if (!name) return false;
  const clean = name.trim();
  return clean.length >= 2 && clean.length <= 30 && !/<[^>]*>/g.test(clean);
};

/**
 * Anti-Cheat validator for answer response time.
 * Rejects impossibly fast bot responses (< 150ms for human reading time).
 */
export const isResponseSpeedLegitimate = (answerTimeMs: number): boolean => {
  return answerTimeMs >= 150;
};

/**
 * Anti-Cheat validator for score gains.
 * Ensures points added in a single round do not exceed maximum theoretical points.
 */
export const validatePointsGain = (points: number, questionCount: number = 10): boolean => {
  const maxPossiblePoints = questionCount * 150; // max 150 pts per question (base + speed bonus)
  return points >= 0 && points <= maxPossiblePoints;
};
