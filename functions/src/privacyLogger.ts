import { logger } from 'firebase-functions';

const boundedToken = (value: unknown, maxLength = 80): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().replace(/[^a-zA-Z0-9._/-]/g, '').slice(0, maxLength);
  return normalized || undefined;
};

/**
 * Logs only coarse technical diagnostics. Never pass request data, UIDs,
 * session IDs, emails, question text or other user-controlled values here.
 */
export function logUnexpectedServerError(event: string, error: unknown): void {
  const errorName = error instanceof Error
    ? boundedToken(error.name, 60)
    : undefined;
  const errorCode = error && typeof error === 'object' && 'code' in error
    ? boundedToken((error as { code?: unknown }).code, 80)
    : undefined;

  logger.error(event, {
    ...(errorName ? { errorName } : {}),
    ...(errorCode ? { errorCode } : {}),
  });
}
