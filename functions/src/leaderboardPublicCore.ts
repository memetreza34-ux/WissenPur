export interface PublicLeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  totalPoints: number;
}

export interface LeaderboardSourceRow {
  id: string;
  data: Record<string, unknown>;
}

const cleanString = (value: unknown, maxLength: number): string => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
};

export const normalizePublicLeaderboardLimit = (value: unknown): number | null => {
  if (value === undefined) return 10;
  if (typeof value !== 'number' || !Number.isInteger(value)) return null;
  return Math.min(100, Math.max(1, value));
};

export const sanitizePublicLeaderboardAvatar = (value: unknown): string => {
  const candidate = cleanString(value, 1_000);
  if (!candidate) return '';
  return /^\/avatars\/[a-z0-9-]+\.svg$/i.test(candidate) ? candidate : '';
};

export const sanitizePublicLeaderboardEntry = (
  documentId: string,
  value: Record<string, unknown>,
): PublicLeaderboardEntry | null => {
  const uid = cleanString(value.uid, 128);
  const displayName = cleanString(value.displayName, 100);
  const totalPoints = value.totalPoints;

  if (
    !uid ||
    uid !== documentId ||
    !displayName ||
    value.economyVersion !== 1 ||
    typeof totalPoints !== 'number' ||
    !Number.isInteger(totalPoints) ||
    totalPoints < 0 ||
    totalPoints > 100_000_000
  ) {
    return null;
  }

  return {
    uid,
    displayName,
    photoURL: sanitizePublicLeaderboardAvatar(value.photoURL),
    totalPoints,
  };
};

export const selectPublicLeaderboardEntries = (
  rows: readonly LeaderboardSourceRow[],
  limit: number,
): PublicLeaderboardEntry[] => {
  const safeLimit = Math.min(100, Math.max(1, Math.trunc(limit) || 10));
  const entries: PublicLeaderboardEntry[] = [];

  for (const row of rows) {
    const entry = sanitizePublicLeaderboardEntry(row.id, row.data);
    if (!entry) continue;
    entries.push(entry);
    if (entries.length >= safeLimit) break;
  }

  return entries;
};
