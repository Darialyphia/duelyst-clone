import type { GameSession } from '../game-session';
import { CARDS } from './card-lookup';
import { Interceptable, type inferInterceptor } from '../utils/helpers';
import type { AnyObject, Point3D, Serializable, Values } from '@game/shared';
import type { CardIndex, PlayerId } from '../player/player';
import EventEmitter from 'eventemitter3';
import type { ModifierId } from '../modifier/entity-modifier';
import type { CardModifier } from '../modifier/card-modifier';

export type CardBlueprintId = string;

export type SerializedCard = {
  blueprintId: CardBlueprintId;
};

export type CardInterceptor = Card<any>['interceptors'];
export type AnyCard = Card<any>;

export const CARD_EVENTS = {
  BEFORE_PLAYED: 'before_played',
  AFTER_PLAYED: 'after_played',
  DRAWN: 'drawn',
  REPLACED: 'replaced'
} as const;

export type CardEvent = Values<typeof CARD_EVENTS>;

export type CardEventMap = {
  [CARD_EVENTS.BEFORE_PLAYED]: [Card<any>];
  [CARD_EVENTS.AFTER_PLAYED]: [Card<any>];
  [CARD_EVENTS.DRAWN]: [Card<any>];
  [CARD_EVENTS.REPLACED]: [Card<any>];
};

export abstract class Card<TCtx extends AnyObject>
  extends EventEmitter
  implements Serializable
{
  readonly blueprintId: CardBlueprintId;
  modifiers: CardModifier<AnyCard>[] = [];

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

  setup() {
    this.blueprint.modifiers?.forEach(modifier => {
      this.addModifier(modifier);
    });
  }

  addInterceptor<T extends keyof CardInterceptor>(
    key: T,
    interceptor: inferInterceptor<CardInterceptor[T]>,
    priority?: number
  ) {
    this.interceptors[key].add(interceptor as any, priority);
    return () => this.removeInterceptor(key, interceptor);
  }

  removeInterceptor<T extends keyof CardInterceptor>(
    key: T,
    interceptor: inferInterceptor<CardInterceptor[T]>
  ) {
    this.interceptors[key].remove(interceptor as any);
  }

  getModifier(id: ModifierId) {
    return this.modifiers.find(m => m.id === id);
  }

  addModifier(modifier: CardModifier<AnyCard>) {
    this.modifiers.push(modifier);
    return modifier.onApplied(this.session, this, modifier);
  }

  removeModifier(modifierId: ModifierId) {
    this.modifiers.forEach(mod => {
      if (mod.id !== modifierId) return;

      mod.onRemoved(this.session, this, mod);
    });

    this.modifiers = this.modifiers.filter(mod => {
      return mod.id !== modifierId;
    });
  }

  get manaCost(): number {
    return this.interceptors.manaCost.getValue(
      this.player.interceptors.manaCost.getValue(this.blueprint.manaCost, this),
      this
    );
  }

  abstract canPlayAt(point: Point3D): boolean;
  abstract onPlay(ctx: TCtx): Promise<void>;

  draw() {
    this.emit(CARD_EVENTS.DRAWN, this);
  }

  replace() {
    this.emit(CARD_EVENTS.REPLACED, this);
  }

  async play(ctx: TCtx) {
    this.emit(CARD_EVENTS.BEFORE_PLAYED, this);
    await this.onPlay(ctx);
    this.emit(CARD_EVENTS.AFTER_PLAYED, this);
  }

  serialize(): SerializedCard {
    return { blueprintId: this.blueprintId };
  }
}
