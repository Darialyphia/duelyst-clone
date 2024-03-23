import { hasNearbyUnit, isEnemy } from '../../../entity/entity-utils';
import { modifierOpeningGambitMixin } from '../../../modifier/mixins/opening-gambit.mixin';
import { createModifier } from '../../../modifier/modifier';
import { type CardBlueprint } from '../../card-lookup';
import { CARD_KINDS } from '../../card-utils';

export const neutral: CardBlueprint[] = [
  {
    id: 'healing_mystic',
    name: 'Healing Mystic',
    description: 'Opening Gambit: Restore 2 Health to anything.',
    spriteId: 'neutral_healingmystic',
    kind: CARD_KINDS.MINION,
    manaCost: 2,
    attack: 2,
    maxHp: 3,
    modifiers: [
      createModifier({
        id: 'healing_mystic',
        visible: false,
        stackable: false,
        mixins: [
          modifierOpeningGambitMixin({
            keywords: [],
            handler(session, attachedTo) {
              const [point] = attachedTo.card.summonFollowupTargets;
              const entity = session.entitySystem.getEntityAt(point);
              if (entity) {
                entity.heal(2, attachedTo.card);
              }
            }
          })
        ]
      })
    ],
    summonedFollowup: {
      minTargetCount: 0,
      maxTargetCount: 1,
      isTargetable(session, point, summonedPoint) {
        return hasNearbyUnit(session, summonedPoint, point);
      }
    }
  },
  {
    id: 'bloodtear_alchemist',
    name: 'Bloodtear Alchemist',
    description: 'Opening Gambit: Deal 1 damage to another unit.',
    spriteId: 'neutral_bloodstonealchemist',
    kind: CARD_KINDS.MINION,
    manaCost: 2,
    attack: 2,
    maxHp: 1,
    modifiers: [
      createModifier({
        id: 'bloodtear_alchemist',
        visible: false,
        stackable: false,
        mixins: [
          modifierOpeningGambitMixin({
            keywords: [],
            handler(session, attachedTo) {
              const [point] = attachedTo.card.summonFollowupTargets;

              const entity = session.entitySystem.getEntityAt(point);
              if (entity) {
                attachedTo.dealDamage(1, entity);
              }
            }
          })
        ]
      })
    ],
    summonedFollowup: {
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
  }
];
