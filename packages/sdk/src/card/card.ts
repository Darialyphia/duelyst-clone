import type { GameSession } from '../game-session';
import { CARDS } from './card-lookup';
import { Interceptable, type inferInterceptor } from '../utils/helpers';
import type { AnyObject, Serializable, Values } from '@game/shared';

import type { CardIndex, PlayerId } from '../player/player';
import EventEmitter from 'eventemitter3';

export type CardBlueprintId = string;

export type SerializedCard = {
  blueprintId: CardBlueprintId;
};

export type CardInterceptor = Card<any>['interceptors'];
export type AnyCard = Card<any>;

export const CARD_EVENTS = {
  PLAYED: 'played'
} as const;

export type CardEvent = Values<typeof CARD_EVENTS>;

export type CardEventMap = {
  [CARD_EVENTS.PLAYED]: [Card<any>];
};

export abstract class Card<TCtx extends AnyObject>
  extends EventEmitter
  implements Serializable
{
  readonly blueprintId: CardBlueprintId;

  constructor(
    protected session: GameSession,
    protected index: CardIndex,
    options: SerializedCard,
    protected playerId: PlayerId
  ) {
    super();
    this.blueprintId = options.blueprintId;
  }

  get player() {
    return this.session.playerSystem.getPlayerById(this.playerId)!;
  }

  get blueprint() {
    return CARDS[this.blueprintId];
  }

  get kind() {
    return this.blueprint.kind;
  }

  protected interceptors = {
    manaCost: new Interceptable<number, Card<TCtx>>()
  };

  addInterceptor<T extends keyof CardInterceptor>(
    key: T,
    interceptor: inferInterceptor<CardInterceptor[T]>,
    priority?: number
  ) {
    this.interceptors[key].add(interceptor as any, priority);
  }

  removeInterceptor<T extends keyof CardInterceptor>(
    key: T,
    interceptor: inferInterceptor<CardInterceptor[T]>
  ) {
    this.interceptors[key].remove(interceptor as any);
  }

  get manaCost(): number {
    return this.interceptors.manaCost.getValue(this.blueprint.manaCost, this);
  }

  abstract onPlay(ctx: TCtx): Promise<void>;

  async play(ctx: TCtx) {
    await this.onPlay(ctx);
    this.emit(CARD_EVENTS.PLAYED, this);
  }

  serialize(): SerializedCard {
    return { blueprintId: this.blueprintId };
  }
}
