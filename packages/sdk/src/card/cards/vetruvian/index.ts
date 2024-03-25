import { config } from '../../../config';
import { isAlly } from '../../../entity/entity-utils';
import { modifierInterceptorMixin } from '../../../modifier/mixins/interceptor.mixin';
import { createModifier } from '../../../modifier/modifier';
import { type CardBlueprint } from '../../card-lookup';
import { CARD_KINDS } from '../../card-utils';

export const vetruvian: CardBlueprint[] = [
  {
    id: 'sajj',
    name: 'Scioness Sajj',
    spriteId: 'f3_altgeneral',
    kind: CARD_KINDS.GENERAL,
    manaCost: 0,
    modifiers: [],
    description: '',
    attack: config.GENERAL_DEFAULT_ATTACK,
    maxHp: config.GENERAL_DEFAULT_HP
  },
  {
    id: 'scions_first_wish',
    name: "Scion's First Wish",
    spriteId: 'icon_f3_scionsfirstwish',
    kind: CARD_KINDS.SPELL,
    manaCost: 1,
    description: 'Give a friendly minion +1/+1. Draw a card.',
    isTargetable(session, point) {
      const entity = session.entitySystem.getEntityAt(point);
      if (!entity) return false;
      return !entity.isGeneral && entity.player.equals(session.playerSystem.activePlayer);
    },
    async onPlay(session, castPoint) {
      const entity = session.entitySystem.getEntityAt(castPoint);
      if (!entity) return;
      entity.addModifier(
        createModifier({
          id: 'scions_first_wish',
          stackable: true,
          visible: true,
          name: "Scions's First wish",
          description: '+1 / +1',
          stacks: 1,
          mixins: [
            modifierInterceptorMixin({
              key: 'attack',
              duration: Infinity,
              keywords: [],
              interceptor: modifier => atk => {
                return atk + 2 * modifier.stacks!;
              }
            }),
            modifierInterceptorMixin({
              key: 'maxHp',
              duration: Infinity,
              keywords: [],
              interceptor: modifier => hp => {
                return hp + 1 * modifier.stacks!;
              }
            })
          ]
        })
      );
      session.playerSystem.activePlayer.draw(1);
    }
  }
];
