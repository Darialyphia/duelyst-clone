import { hasNearbyUnit } from '../../../entity/entity-utils';
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
              console.log(attachedTo.card.summonFollowupTargets);
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
  }
];
