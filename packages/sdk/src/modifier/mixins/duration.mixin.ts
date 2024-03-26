import type { Entity } from '../../entity/entity';
import { PLAYER_EVENTS } from '../../player/player';
import type { Keyword } from '../../utils/keywords';
import type { Modifier, ModifierMixin } from '../modifier';

export const modifierDurationMixin = ({
  duration,
  tickOn = 'end',
  onApplied,
  onRemoved,
  keywords = []
}: {
  duration: number;
  tickOn?: 'start' | 'end';
  onApplied: Modifier['onApplied'];
  onRemoved: Modifier['onRemoved'];
  keywords?: Keyword[];
}): ModifierMixin => {
  let _duration = duration;

  return {
    keywords,
    onApplied(session, attachedTo, modifier) {
      const eventName =
        tickOn === 'end' ? PLAYER_EVENTS.TURN_END : PLAYER_EVENTS.TURN_START;
      const listener = () => {
        _duration--;
        if (_duration === 0) {
          attachedTo.player.off(eventName, listener);
          attachedTo.removeModifier(modifier.id);
        }
      };
      attachedTo.player.on(eventName, listener);
      return onApplied(session, attachedTo, modifier);
    },
    onRemoved(session, attachedTo, modifier) {
      return onRemoved(session, attachedTo, modifier);
    },
    onReapply() {
      _duration = duration;
    }
  };
};
