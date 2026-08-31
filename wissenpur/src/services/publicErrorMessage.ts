const DEFAULT_MESSAGE = 'Die Aktion konnte momentan nicht abgeschlossen werden.';
const FORBIDDEN_TECHNICAL_DETAILS = /(https?:\/\/|cloudfunctions\.net|firebaseapp\.com|googleapis\.com|projects\/|api[-_ ]?key|stack trace|\bat\s+\w+\s*\()/i;

const SAFE_MESSAGE_CODES = new Set([
  'functions/invalid-argument',
  'functions/failed-precondition',
  'functions/already-exists',
  'functions/not-found',
  'functions/deadline-exceeded',
  'functions/resource-exhausted',
]);

const FIXED_CODE_MESSAGES: Record<string, string> = {
  'functions/unauthenticated': 'Bitte melde dich an und versuche es erneut.',
  'functions/permission-denied': 'Diese Aktion ist für das aktuelle Konto nicht erlaubt.',
  'functions/unavailable': 'Der Online-Dienst ist momentan nicht verfügbar. Versuche es später erneut.',
  'functions/internal': 'Der Server konnte die Aktion nicht sicher abschließen.',
  'functions/cancelled': 'Die Online-Aktion wurde abgebrochen.',
  'functions/unknown': 'Die Online-Aktion konnte nicht sicher abgeschlossen werden.',
  'auth/network-request-failed': 'Die Anmeldung benötigt eine funktionierende Internetverbindung.',
  'auth/popup-closed-by-user': 'Die Anmeldung wurde abgebrochen.',
  'auth/popup-blocked': 'Das Anmeldefenster wurde vom Browser blockiert.',
};

const cleanMessage = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/^Firebase(?:Error)?:\s*/i, '')
    .replace(/^\[[^\]]+\]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
};

export const getPublicErrorMessage = (
  error: unknown,
  fallback = DEFAULT_MESSAGE,
): string => {
  if (!error || typeof error !== 'object') return fallback;

  const candidate = error as {
    code?: unknown;
    message?: unknown;
    name?: unknown;
  };
  const code = typeof candidate.code === 'string' ? candidate.code.trim() : '';
  const fixed = code ? FIXED_CODE_MESSAGES[code] : undefined;
  if (fixed) return fixed;

  const message = cleanMessage(candidate.message);
  if (!message || FORBIDDEN_TECHNICAL_DETAILS.test(message)) return fallback;

  if (code && !SAFE_MESSAGE_CODES.has(code)) return fallback;
  return message;
};
