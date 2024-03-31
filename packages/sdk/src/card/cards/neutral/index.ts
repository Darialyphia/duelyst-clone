import {
  getCellBehind,
  getEntityInFront,
  getNearest,
  isEmpty,
  isEnemy
} from '../../../entity/entity-utils';
import { modifierInterceptorMixin } from '../../../modifier/mixins/interceptor.mixin';
import { createEntityModifier } from '../../../modifier/entity-modifier';
import { airdrop, dispelAt } from '../../../modifier/modifier-utils';
import { isWithinCells } from '../../../utils/targeting';
import { type CardBlueprint } from '../../card-lookup';
import {
  CARD_KINDS,
  dyingWish,
  FACTIONS,
  onGameEvent,
  onlyDuringOwnerTurn,
  openingGambit,
  ranged,
  RARITIES,
  rush,
  whileInHand,
  whileOnBoard
} from '../../card-utils';
import { createCardModifier } from '../../../modifier/card-modifier';
import { CARD_EVENTS, type AnyCard } from '../../card';
import { ENTITY_EVENTS } from '../../../entity/entity';
import { PLAYER_EVENTS } from '../../../player/player';
import { KEYWORDS } from '../../../utils/keywords';
import type { Unit } from '../../unit';
import { createCard } from '../../card-factory';

