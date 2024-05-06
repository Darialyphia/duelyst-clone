import type { AnyCard } from '../../card';
import { defineBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTIONS, RARITIES, whileOnBoard } from '../../card-utils';

export default defineBlueprint({
  id: 'archon_spellbinder',
  name: 'Archon Spellbinder',
  description: "Your opponent's spells cost 1 more to play",
  kind: CARD_KINDS.MINION,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.EPIC,
  spriteId: 'neutral_mercarchonspellbinder',
  manaCost: 6,
  attack: 6,
  maxHp: 9,
  meta: { debuffAmount: 1 },
  onPlay(session, card, meta) {
    const interceptor = (val: number, card: Readonly<AnyCard>) => {
      if (card.kind !== CARD_KINDS.SPELL) return val;

      return val + meta.debuffAmount;
    };

    whileOnBoard(
      card,
      () => {
        card.player.opponent.addInterceptor('manaCost', interceptor);
      },
      () => {
        card.player.opponent.removeInterceptor('manaCost', interceptor);
      }
    );
  }
});
