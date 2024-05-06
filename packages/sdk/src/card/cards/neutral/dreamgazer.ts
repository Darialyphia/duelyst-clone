import { getCellBehind } from '../../../entity/entity-utils';
import { createCardModifier } from '../../../modifier/card-modifier';
import { CARD_EVENTS } from '../../card';
import { defineBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES, FACTIONS, whileInHand } from '../../card-utils';

export default defineBlueprint({
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
  meta: { selfDamageAmount: 2 },
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
              card.player.general.takeDamage(card.blueprint.meta.selfDamageAmount, card);
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
});
