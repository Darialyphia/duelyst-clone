import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierInterceptorMixin } from '../../../modifier/mixins/interceptor.mixin';
import { KEYWORDS } from '../../../utils/keywords';
import { defineBlueprint } from '../../card-lookup';
import { FACTIONS, RARITIES, CARD_KINDS, onGameEvent } from '../../card-utils';

export default defineBlueprint({
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
  meta: {
    attackBuff: 2
  },
  onPlay(session, card, meta) {
    onGameEvent(card, 'entity:created', ([entity], { attachedTo }) => {
      if (!entity.hasKeyword(KEYWORDS.OPENING_GAMBIT)) return;
      if (attachedTo.isEnemy(entity.id)) return;

      attachedTo.addModifier(
        createEntityModifier({
          id: 'hunter',
          visible: true,
          name: 'Hunter',
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
  }
});
