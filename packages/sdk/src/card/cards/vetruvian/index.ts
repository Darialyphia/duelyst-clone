import { config } from '../../../config';
import { modifierInterceptorMixin } from '../../../modifier/mixins/interceptor.mixin';
import { createEntityModifier } from '../../../modifier/entity-modifier';
import { type CardBlueprint } from '../../card-lookup';
import { CARD_KINDS, FACTIONS, RARITIES } from '../../card-utils';
import { modifierStatModifierMixin } from '../../../modifier/mixins/stat-modifier.mixin';

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
      await session.fxSystem.playSfxOnEntity(entity.id, {
        resourceName: 'fx_f3_scionsfirstwish',
        animationName: 'default',
        offset: { x: 0, y: -175 }
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
      session.playerSystem.activePlayer.draw(1);
    }
  }
];
