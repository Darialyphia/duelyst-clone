import type { Entity } from '../../entity/entity';
import type { Keyword } from '../../utils/keywords';
import type { Modifier, ModifierMixin } from '../modifier';

export const modifierDurationMixin = ({
  duration,
  tickOn,
  onApplied,
  onRemoved,
  keywords
}: {
  duration: number;
  tickOn: 'turn-start' | 'turn-end';
  onApplied: Modifier['onApplied'];
  onRemoved: Modifier['onRemoved'];
  keywords: Keyword[];
}): ModifierMixin => {
  let _duration = duration;

  return {
    keywords,
    onApplied(session, attachedTo) {
      const listener = () => {
        _duration--;
        if (_duration === 0) {
          attachedTo.off('turn-ended', listener);
          attachedTo.removeModifier('swiftness');
        }
      };
      attachedTo.on('turn-ended', listener);
      return onApplied(session, attachedTo);
    },
    onRemoved(session, attachedTo) {
      return onRemoved(session, attachedTo);
    },
    onReapply() {
      _duration = duration;
    }
  };
};
