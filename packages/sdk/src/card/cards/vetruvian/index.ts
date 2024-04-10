import { config } from '../../../config';
import { createEntityModifier } from '../../../modifier/entity-modifier';
import { type CardBlueprint } from '../../card-lookup';
import {
  CARD_KINDS,
  FACTIONS,
  gateway,
  RARITIES,
  rush,
  structure,
  TRIBES
} from '../../card-utils';
import { modifierStatModifierMixin } from '../../../modifier/mixins/stat-modifier.mixin';
import { PLAYER_EVENTS } from '../../../player/player';

export const vetruvian: CardBlueprint[] = [
  {
    id: 'sajj',
    name: 'Scioness Sajj',
    spriteId: 'f3_altgeneral',
    kind: CARD_KINDS.GENERAL,
    faction: FACTIONS.VETRUVIAN,
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
    id: 'wind_dervish',
    name: 'Wind Dervish',
    description: 'Rush.\nAt the end of your turn, this disappears.',
    faction: FACTIONS.VETRUVIAN,
    rarity: RARITIES.TOKEN,
    spriteId: 'f3_dervish',
    kind: CARD_KINDS.MINION,
    tribe: TRIBES.DERVISH,
    manaCost: 1,
    attack: 2,
    maxHp: 2,
    onPlay(session, card) {
      session.fxSystem.playSfxOnEntity(card.entity.id, {
        resourceName: 'fx_firetornado',
        animationName: 'default'
      });
      rush(card);
      card.entity.player.once(PLAYER_EVENTS.TURN_END, () => {
        card.entity.destroy();
      });
    }
  },
  {
    id: 'ethereal_obelysk',
    name: 'Ethereal Obelysk',
    description: 'Gateway',
    faction: FACTIONS.VETRUVIAN,
    rarity: RARITIES.COMMON,
    spriteId: 'f3_obelyskredsand',
    kind: CARD_KINDS.MINION,
    tribe: TRIBES.STRUCTURE,
    manaCost: 2,
    attack: 0,
    maxHp: 6,
    onPlay(session, card) {
      gateway(card);
      structure(card);
    }
  },
  {
    id: 'scions_first_wish',
    name: "Scion's First Wish",
    spriteId: 'icon_f3_scionsfirstwish',
    kind: CARD_KINDS.SPELL,
    faction: FACTIONS.VETRUVIAN,
    rarity: RARITIES.COMMON,
    manaCost: 1,
    description: 'Give a friendly minion +1/+1. Draw a card.',
    isTargetable(session, point) {
      const entity = session.entitySystem.getEntityAt(point);
      if (!entity) return false;
      return !entity.isGeneral && entity.player.equals(session.playerSystem.activePlayer);
    },
    async onPlay(session, card) {
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
          description: '+1 / +1',
          stacks: 1,
          mixins: [
            modifierStatModifierMixin({
              attack: 1,
              maxHp: 1
            })
          ]
        })
      );
      removeLight();
      session.playerSystem.activePlayer.draw(1);
    }
  }
];
