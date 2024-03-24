import { hasNearbyUnit, isEmpty, isEnemy } from '../../../entity/entity-utils';
import { modifierDyingWishMixin } from '../../../modifier/mixins/dying-wish.mixin';
import { modifierGameEventMixin } from '../../../modifier/mixins/game-event.mixin';
import { interceptorMixin } from '../../../modifier/mixins/interceptor.mixin';
import { modifierOpeningGambitMixin } from '../../../modifier/mixins/opening-gambit.mixin';
import { createModifier } from '../../../modifier/modifier';
import { dispelAt } from '../../../modifier/modifier-utils';
import { isWithinCells } from '../../../utils/targeting';
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
              if (!point) return;
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
      isTargetable(session, point) {
        return !isEmpty(session, point);
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
              if (!point) return;

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
  },
  {
    id: 'araki_headhunter',
    name: 'Araki Headhunter',
    description:
      'Whenever you summon a minion with Opening Gambit from your action bar, gain +2 Attack.',
    spriteId: 'neutral_arakiheadhunter',
    kind: CARD_KINDS.MINION,
    manaCost: 2,
    attack: 1,
    maxHp: 3,
    modifiers: [
      createModifier({
        id: 'araki_headhunter',
        visible: false,
        stackable: false,
        mixins: [
          modifierGameEventMixin({
            eventName: 'entity:created',
            keywords: [],
            listener([entity], { attachedTo }) {
              if (!entity.hasKeyword('Opening Gambit')) return;
              if (attachedTo.isEnemy(entity.id)) return;

              const id = 'araki_headhunter_buff';
              const modifier = createModifier({
                id,
                visible: true,
                name: 'Hunter',
                description: '+2 Attack.',
                stackable: true,
                stacks: 1,
                mixins: [
                  interceptorMixin({
                    key: 'attack',
                    duration: Infinity,
                    keywords: [],
                    interceptor: atk => {
                      const modifier = attachedTo.getModifier(id)!;
                      return atk + 2 * modifier.stacks!;
                    }
                  })
                ]
              });

              attachedTo.addModifier(modifier);
            }
          })
        ]
      })
    ]
  },
  {
    id: 'azure_horn_shaman',
    name: 'Azure Horn Shaman',
    description: 'Dying Wish: Give +4 Health to friendly minions around it.',
    spriteId: 'neutral_mercazurehorn',
    kind: CARD_KINDS.MINION,
    manaCost: 2,
    attack: 1,
    maxHp: 4,
    modifiers: [
      createModifier({
        id: 'azure_horn_shaman',
        visible: false,
        stackable: false,
        mixins: [
          modifierDyingWishMixin({
            keywords: [],
            listener(event, { session, attachedTo }) {
              session.entitySystem
                .getNearbyEntities(attachedTo.position)
                .filter(entity => !entity.isGeneral && attachedTo.isAlly(entity.id))
                .forEach(entity => {
                  entity.addInterceptor('maxHp', val => val + 4);
                });
            }
          })
        ]
      })
    ]
  },
  {
    id: 'ephemeral_shroud',
    name: 'Ephemeral Shroud',
    description: 'Opening Gambit: Dispel 1 nearby space.',
    spriteId: 'neutral_monsterdreamoracle',
    kind: CARD_KINDS.MINION,
    manaCost: 2,
    attack: 2,
    maxHp: 2,
    modifiers: [
      createModifier({
        id: 'ephemeral_shroud',
        visible: false,
        stackable: false,
        mixins: [
          modifierOpeningGambitMixin({
            keywords: [],
            handler(session, attachedTo) {
              const [point] = attachedTo.card.summonFollowupTargets;
              if (!point) return;
              dispelAt(session, point);
            }
          })
        ]
      })
    ],
    summonedFollowup: {
      minTargetCount: 0,
      maxTargetCount: 1,
      isTargetable(session, point, summonedPoint) {
        return isWithinCells(summonedPoint, point, 1);
      }
    }
  }
];