export const neutral: CardBlueprint[] = [
  {
    id: 'healing_mystic',
    name: 'Healing Mystic',
    faction: FACTIONS.NEUTRAL,
    rarity: RARITIES.COMMON,
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
    faction: FACTIONS.NEUTRAL,
    rarity: RARITIES.COMMON,
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
    faction: FACTIONS.NEUTRAL,
    rarity: RARITIES.RARE,
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
        if (!entity.hasKeyword(KEYWORDS.OPENING_GAMBIT)) return;
        if (attachedTo.isEnemy(entity.id)) return;

        attachedTo.addModifier(modifier);
      });
    }
  },
  {
    id: 'azure_horn_shaman',
    name: 'Azure Horn Shaman',
    description: 'Dying Wish: Give +4 Health to friendly minions around it.',
    faction: FACTIONS.NEUTRAL,
    rarity: RARITIES.COMMON,
    spriteId: 'neutral_mercazurehorn',
    kind: CARD_KINDS.MINION,
    manaCost: 2,
    attack: 1,
    maxHp: 4,
    onPlay(session, card) {
      dyingWish(card, () => {
        session.entitySystem.getNearbyAllyMinions(card.entity).forEach(entity => {
          entity.addInterceptor('maxHp', val => val + 4);
        });
      });
    }
  },
  {
    id: 'ephemeral_shroud',
    name: 'Ephemeral Shroud',
    description: 'Opening Gambit: Dispel 1 nearby space.',
    faction: FACTIONS.NEUTRAL,
    rarity: RARITIES.COMMON,
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
    faction: FACTIONS.NEUTRAL,
    rarity: RARITIES.COMMON,
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
    faction: FACTIONS.NEUTRAL,
    rarity: RARITIES.COMMON,
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
    faction: FACTIONS.NEUTRAL,
    rarity: RARITIES.COMMON,
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
    faction: FACTIONS.NEUTRAL,
    rarity: RARITIES.COMMON,
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
    kind: CARD_KINDS.MINION,
    faction: FACTIONS.NEUTRAL,
    rarity: RARITIES.COMMON,
    spriteId: 'neutral_ghostlynx',
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
    faction: FACTIONS.NEUTRAL,
    rarity: RARITIES.RARE,
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
              const { activate, deactivate } = onlyDuringOwnerTurn(attachedTo, () => {
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
              });

              whileInHand(attachedTo, activate, deactivate);
            }
          }
        ]
      })
    ]
  },
  {
    id: 'rift_walker',
    name: 'Rift Walker',
    description:
      'Airdrop\nOpening Gambit: Deal 2 damage to the nearest unit in front, behind, above, and below this.',
    kind: CARD_KINDS.MINION,
    faction: FACTIONS.NEUTRAL,
    rarity: RARITIES.RARE,
    spriteId: 'neutral_astralprime',
    manaCost: 3,
    attack: 2,
    maxHp: 1,
    onPlay(session, card) {
      openingGambit(card, () => {
        [
          getNearest(session, 'up', card.entity.position),
          getNearest(session, 'down', card.entity.position),
          getNearest(session, 'right', card.entity.position),
          getNearest(session, 'left', card.entity.position)
        ].forEach(entity => {
          if (!entity) return;
          entity.takeDamage(2, card);
        });
      });
    },
    modifiers: [airdrop()]
  },
  {
    id: 'aethermaster',
    name: 'Aethermaster',
    description: 'You can replace an additional card each turn',
    kind: CARD_KINDS.MINION,
    faction: FACTIONS.NEUTRAL,
    rarity: RARITIES.RARE,
    spriteId: 'neutral_aethermaster',
    manaCost: 2,
    attack: 1,
    maxHp: 3,
    onPlay(session, card) {
      const interceptor = (val: number) => val + 1;
      whileOnBoard(
        card,
        () => {
          card.player.addInterceptor('maxReplaces', interceptor);
        },
        () => {
          card.player.removeInterceptor('maxReplaces', interceptor);
        }
      );
    }
  },
  {
    id: 'dancing_blades',
    name: 'Dancing Blades',
    description: 'Opening Gambit: Deal 3 damage to ANY minion in front of this.',
    kind: CARD_KINDS.MINION,
    faction: FACTIONS.NEUTRAL,
    rarity: RARITIES.COMMON,
    spriteId: 'neutral_monsterdancingblades',
    manaCost: 5,
    attack: 4,
    maxHp: 6,
    onPlay(session, card) {
      openingGambit(card, () => {
        const target = getEntityInFront(session, card.entity);
        if (!target) return;
        target.takeDamage(3, card);
      });
    }
  },
  {
    id: 'archon_spellbinder',
    name: 'Archon Spellbinder',
    description: "Your opponent's spells cost 1 more to play",
    kind: CARD_KINDS.MINION,
    faction: FACTIONS.NEUTRAL,
    rarity: RARITIES.EPIC,
    spriteId: 'neutral_mercarchonspellbinder',
    manaCost: 6,
    attack: 6,
    maxHp: 9,
    onPlay(session, card) {
      const interceptor = (val: number, card: Readonly<AnyCard>) => {
        if (card.kind !== CARD_KINDS.SPELL) return val;

        return val + 1;
      };

      whileOnBoard(
        card,
        () => {
          card.player.opponent.addInterceptor('manaCost', interceptor);
        },
        () => {
          card.player.opponent.removeInterceptor('manaCost', interceptor);
        }
      );
    }
  },
  {
    id: 'dream_gazer',
    name: 'Dream Gazer',
    description:
      'When you replace this card, summon it on the space directly behind your general and deal 2 damage to your general',
    kind: CARD_KINDS.MINION,
    rarity: RARITIES.EPIC,
    faction: FACTIONS.NEUTRAL,
    spriteId: 'neutral_dreamgazer',
    manaCost: 2,
    attack: 2,
    maxHp: 2,
    onPlay() {
      return;
    },
    modifiers: [
      createCardModifier({
        mixins: [
          {
            onApplied(session, card) {
              const onReplaced = () => {
                const behind = getCellBehind(session, card.player.general);
                if (!behind) return;

                card.player.deck.pluck(card);
                card.play({
                  position: behind.position,
                  targets: []
                });
                card.player.general.takeDamage(2, card);
              };

              whileInHand(
                card,
                () => {
                  card.on(CARD_EVENTS.REPLACED, onReplaced);
                },
                () => {
                  card.off(CARD_EVENTS.REPLACED, onReplaced);
                }
              );
            }
          }
        ]
      })
    ]
  },
  {
    id: 'jaxi',
    name: 'Jaxi',
    description: 'Dying Widh: Symmon a Mini-Jax on this space',
    kind: CARD_KINDS.MINION,
    faction: FACTIONS.NEUTRAL,
    rarity: RARITIES.COMMON,
    spriteId: 'neutral_jaxi',
    manaCost: 2,
    attack: 3,
    maxHp: 1,
    onPlay(session, card) {
      dyingWish(
        card,
        () => {
          const miniJax = card.player.generateCard('mini_jax') as Unit;
          miniJax.play({ position: card.entity.position, targets: [] });
        },
        'after'
      );
    }
  },
  {
    id: 'mini_jax',
    name: 'Mini-Jax',
    description: 'Ranged',
    kind: CARD_KINDS.MINION,
    faction: FACTIONS.NEUTRAL,
    rarity: RARITIES.COMMON,
    spriteId: 'neutral_minijax',
    manaCost: 1,
    attack: 1,
    maxHp: 1,
    onPlay(session, card) {
      ranged(card);
    }
  }
];
