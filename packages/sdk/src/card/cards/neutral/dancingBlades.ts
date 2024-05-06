import { getEntityInFront } from '../../../entity/entity-utils';
import { defineBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTIONS, RARITIES, openingGambit } from '../../card-utils';

export default defineBlueprint({
  id: 'dancing_blades',
  name: 'Dancing Blades',
  description: 'Opening Gambit: Deal 3 damage to ANY minion in front of this.',
  kind: CARD_KINDS.MINION,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
  spriteId: 'neutral_monsterdancingblades',
  manaCost: 5,
  attack: 4,
  maxHp: 6,
  meta: { damageAmount: 3 },
  onPlay(session, card, meta) {
    openingGambit(card, () => {
      const target = getEntityInFront(session, card.entity);
      if (!target) return;
      target.takeDamage(meta.damageAmount, card);
    });
  }
});
