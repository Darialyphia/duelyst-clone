import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierInterceptorMixin } from '../../../modifier/mixins/interceptor.mixin';
import { defineBlueprint } from '../../card-lookup';
import { FACTIONS, RARITIES, CARD_KINDS, dyingWish } from '../../card-utils';

export default defineBlueprint({
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
  meta: {
    hpBuff: 4
  },
  onPlay(session, card, meta) {
    dyingWish(card, () => {
      session.entitySystem.getNearbyAllyMinions(card.entity).forEach(entity => {
        entity.addModifier(
          createEntityModifier({
            id: 'shamahs_sacrifice',
            visible: true,
            name: "Shaman's sacrifice",
            description: `+${meta.hpBuff} Attack.`,
            stackable: true,
            stacks: 1,
            mixins: [
              modifierInterceptorMixin({
                key: 'maxHp',
                duration: Infinity,
                keywords: [],
                interceptor: modifier => hp => {
                  return hp + meta.hpBuff * modifier.stacks!;
                }
              })
            ]
          })
        );
      });
    });
  }
});
