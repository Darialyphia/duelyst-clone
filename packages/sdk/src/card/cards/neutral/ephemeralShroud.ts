import { dispelAt } from '../../../modifier/modifier-utils';
import { isWithinCells } from '../../../utils/targeting';
import { defineBlueprint } from '../../card-lookup';
import { FACTIONS, RARITIES, CARD_KINDS, openingGambit } from '../../card-utils';

export default defineBlueprint({
  id: 'ephemeral_shroud',
  name: 'Ephemeral Shroud',
  description: 'Opening Gambit: Dispel 1 nearby space.',
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
  spriteId: 'neutral_monsterdreamoracle',
  kind: CARD_KINDS.MINION,
  manaCost: 2,
  attack: 2,
  maxHp: 2,
  meta: {},
  onPlay(session, card) {
    openingGambit(card, (session, attachedTo) => {
      const [point] = attachedTo.card.followupTargets;
      if (!point) return;
      dispelAt(session, point);
    });
  },
  followup: {
    minTargetCount: 0,
    maxTargetCount: 1,
    isTargetable(session, point, summonedPoint) {
      return isWithinCells(summonedPoint, point, 1);
    }
  }
});
