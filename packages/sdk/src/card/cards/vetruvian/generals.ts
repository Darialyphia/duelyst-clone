import { config } from '../../../config';
import { defineBlueprint } from '../../card-lookup';
import { CARD_KINDS, FACTIONS, RARITIES } from '../../card-utils';

export const sajj = defineBlueprint({
  id: 'sajj',
  name: 'Scioness Sajj',
  spriteId: 'f3_altgeneral',
  kind: CARD_KINDS.GENERAL,
  faction: FACTIONS.VETRUVIAN,
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
