import { defineBlueprint } from '../../card-lookup';
import { FACTIONS, RARITIES, CARD_KINDS, openingGambit } from '../../card-utils';

export default defineBlueprint({
  id: 'emerald_rejuvenator',
  name: 'Emerald Rejuvenator',
  description: 'Opening Gambit: heal your general for 4.',
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
  spriteId: 'neutral_rejuvenator',
  kind: CARD_KINDS.MINION,
  manaCost: 4,
  attack: 4,
  maxHp: 4,
  meta: { healAmount: 4 },
  onPlay(session, card, meta) {
    openingGambit(card, (session, attachedTo) => {
      attachedTo.player.general.heal(meta.healAmount, attachedTo.card);
    });
  }
});
