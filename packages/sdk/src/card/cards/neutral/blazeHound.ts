import { ENTITY_EVENTS } from '../../../entity/entity';
import { createCardModifier } from '../../../modifier/card-modifier';
import { PLAYER_EVENTS } from '../../../player/player';
import { defineBlueprint } from '../../card-lookup';
import {
  FACTIONS,
  RARITIES,
  CARD_KINDS,
  onlyDuringOwnerTurn,
  whileInHand
} from '../../card-utils';

export default defineBlueprint({
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
  meta: {
    costDiscount: 1
  },
  onPlay() {
    return;
  },
  modifiers: [
    createCardModifier({
      mixins: [
        {
          onApplied(session, card) {
            const handler = () => {
              card.player.opponent.general.once(ENTITY_EVENTS.AFTER_TAKE_DAMAGE, () => {
                const remove = card.addInterceptor(
                  'manaCost',
                  (val: number) => val - card.blueprint.meta.costDiscount
                );
                card.player.once(PLAYER_EVENTS.TURN_END, remove);
              });
            };

            const { activate, deactivate } = onlyDuringOwnerTurn(card, handler);
            whileInHand(card, activate, deactivate);
          }
        }
      ]
    })
  ]
});
