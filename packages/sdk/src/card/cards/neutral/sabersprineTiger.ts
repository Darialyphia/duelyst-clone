import { defineBlueprint } from '../../card-blueprint';
import { FACTIONS, RARITIES, CARD_KINDS, rush } from '../../card-utils';

export default defineBlueprint({
  id: 'saberspine_tiger',
  name: 'Saberspine Tiger',
  description: 'Rush',
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
  spriteId: 'neutral_beastsaberspinetiger',
  kind: CARD_KINDS.MINION,
  manaCost: 3,
  attack: 3,
  maxHp: 2,
  meta: {},
  onPlay(session, card) {
    rush(card);
  }
});
