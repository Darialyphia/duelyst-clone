import { isEmpty, isEnemy } from '../../../entity/entity-utils';
import { modifierInterceptorMixin } from '../../../modifier/mixins/interceptor.mixin';
import { createEntityModifier } from '../../../modifier/entity-modifier';
import { dispelAt } from '../../../modifier/modifier-utils';
import { isWithinCells } from '../../../utils/targeting';
import { type CardBlueprint } from '../../card-lookup';
import {
  CARD_KINDS,
  dyingWish,
  onGameEvent,
  openingGambit,
  rush,
  whileInHand
} from '../../card-utils';
import { createCardModifier } from '../../../modifier/card-modifier';
import { CARD_EVENTS } from '../../card';
import { ENTITY_EVENTS } from '../../../entity/entity';
import { PLAYER_EVENTS } from '../../../player/player';

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
    onPlay(session, card) {
      openingGambit(card, (session, attachedTo) => {
        const [point] = attachedTo.card.followupTargets;
        if (!point) return;
        const entity = session.entitySystem.getEntityAt(point);
        if (entity) {
          entity.heal(2, attachedTo.card);
        }
      });
    },
    followup: {
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
    onPlay(session, card) {
      openingGambit(card, (session, attachedTo) => {
        const [point] = attachedTo.card.followupTargets;
        if (!point) return;

        const entity = session.entitySystem.getEntityAt(point);
        if (entity) {
          entity.takeDamage(1, attachedTo.card);
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
    onPlay(session, card) {
      const modifier = createEntityModifier({
        id: 'araki_headhunter_buff',
        visible: true,
        name: 'Hunter',
        description: '+2 Attack.',
        stackable: true,
        stacks: 1,
        mixins: [
          modifierInterceptorMixin({
            key: 'attack',
            duration: Infinity,
            keywords: [],
            interceptor: modifier => atk => {
              return atk + 2 * modifier.stacks!;
            }
          })
        ]
      });

      onGameEvent(card, 'entity:created', ([entity], { attachedTo }) => {
        if (!entity.hasKeyword('Opening Gambit')) return;
        if (attachedTo.isEnemy(entity.id)) return;

        attachedTo.addModifier(modifier);
      });
    }
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
    onPlay(session, card) {
      dyingWish(card, (event, { session, attachedTo }) => {
        session.entitySystem.getNearbyAllyMinions(attachedTo).forEach(entity => {
          entity.addInterceptor('maxHp', val => val + 4);
        });
      });
    }
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
    onPlay(session, card) {
      openingGambit(card, (session, attachedTo) => {
        const [point] = attachedTo.card.followupTargets;
        if (!point) return;
        dispelAt(session, point);
      });
    },
    followup: {
      minTargetCount: 0,
      maxTargetCount: 1,
      isTargetable(session, point, summonedPoint) {
        return isWithinCells(summonedPoint, point, 1);
      }
    }
  },
  {
    id: 'primus_fist',
    name: 'Primus fist',
    description: 'Opening Gambit: Give nearby allied minions +1 / +0',
    spriteId: 'neutral_gauntletmaster',
    kind: CARD_KINDS.MINION,
    manaCost: 2,
    attack: 2,
    maxHp: 3,
    onPlay(session, card) {
      openingGambit(card, (session, attachedTo) => {
        session.entitySystem.getNearbyAllyMinions(attachedTo).forEach(entity => {
          entity.addInterceptor('attack', atk => atk + 1);
        });
      });
    }
  },
  {
    id: 'saberspine_tiger',
    name: 'Saberspine Tiger',
    description: 'Rush',
    spriteId: 'neutral_beastsaberspinetiger',
    kind: CARD_KINDS.MINION,
    manaCost: 3,
    attack: 3,
    maxHp: 2,
    onPlay(session, card) {
      rush(card);
    },
    modifiers: []
  },
  {
    id: 'emerald_rejuvenator',
    name: 'Emerald Rejuvenator',
    description: 'Opening Gambit: heal your general for 4.',
    spriteId: 'neutral_rejuvenator',
    kind: CARD_KINDS.MINION,
    manaCost: 4,
    attack: 4,
    maxHp: 4,
    onPlay(session, card) {
      openingGambit(card, (session, attachedTo) => {
        attachedTo.player.general.heal(4, attachedTo.card);
      });
    }
  },
  {
    id: 'flameblood_warlock',
    name: 'Flameblood Warlock',
    description: 'Opening Gambit: Deal 3 damage to both generals.',
    spriteId: 'neutral_mercflamebloodwarlock',
    kind: CARD_KINDS.MINION,
    manaCost: 2,
    attack: 3,
    maxHp: 1,
    onPlay(session, card) {
      openingGambit(card, (session, attachedTo) => {
        session.playerSystem
          .getList()
          .forEach(player => player.general.takeDamage(3, attachedTo.card));
      });
    }
  },
  {
    id: 'ghost_lynx',
    name: 'Ghost Lynx',
    description: 'Opening Gambit: Drawa card at the end of your turn.',
    spriteId: 'neutral_ghostlynx',
    kind: CARD_KINDS.MINION,
    manaCost: 2,
    attack: 1,
    maxHp: 3,
    onPlay(session, card) {
      openingGambit(card, (session, attachedTo) => {
        session.once('player:turn_end', () => {
          attachedTo.player.draw(1);
        });
      });
    }
  },
  {
    id: 'blaze_hound',
    name: 'Blaze Hound',
    description:
      'This card costs 1 less to play if the enemy general took damage this turn.',
    kind: CARD_KINDS.MINION,
    spriteId: 'neutral_beastdarkharbinger',
    manaCost: 3,
    attack: 4,
    maxHp: 3,
    onPlay() {
      return;
    },
    modifiers: [
      createCardModifier({
        mixins: [
          {
            onApplied(session, attachedTo) {
              const listener = () => {
                attachedTo.player.opponent.general.once(
                  ENTITY_EVENTS.AFTER_TAKE_DAMAGE,
                  () => {
                    const remove = attachedTo.addInterceptor(
                      'manaCost',
                      (val: number) => val - 1
                    );
                    attachedTo.player.once(PLAYER_EVENTS.TURN_END, remove);
                  }
                );
              };
              whileInHand(
                attachedTo,
                () => {
                  attachedTo.player.on(PLAYER_EVENTS.TURN_START, listener);
                },
                () => {
                  attachedTo.player.off(PLAYER_EVENTS.TURN_START, listener);
                }
              );
            }
          }
        ]
      })
    ]
  }
];
