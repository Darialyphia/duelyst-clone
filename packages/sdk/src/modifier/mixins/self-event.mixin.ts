import type { MaybePromise } from '@game/shared';
import type { Entity, EntityEvent, EntityEventMap } from '../../entity/entity';
import type { GameSession } from '../../game-session';
import type { Keyword } from '../../utils/keywords';
import type { Modifier, ModifierMixin } from '../modifier';

export const modifierSelfEventMixin = <T extends EntityEvent>({
  eventName,
  listener,
  keywords = []
}: {
  eventName: T;
  listener: (
    event: EntityEventMap[T],
    ctx: { session: GameSession; attachedTo: Entity; modifier: Modifier }
  ) => MaybePromise<void>;
  keywords?: Keyword[];
}): ModifierMixin => {
  let _listener: any;

  return {
    keywords,
    onApplied(session, attachedTo, modifier) {
      _listener = (...args: any[]) => {
        return listener(args as any, { session, attachedTo, modifier });
      };
      attachedTo.on(eventName, _listener);
    },
    onRemoved(session, attachedTo) {
      attachedTo.off(eventName, _listener);
    }
  };
};
