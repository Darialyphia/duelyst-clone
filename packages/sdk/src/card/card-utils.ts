import type { AnyFunction, MaybePromise, Values } from '@game/shared';
import type { Unit } from './unit';
import type { Entity } from '../entity/entity';
import { createEntityModifier, type EntityModifier } from '../modifier/entity-modifier';
import { modifierOpeningGambitMixin } from '../modifier/mixins/opening-gambit.mixin';
import { modifierDyingWishMixin } from '../modifier/mixins/dying-wish.mixin';
import { modifierRushMixin } from '../modifier/mixins/rush.mixin';
import { modifierGameEventMixin } from '../modifier/mixins/game-event.mixin';
import { KEYWORDS } from '../utils/keywords';
import type { GameEvent, GameEventMap, GameSession } from '../game-session';
import { CARD_EVENTS, type AnyCard } from './card';
import type { PlayerInterceptor } from '../player/player';

export const CARD_KINDS = {
  MINION: 'MINION',
  GENERAL: 'GENERAL',
  SPELL: 'SPELL',
  ARTIFACT: 'ARTIFACT'
} as const;

export type CardKind = Values<typeof CARD_KINDS>;

export const openingGambit = (
  card: Unit & { entity: Entity },
  handler: Parameters<typeof modifierOpeningGambitMixin>[0]['handler']
) => {
  card.entity.addModifier(
    createEntityModifier({
      visible: false,
      stackable: false,
      mixins: [
        modifierOpeningGambitMixin({
          keywords: [],
          handler
        })
      ]
    })
  );
};

export const dyingWish = (
  card: Unit & { entity: Entity },
  handler: Parameters<typeof modifierDyingWishMixin>[0]['listener']
) => {
  card.entity.addModifier(
    createEntityModifier({
      visible: false,
      stackable: false,
      mixins: [
        modifierDyingWishMixin({
          keywords: [],
          listener: handler
        })
      ]
    })
  );
};

export const rush = (card: Unit & { entity: Entity }) => {
  card.entity.addModifier(
    createEntityModifier({
      visible: true,
      name: KEYWORDS.RUSH.name,
      description: KEYWORDS.RUSH.description,
      stackable: false,
      mixins: [modifierRushMixin()]
    })
  );
};

export const onGameEvent = <T extends GameEvent>(
  card: Unit & { entity: Entity },
  eventName: T,
  listener: (
    event: GameEventMap[T],
    ctx: { session: GameSession; attachedTo: Entity; modifier: EntityModifier }
  ) => MaybePromise<void>
) => {
  card.entity.addModifier(
    createEntityModifier({
      visible: false,
      stackable: false,
      mixins: [
        modifierGameEventMixin({
          eventName,
          keywords: [],
          listener
        })
      ]
    })
  );
};

export const whileInHand = (card: AnyCard, cb: AnyFunction, cleanup: AnyFunction) => {
  card.on(CARD_EVENTS.DRAWN, cb);
  const unsub = () => {
    cleanup();
    card.off(CARD_EVENTS.PLAYED, unsub);
    card.off(CARD_EVENTS.REPLACED, unsub);
  };
  card.on(CARD_EVENTS.PLAYED, unsub);
  card.on(CARD_EVENTS.REPLACED, unsub);
};
