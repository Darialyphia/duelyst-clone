import type { AnyCard } from '../../card';
import { defineBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTIONS, RARITIES, whileOnBoard } from '../../card-utils';

export default defineBlueprint({
  id: 'mana_forger',
  name: 'Mana Forger',
  description: 'Your spells cost 1 less to play.',
  kind: CARD_KINDS.MINION,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  spriteId: 'neutral_monsterartifacthunter',
  manaCost: 2,
  attack: 1,
  maxHp: 2,
  meta: { discount: 1 },
  onPlay(session, card, meta) {
    const interceptor = (val: number, card: Readonly<AnyCard>) => {
      if (card.kind !== CARD_KINDS.SPELL) return val;

      return Math.max(0, val - meta.discount);
    };

    whileOnBoard(
      card,
      () => {
        card.player.addInterceptor('manaCost', interceptor);
      },
      () => {
        card.player.removeInterceptor('manaCost', interceptor);
      }
    );
  }
});
