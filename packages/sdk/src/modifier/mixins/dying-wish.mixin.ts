import type { MaybePromise } from '@game/shared';
import { ENTITY_EVENTS, type Entity, type EntityEventMap } from '../../entity/entity';
import type { GameSession } from '../../game-session';
import { KEYWORDS, type Keyword } from '../../utils/keywords';
import type { EntityModifier, EntityModifierMixin } from '../entity-modifier';
import { modifierSelfEventMixin } from './self-event.mixin';

export const modifierDyingWishMixin = ({
  listener,
  phase = 'before',
  keywords = []
}: {
  listener: (
    event: EntityEventMap['before_destroy'],
    ctx: { session: GameSession; attachedTo: Entity; modifier: EntityModifier }
  ) => MaybePromise<void>;
  phase?: 'after' | 'before';
  keywords?: Keyword[];
}): EntityModifierMixin => {
  return modifierSelfEventMixin({
    eventName:
      phase === 'before' ? ENTITY_EVENTS.BEFORE_DESTROY : ENTITY_EVENTS.AFTER_DESTROY,
    keywords: [...keywords, KEYWORDS.DYING_WISH],
    listener
  });
};
