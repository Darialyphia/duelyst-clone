import { defineBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTIONS, RARITIES, whileOnBoard } from '../../card-utils';

export default defineBlueprint({
  id: 'aethermaster',
  name: 'Aethermaster',
  description: 'You can replace an additional card each turn',
  kind: CARD_KINDS.MINION,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  spriteId: 'neutral_aethermaster',
  manaCost: 2,
  attack: 1,
  maxHp: 3,
  meta: { buffAmount: 1 },
  onPlay(session, card, meta) {
    const interceptor = (val: number) => val + meta.buffAmount;
    whileOnBoard(
      card,
      () => {
        card.player.addInterceptor('maxReplaces', interceptor);
      },
      () => {
        card.player.removeInterceptor('maxReplaces', interceptor);
      }
    );
  }
});
