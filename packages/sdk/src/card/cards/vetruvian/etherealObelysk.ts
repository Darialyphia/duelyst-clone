import { defineBlueprint } from '../../card-blueprint';
import {
  FACTIONS,
  RARITIES,
  CARD_KINDS,
  TRIBES,
  gateway,
  structure
} from '../../card-utils';

export default defineBlueprint({
  id: 'ethereal_obelysk',
  name: 'Ethereal Obelysk',
  description: 'Gateway',
  faction: FACTIONS.VETRUVIAN,
  rarity: RARITIES.COMMON,
  spriteId: 'f3_obelyskredsand',
  kind: CARD_KINDS.MINION,
  tribe: TRIBES.STRUCTURE,
  manaCost: 2,
  attack: 0,
  maxHp: 6,
  meta: {},
  onPlay(session, card) {
    gateway(card);
    structure(card);
  }
});
