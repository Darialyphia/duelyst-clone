import { isWithinCells } from '../../../utils/targeting';
import { defineBlueprint } from '../../card-blueprint';
import {
  CARD_KINDS,
  FACTIONS,
  RARITIES,
  openingGambit,
  getFollowupEntities
} from '../../card-utils';

export default defineBlueprint({
  id: 'night_sorrow_assasin',
  name: 'Night Sorrow Assasin',
  description: 'Opening Gambit: Destroy an injured nearby minion.',
  spriteId: 'f4_nightsorrow',
  kind: CARD_KINDS.MINION,
  faction: FACTIONS.ABYSSIAN,
  rarity: RARITIES.RARE,
  manaCost: 3,
  attack: 3,
  maxHp: 1,
  meta: { maxAttack: 3 },
  onPlay(session, card) {
    openingGambit(card, async session => {
      const [entity] = getFollowupEntities(session, card);
      if (!entity) return;

      await session.fxSystem.playSfxOnEntity(entity.id, {
        resourceName: 'fx_impactred',
        animationName: 'impactredmedium'
      });
      entity.destroy();
    });
  },
  followup: {
    minTargetCount: 0,
    maxTargetCount: 1,
    isTargetable(session, point, summonedPoint, card) {
      if (!isWithinCells(summonedPoint, point, 1)) return false;

      const entity = session.entitySystem.getEntityAt(point);
      if (!entity) return false;

      if (entity.isGeneral) return false;

      // return entity.hp < entity.maxHp;
      return entity.attack <= card.blueprint.meta.maxAttack;
    }
  }
});
