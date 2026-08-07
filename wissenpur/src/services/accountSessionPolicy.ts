export type AccountIdentity = string | null | undefined;

/**
 * Returns true when local account-bound browser data must be discarded before
 * rendering the next Firebase identity.
 *
 * - undefined -> anything: initial Firebase hydration, never clear yet.
 * - same identity: no transition.
 * - anonymous -> account: explicit guest-data claim on first login.
 * - account -> anonymous: logout/token loss, clear.
 * - account A -> account B: clear to prevent cross-account leakage.
 */
export const shouldClearLocalAccountDataForTransition = (
  previous: AccountIdentity,
  next: string | null,
): boolean => {
  if (previous === undefined || previous === next) return false;
  if (previous === null && next !== null) return false;
  return true;
};
