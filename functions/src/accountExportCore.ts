const privateQuizSessionFields = new Set([
  'answerKey',
]);

export const sanitizeQuizSessionForExport = (
  value: Record<string, unknown>,
): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};

  for (const [key, fieldValue] of Object.entries(value)) {
    if (privateQuizSessionFields.has(key)) continue;
    sanitized[key] = fieldValue;
  }

  return sanitized;
};
