import type { Values } from '@game/shared';

export const CARD_KINDS = {
  MINION: 'MINION',
  GENERAL: 'GENERAL',
  SPELL: 'SPELL',
  ARTIFACT: 'ARTIFACT'
} as const;

export type CardKind = Values<typeof CARD_KINDS>;
