import { isEnemy } from '../../../entity/entity-utils';
import { defineBlueprint } from '../../card-lookup';
import {
  FACTIONS,
  RARITIES,
  CARD_KINDS,
  openingGambit,
  getFollowupEntities
} from '../../card-utils';

export default defineBlueprint({
  id: 'bloodtear_alchemist',
  name: 'Bloodtear Alchemist',
  description: 'Opening Gambit: Deal 1 damage to another unit.',
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
  spriteId: 'neutral_bloodstonealchemist',
  kind: CARD_KINDS.MINION,
  manaCost: 2,
  attack: 2,
  maxHp: 1,
  meta: {
    damageAmount: 1
  },
  onPlay(session, card, meta) {
    openingGambit(card, (session, attachedTo) => {
      const [entity] = getFollowupEntities(session, card);
      if (entity) {
        entity.takeDamage(meta.damageAmount, attachedTo.card);
      }
    });
  },
  followup: {
    minTargetCount: 0,
    maxTargetCount: 1,
    isTargetable(session, point, summonedPoint, card) {
      return isEnemy(
        session,
        session.entitySystem.getEntityAt(point)?.id,
        card.player.id
      );
    }
  }
});
