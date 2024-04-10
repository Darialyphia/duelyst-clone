import type { Unit } from '../../card/unit';
import { PLAYER_EVENTS } from '../../player/player';
import { KEYWORDS } from '../../utils/keywords';
import type { EntityModifierMixin } from '../entity-modifier';
import { modifierGameEventMixin } from './game-event.mixin';

export const modifierGatewayMixin = (): EntityModifierMixin => {
  return modifierGameEventMixin({
    eventName: 'player:turn_start',
    keywords: [KEYWORDS.GATEWAY],
    listener([player], { session, attachedTo }) {
      if (!player.equals(attachedTo.player)) return;
      const emptyNeighbors = session.boardSystem
        .getNeighbors(attachedTo.position)
        .filter(cell => !cell.entity);

      if (!emptyNeighbors.length) return;

      const index = session.rngSystem.nextInt(emptyNeighbors.length - 1);
      const dervish = attachedTo.player.generateCard('wind_dervish') as Unit;

      dervish.play({
        position: emptyNeighbors[index].position,
        targets: []
      });
    }
  });
};
