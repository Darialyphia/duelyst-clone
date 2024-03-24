import type { MaybePromise } from '@game/shared';
import type { Entity } from '../../entity/entity';
import type { GameEvent, GameEventMap, GameSession } from '../../game-session';
import type { Keyword } from '../../utils/keywords';
import type { Modifier, ModifierMixin } from '../modifier';

export const modifierGameEventMixin = <T extends GameEvent>({
  eventName,
  listener,
  keywords
}: {
  eventName: T;
  listener: (
    event: GameEventMap[T],
    ctx: { session: GameSession; attachedTo: Entity; modifier: Modifier }
  ) => MaybePromise<void>;
  keywords: Keyword[];
}): ModifierMixin => {
  let _listener: any;

  return {
    keywords,
    onApplied(session, attachedTo, modifier) {
      _listener = (...args: any[]) => {
        return listener(args as any, { session, attachedTo, modifier });
      };
      session.on(eventName, _listener);
    },
    onRemoved(session) {
      session.off(eventName, _listener);
    }
  };
};
