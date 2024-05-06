import { isEmpty } from '../../../entity/entity-utils';
import { defineBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTIONS, RARITIES } from '../../card-utils';

export default defineBlueprint({
  id: 'void_pulse',
  name: 'Void Pulse',
  spriteId: 'icon_f4_voidpulse',
  kind: CARD_KINDS.SPELL,
  faction: FACTIONS.ABYSSIAN,
  rarity: RARITIES.COMMON,
  manaCost: 1,
  description: 'Deal 1 damage to a unit and heal your general for 2.',
  isTargetable(session, point) {
    return !isEmpty(session, point);
  },
  meta: { damageAmount: 1, healAmount: 2 },
  async onPlay(session, card, meta) {
    const entity = session.entitySystem.getEntityAt(card.castPoint);
    if (!entity) return;

    const pointLightOptions = {
      color: 0xff0000,
      strength: 2
    };
    const lights = [
      session.fxSystem.addLightOnEntityUntil(entity.id, pointLightOptions),
      session.fxSystem.addLightOnEntityUntil(
        session.playerSystem.activePlayer.general.id,
        pointLightOptions
      ),
      session.fxSystem.changeAmbientLightUntil('#250050', 3)
    ];

    const fxOptions = {
      resourceName: 'fx_f4_voidpulse',
      animationName: 'default',
      offset: { x: 0, y: -75 }
    };

    await Promise.all([
      session.fxSystem.playSfxOnEntity(entity.id, fxOptions),
      session.fxSystem.playSfxOnEntity(
        session.playerSystem.activePlayer.general.id,
        fxOptions
      )
    ]);

    await Promise.all([
      entity.takeDamage(meta.damageAmount, card),
      session.playerSystem.activePlayer.general.heal(meta.healAmount, card)
    ]);

    lights.forEach(stop => stop());
  }
});
