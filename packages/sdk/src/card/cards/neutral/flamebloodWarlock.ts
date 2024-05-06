import { defineBlueprint } from '../../card-blueprint';
import { FACTIONS, RARITIES, CARD_KINDS, openingGambit } from '../../card-utils';

export default defineBlueprint({
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
  meta: { damageAmount: 3 },
  onPlay(session, card, meta) {
    openingGambit(card, (session, attachedTo) => {
      session.playerSystem
        .getList()
        .forEach(player => player.general.takeDamage(meta.damageAmount, attachedTo.card));
    });
  }
});
