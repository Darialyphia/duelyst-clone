import { PLAYER_EVENTS } from '../../../player/player';
import { defineBlueprint } from '../../card-blueprint';
import { FACTIONS, RARITIES, CARD_KINDS, TRIBES, rush } from '../../card-utils';

export default defineBlueprint({
  id: 'wind_dervish',
  name: 'Wind Dervish',
  description: 'Rush.\nAt the end of your turn, this disappears.',
  faction: FACTIONS.VETRUVIAN,
  rarity: RARITIES.TOKEN,
  spriteId: 'f3_dervish',
  kind: CARD_KINDS.MINION,
  tribe: TRIBES.DERVISH,
  manaCost: 1,
  attack: 2,
  maxHp: 2,
  meta: {},
  onPlay(session, card) {
    session.fxSystem.playSfxOnEntity(card.entity.id, {
      resourceName: 'fx_firetornado',
      animationName: 'default'
    });
    rush(card);
    card.entity.player.once(PLAYER_EVENTS.TURN_END, () => {
      card.entity.destroy();
    });
  }
});
