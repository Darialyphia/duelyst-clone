import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierStatModifierMixin } from '../../../modifier/mixins/stat-modifier.mixin';
import { defineBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTIONS, RARITIES } from '../../card-utils';

export default defineBlueprint({
  id: 'scions_first_wish',
  name: "Scion's First Wish",
  spriteId: 'icon_f3_scionsfirstwish',
  kind: CARD_KINDS.SPELL,
  faction: FACTIONS.VETRUVIAN,
  rarity: RARITIES.COMMON,
  manaCost: 1,
  description: 'Give a friendly minion +1/+1. Draw a card.',
  meta: { attackAmount: 1, hpAmount: 1 },
  isTargetable(session, point) {
    const entity = session.entitySystem.getEntityAt(point);
    if (!entity) return false;
    return !entity.isGeneral && entity.player.equals(session.playerSystem.activePlayer);
  },
  async onPlay(session, card, meta) {
    const entity = session.entitySystem.getEntityAt(card.castPoint);
    if (!entity) return;
    const removeLight = session.fxSystem.addLightOnEntityUntil(entity.id, {
      color: 0x884400,
      strength: 3,
      offset: {
        x: 0,
        y: 30
      }
    });
    await session.fxSystem.playSfxOnEntity(entity.id, {
      resourceName: 'fx_f3_scionsfirstwish',
      animationName: 'default',
      offset: { x: 0, y: -125 }
    });
    entity.addModifier(
      createEntityModifier({
        stackable: true,
        visible: true,
        name: "Scions's First wish",
        description: `+${meta.attackAmount} / +${meta.hpAmount}`,
        stacks: 1,
        mixins: [
          modifierStatModifierMixin({
            attack: meta.attackAmount,
            maxHp: meta.hpAmount
          })
        ]
      })
    );
    removeLight();
    session.playerSystem.activePlayer.draw(1);
  }
});
