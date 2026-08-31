import {
  EconomyDomainError,
  SHOP_CATALOG,
  type EconomyState,
} from './economyCore.js';

export interface EquippedAvatarResult {
  state: EconomyState;
  avatarId: string;
}

export const equipAvatarItem = (
  originalState: EconomyState,
  avatarId: string,
): EquippedAvatarResult => {
  const state = structuredClone(originalState);

  if (avatarId === 'default') {
    delete state.customPhotoURL;
    return { state, avatarId };
  }

  if (!(avatarId in SHOP_CATALOG)) {
    throw new EconomyDomainError('not-found', 'Dieser Avatar existiert nicht.');
  }

  const item = SHOP_CATALOG[avatarId as keyof typeof SHOP_CATALOG];
  if (item.kind !== 'avatar') {
    throw new EconomyDomainError('invalid-argument', 'Dieser Shop-Artikel ist kein Avatar.');
  }

  if (!state.unlockedAvatars.includes(avatarId)) {
    throw new EconomyDomainError('failed-precondition', 'Dieser Avatar ist noch nicht freigeschaltet.');
  }

  state.customPhotoURL = item.url;
  return { state, avatarId };
};
