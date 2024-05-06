import { defineBlueprint } from '../../card-lookup';
import { CARD_KINDS, FACTIONS, RARITIES, dyingWish, ranged } from '../../card-utils';
import type { Unit } from '../../unit';

export default defineBlueprint({
  id: 'jaxi',
  name: 'Jaxi',
  description: 'Dying Wish: Symmon a Mini-Jax on this space',
  kind: CARD_KINDS.MINION,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
  spriteId: 'neutral_jaxi',
  manaCost: 2,
  attack: 3,
  maxHp: 1,
  meta: {},
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
});

export const miniJax = defineBlueprint({
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
  meta: {},
  onPlay(session, card) {
    ranged(card);
  }
});
