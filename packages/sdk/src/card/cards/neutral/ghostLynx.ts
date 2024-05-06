import { defineBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTIONS, RARITIES, openingGambit } from '../../card-utils';

export default defineBlueprint({
  id: 'ghost_lynx',
  name: 'Ghost Lynx',
  description: 'Opening Gambit: Drawa card at the end of your turn.',
  kind: CARD_KINDS.MINION,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
  spriteId: 'neutral_ghostlynx',
  manaCost: 2,
  attack: 1,
  maxHp: 3,
  meta: { drawAmount: 1 },
  onPlay(session, card, meta) {
    openingGambit(card, (session, attachedTo) => {
      session.once('player:turn_end', () => {
        attachedTo.player.draw(meta.drawAmount);
      });
    });
  }
});
