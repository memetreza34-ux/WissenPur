import assert from 'node:assert/strict';
import test from 'node:test';
import {
  defaultEconomy,
  EconomyDomainError,
  purchaseShopItem,
} from '../src/economyCore.js';
import { equipAvatarItem } from '../src/avatarEquipCore.js';

const expectDomainError = (
  code: EconomyDomainError['code'],
  action: () => unknown,
) => {
  assert.throws(action, (error: unknown) =>
    error instanceof EconomyDomainError && error.code === code,
  );
};

test('an unlocked avatar can be equipped repeatedly without spending coins', () => {
  const funded = defaultEconomy('2026-08-27');
  funded.coins = 1_000;
  const purchased = purchaseShopItem(funded, 'avatar1').state;
  const coinsAfterPurchase = purchased.coins;

  const defaultAvatar = equipAvatarItem(purchased, 'default').state;
  assert.equal(defaultAvatar.customPhotoURL, undefined);
  assert.equal(defaultAvatar.coins, coinsAfterPurchase);

  const equipped = equipAvatarItem(defaultAvatar, 'avatar1');
  assert.equal(equipped.avatarId, 'avatar1');
  assert.equal(equipped.state.customPhotoURL, '/avatars/aneka.svg');
  assert.equal(equipped.state.coins, coinsAfterPurchase);

  const equippedAgain = equipAvatarItem(equipped.state, 'avatar1');
  assert.equal(equippedAgain.state.customPhotoURL, '/avatars/aneka.svg');
  assert.equal(equippedAgain.state.coins, coinsAfterPurchase);
});

test('locked and non-avatar shop items cannot be equipped as avatars', () => {
  const state = defaultEconomy('2026-08-27');

  expectDomainError('failed-precondition', () => equipAvatarItem(state, 'avatar2'));
  expectDomainError('invalid-argument', () => equipAvatarItem(state, 'fiftyFifty'));
  expectDomainError('not-found', () => equipAvatarItem(state, 'avatar-does-not-exist'));
});
