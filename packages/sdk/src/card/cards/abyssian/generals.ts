import { config } from '../../../config';
import { defineBlueprint } from '../../card-lookup';
import { CARD_KINDS, FACTIONS, RARITIES } from '../../card-utils';

export const maev = defineBlueprint({
  id: 'maehv',
  name: 'Maehv Skinsolder',
  spriteId: 'f4_3rdgeneral',
  kind: CARD_KINDS.GENERAL,
  faction: FACTIONS.ABYSSIAN,
  rarity: RARITIES.BASIC,
  manaCost: 0,
  meta: {},
  onPlay() {
    return;
  },
  description: '',
  attack: config.GENERAL_DEFAULT_ATTACK,
  maxHp: config.GENERAL_DEFAULT_HP
});
