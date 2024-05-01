import { Vec3 } from '@game/shared';
import { config } from '../../../config';
import { isEmpty, isEnemy } from '../../../entity/entity-utils';
import { isWithinCells } from '../../../utils/targeting';
import { type CardBlueprint } from '../../card-lookup';
import {
  CARD_KINDS,
  FACTIONS,
  getFollowupEntities,
  openingGambit,
  RARITIES
} from '../../card-utils';

export const abyssian: CardBlueprint[] = [
  {
    id: 'maehv',
    name: 'Maehv Skinsolder',
    spriteId: 'f4_3rdgeneral',
    kind: CARD_KINDS.GENERAL,
    faction: FACTIONS.ABYSSIAN,
    rarity: RARITIES.BASIC,
    manaCost: 0,
    onPlay() {
      return;
    },
    description: '',
    attack: config.GENERAL_DEFAULT_ATTACK,
    maxHp: config.GENERAL_DEFAULT_HP
  },
  {
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
    async onPlay(session, card) {
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
        entity.takeDamage(1, card),
        session.playerSystem.activePlayer.general.heal(2, card)
      ]);

      lights.forEach(cleanup => cleanup());
    }
  },
  {
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
      isTargetable(session, point, summonedPoint) {
        if (!isWithinCells(summonedPoint, point, 1)) return false;

        const entity = session.entitySystem.getEntityAt(point);
        if (!entity) return false;

        if (entity.isGeneral) return false;

        return entity.hp < entity.maxHp;
        // return entity.attack <= 3;
      }
    }
  },
  {
    id: 'daemonic_lure',
    name: 'Daemonic Lure',
    description: 'Deal 1 damage to an enemy minino then move it to any space.',
    spriteId: 'icon_f4_d2_daemoniclure',
    kind: CARD_KINDS.SPELL,
    faction: FACTIONS.ABYSSIAN,
    rarity: RARITIES.COMMON,
    manaCost: 1,
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
    async onPlay(session, card) {
      const entity = session.entitySystem.getEntityAt(card.castPoint);
      if (!entity) return;
      await entity.takeDamage(1, card);
      if (entity.hp <= 0) return;

      // we delay the movement to let the client side damage indicator play out
      // Maybe the SDK should be responsible of displaying the indicators to avoid doing this pepega shit ?
      setTimeout(() => {
        entity.move([card.followupTargets[0]]);
      }, 1000);
    }
  }
];
