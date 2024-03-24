import type { MaybePromise } from '@game/shared';
import type { Entity, EntityEvent, EntityEventMap } from '../../entity/entity';
import type { GameSession } from '../../game-session';
import type { Keyword } from '../../utils/keywords';
import type { Modifier, ModifierMixin } from '../modifier';
import { modifierSelfEventMixin } from './self-event.mixin';

export const modifierDyingWishMixin = ({
  listener,
  keywords
}: {
  listener: (
    event: EntityEventMap['destroyed'],
    ctx: { session: GameSession; attachedTo: Entity; modifier: Modifier }
  ) => MaybePromise<void>;
  keywords: Keyword[];
}): ModifierMixin => {
  return modifierSelfEventMixin({
    eventName: 'destroyed',
    keywords,
    listener
  });
};
