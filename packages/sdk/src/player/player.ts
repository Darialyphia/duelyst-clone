import { GameSession } from '../game-session';
import {
  isDefined,
  padArray,
  type JSONObject,
  type Nullable,
  type Serializable,
  type Values
} from '@game/shared';
import { Deck } from '../card/deck';
import { type AnyCard, type SerializedCard } from '../card/card';
import EventEmitter from 'eventemitter3';
import { config } from '../config';
import { Interceptable, type inferInterceptor } from '../utils/helpers';
import { CARD_KINDS } from '../card/card-utils';
import { createCard } from '../card/card-factory';

export type PlayerId = string;
export type CardIndex = number;
export type SerializedPlayer = JSONObject & {
  id: PlayerId;
  name: string;
  maxMana?: number;
  currentMana?: number;
  isPlayer1: boolean;
  cards: SerializedCard[];
  deck?: CardIndex[];
  hand?: Nullable<CardIndex>[];
  graveyard: CardIndex[];
  hasMulliganed?: boolean;
};

export const PLAYER_EVENTS = {
  TURN_START: 'turn_start',
  TURN_END: 'turn_end'
} as const;

export type PlayerEvent = Values<typeof PLAYER_EVENTS>;
export type PlayerEventMap = {
  [PLAYER_EVENTS.TURN_START]: [Player];
  [PLAYER_EVENTS.TURN_END]: [Player];
};

export type PlayerInterceptor = Player['interceptors'];

export class Player extends EventEmitter<PlayerEventMap> implements Serializable {
  public readonly id: PlayerId;
  public readonly name: string;
  public readonly isPlayer1: boolean;
  public hasMulliganed: boolean;
  public _maxMana: number;
  public currentMana: number;
  private cardsReplacedThisTurn = 0;

  deck!: Deck;
  hand!: Nullable<AnyCard>[];
  graveyard!: AnyCard[];
  cards!: AnyCard[];

  readonly interceptors = {
    maxReplaces: new Interceptable<number, Player>(),
    maxMana: new Interceptable<number, Player>(),
    manaCost: new Interceptable<number, AnyCard>()
  };

  constructor(
    private session: GameSession,
    private options: SerializedPlayer
  ) {
    super();
    this.id = options.id;
    this.name = options.name;
    this.isPlayer1 = options.isPlayer1;
    this.hasMulliganed = options.hasMulliganed ?? false;
    this._maxMana =
      options.maxMana ?? this.isPlayer1
        ? config.PLAYER_1_STARTING_MANA
        : config.PLAYER_2_STARTING_MANA;
    this.currentMana = options.currentMana ?? this.maxMana;
  }

  get maxMana(): number {
    return this.interceptors.maxMana.getValue(this._maxMana, this);
  }

  set maxMana(val) {
    this._maxMana = val;
  }

  get maxReplaces(): number {
    return this.interceptors.maxReplaces.getValue(config.MAX_REPLACES_PER_TURN, this);
  }

  get entities() {
    return this.session.entitySystem
      .getList()
      .filter(entity => entity.player.equals(this));
  }

  get handSize() {
    return this.hand.filter(isDefined).length;
  }

  get isActive() {
    return this.session.playerSystem.activePlayer.equals(this);
  }

  get general() {
    return this.entities.find(entity => entity.isGeneral)!;
  }

  get opponent() {
    return this.session.playerSystem.getOpponent(this.id);
  }

  setup() {
    this.cards = this.options.cards.map((card, index) => {
      return createCard(this.session, card, index, this.id);
    });
    this.placeGeneral();

    this.deck = new Deck(
      this.session,
      this.options.deck
        ? this.options.deck.map(index => this.cards[index])
        : this.cards.filter(card => card.blueprint.kind !== CARD_KINDS.GENERAL),
      this.id
    );
    if (!this.options.deck) {
      this.deck.shuffle();
    }
    this.hand = padArray(
      this.options.hand
        ? this.options.hand.map(index => (index ? this.cards[index] : null))
        : this.drawInitialHand(),
      config.MAX_HAND_SIZE,
      null
    );
    this.graveyard = this.options.graveyard.map(index => this.cards[index]);
  }

  placeGeneral() {
    const generalIndex = this.cards.findIndex(
      card => card.blueprint.kind === CARD_KINDS.GENERAL
    );

    this.session.entitySystem.addEntity({
      cardIndex: generalIndex,
      playerId: this.id,
      position: this.isPlayer1
        ? this.session.boardSystem.player1StartPosition
        : this.session.boardSystem.player2StartPosition
    });
  }

  private drawInitialHand() {
    return this.deck.draw(config.STARTING_HAND);
  }

  serialize(): SerializedPlayer {
    return {
      id: this.id,
      name: this.name,
      cards: this.cards.map(card => card.serialize()),
      deck: this.deck.cards.map(card => this.cards.indexOf(card)),
      hand: this.hand.map(card => (card ? this.cards.indexOf(card) : null)),
      graveyard: this.graveyard.map(card => this.cards.indexOf(card)),
      isPlayer1: this.isPlayer1,
      maxMana: this.maxMana,
      currentMana: this.currentMana
    };
  }

  canReplace() {
    return this.cardsReplacedThisTurn < this.maxReplaces;
  }

  replaceCard(index: number) {
    if (!this.canReplace()) return;
    const card = this.hand[index];
    if (!card) return;

    const replacement = this.deck.replace(card);
    this.hand[index] = replacement;
    this.cardsReplacedThisTurn++;
  }

  equals(player: Player) {
    return player.id === this.id;
  }

  draw(amount: number) {
    const availableSlots = config.MAX_HAND_SIZE - this.handSize;

    const newCards = this.deck.draw(Math.min(amount, availableSlots));

    this.hand.forEach((slot, index) => {
      if (!isDefined(slot) && newCards.length) {
        this.hand[index] = newCards.shift();
      }
    });
  }

  endTun() {
    this.draw(config.CARD_DRAW_PER_TURN);
    this.entities.forEach(entity => {
      entity.endTurn();
    });
    this.emit(PLAYER_EVENTS.TURN_END, this);
  }

  startTurn() {
    this.cardsReplacedThisTurn = 0;
    this.maxMana = Math.min(this.maxMana + 1, config.MAX_MANA);
    this.currentMana = this.maxMana;
    this.emit(PLAYER_EVENTS.TURN_START, this);
  }

  canPlayCardAtIndex(index: number) {
    const card = this.hand[index];
    if (!card) {
      console.error(`No card in hand at index ${index}`);
      return;
    }
    return this.currentMana >= card.manaCost;
  }

  getCardFromHand(index: CardIndex) {
    const card = this.hand[index];
    if (!card) {
      console.error(`No card in hand at index ${index}`);
      return;
    }

    return card;
  }

  addInterceptor<T extends keyof PlayerInterceptor>(
    key: T,
    interceptor: inferInterceptor<PlayerInterceptor[T]>,
    priority?: number
  ) {
    this.interceptors[key].add(interceptor as any, priority);

    return () => this.removeInterceptor(key, interceptor);
  }

  removeInterceptor<T extends keyof PlayerInterceptor>(
    key: T,
    interceptor: inferInterceptor<PlayerInterceptor[T]>
  ) {
    this.interceptors[key].remove(interceptor as any);
  }

  giveMana(amount: number) {
    this.currentMana = Math.min(this.currentMana + amount, config.MAX_MANA);
  }
}
