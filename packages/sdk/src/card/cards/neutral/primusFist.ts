import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierInterceptorMixin } from '../../../modifier/mixins/interceptor.mixin';
import { defineBlueprint } from '../../card-lookup';
import { FACTIONS, RARITIES, CARD_KINDS, openingGambit } from '../../card-utils';

export default defineBlueprint({
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
  meta: { attackBuff: 1 },
  onPlay(session, card, meta) {
    openingGambit(card, (session, attachedTo) => {
      session.entitySystem.getNearbyAllyMinions(attachedTo).forEach(entity => {
        entity.addModifier(
          createEntityModifier({
            id: 'fist_of_the_primus',
            visible: true,
            name: 'Fist of the Primus',
            description: `+${meta.attackBuff} Attack.`,
            stackable: true,
            stacks: 1,
            mixins: [
              modifierInterceptorMixin({
                key: 'attack',
                duration: Infinity,
                keywords: [],
                interceptor: modifier => atk => {
                  return atk + meta.attackBuff * modifier.stacks!;
                }
              })
            ]
          })
        );
      });
    });
  }
});
