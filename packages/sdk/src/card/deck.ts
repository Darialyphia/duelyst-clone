import EventEmitter from 'eventemitter3';
import type { GameSession } from '../game-session';
import { Card, type AnyCard, type SerializedCard } from './card';
import { type Serializable, type Values } from '@game/shared';
import type { PlayerId } from '../player/player';

export type SerializedDeck = {
  cards: SerializedCard[];
  ownerId: PlayerId;
};

export const DECK_EVENTS = {
  BEFORE_DRAW: 'before_draw',
  AFTER_DRAW: 'after_draw',

  BEFORE_REPLACE: 'before_replace',
  AFTER_REPLACE: 'after_replace'
} as const;

export type DeckEvent = Values<typeof DECK_EVENTS>;

export type DeckEventMap = {
  [DECK_EVENTS.BEFORE_DRAW]: [Deck];
  [DECK_EVENTS.AFTER_DRAW]: [{ deck: Deck; cards: AnyCard[] }];

  [DECK_EVENTS.BEFORE_REPLACE]: [{ deck: Deck; replacedCard: AnyCard }];
  [DECK_EVENTS.AFTER_REPLACE]: [
    { deck: Deck; replacedCard: AnyCard; replacement: AnyCard }
  ];
};

export class Deck extends EventEmitter<DeckEventMap> implements Serializable {
  constructor(
    private session: GameSession,
    public cards: AnyCard[],
    private ownerId: PlayerId
  ) {
    super();
  }

  get owner() {
    return this.session.playerSystem.getPlayerById(this.ownerId);
  }

  shuffle() {
    this.cards = this.cards.sort(() => this.session.rngSystem.next() - 0.5);
  }

  draw(amount: number) {
    this.emit(DECK_EVENTS.BEFORE_DRAW, this);
    const cards = this.cards.splice(0, amount);
    this.emit(DECK_EVENTS.AFTER_DRAW, { deck: this, cards: cards });

    return cards;
  }

  peek(amount: number) {
    return this.cards.slice(0, amount);
  }

  replace(replacedCard: AnyCard) {
    this.emit(DECK_EVENTS.BEFORE_REPLACE, { deck: this, replacedCard });

    let replacement: AnyCard;
    let index: number;

    do {
      index = this.session.rngSystem.nextInt(this.cards.length - 1);
      replacement = this.cards[index];
    } while (replacement.blueprintId === replacedCard.blueprintId);

    this.cards[index] = replacedCard;

    this.emit(DECK_EVENTS.AFTER_REPLACE, { deck: this, replacedCard, replacement });
    return replacement;
  }

  serialize(): SerializedDeck {
    return {
      cards: this.cards.map(card => card.serialize()),
      ownerId: this.ownerId
    };
  }
}
