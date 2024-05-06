import { isEmpty, isEnemy } from '../../../entity/entity-utils';
import { defineBlueprint } from '../../card-lookup';
import { CARD_KINDS, FACTIONS, RARITIES } from '../../card-utils';

export default defineBlueprint({
  id: 'daemonic_lure',
  name: 'Daemonic Lure',
  description: 'Deal 1 damage to an enemy minino then move it to any space.',
  spriteId: 'icon_f4_d2_daemoniclure',
  kind: CARD_KINDS.SPELL,
  faction: FACTIONS.ABYSSIAN,
  rarity: RARITIES.COMMON,
  manaCost: 1,
  meta: { damageAmount: 1 },
  isTargetable(session, point) {
    const entity = session.entitySystem.getEntityAt(point);
    if (!entity) return false;
    if (entity.isGeneral) return false;

    return isEnemy(session, entity.id, session.playerSystem.activePlayer.id);
  },
  followup: {
    minTargetCount: 1,
    maxTargetCount: 1,
    isTargetable(session, point) {
      return isEmpty(session, point);
    }
  },
  async onPlay(session, card, meta) {
    const entity = session.entitySystem.getEntityAt(card.castPoint);
    if (!entity) return;
    await entity.takeDamage(meta.damageAmount, card);
    if (entity.hp <= 0) return;

    // we delay the movement to let the client side damage indicator play out
    // Maybe the SDK should be responsible of displaying the indicators to avoid doing this pepega shit ?
    setTimeout(() => {
      entity.move([card.followupTargets[0]]);
    }, 1000);
  }
});
