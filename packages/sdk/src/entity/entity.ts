import { type Serializable, Vec3, type Values, clamp, type Nullable } from '@game/shared';
import type { GameSession } from '../game-session';
import type { Point3D } from '../types';
import EventEmitter from 'eventemitter3';
import type { CardIndex, PlayerId } from '../player/player';
import { Interceptable, ReactiveValue, type inferInterceptor } from '../utils/helpers';
import { isAlly, isEnemy } from './entity-utils';
import { isWithinCells } from '../utils/targeting';
import type { Modifier, ModifierId } from '../modifier/modifier';
import { Unit } from '../card/unit';
import { CARD_KINDS } from '../card/card-utils';
import { config } from '../config';
import type { AnyCard } from '../card/card';

export type EntityId = number;

export type SerializedEntity = {
  id: number;
  position: Point3D;
  cardIndex: CardIndex;
  playerId: PlayerId;
  hp?: number;
  movementsTaken?: number;
  attacksTaken?: number;
};

export const ENTITY_EVENTS = {
  DESTROYED: 'destroyed',
  CREATED: 'created',

  BEFORE_MOVE: 'before-move',
  AFTER_MOVE: 'after-move',

  BEFORE_DEAL_DAMAGE: 'before_deal_damage',
  AFTER_DEAL_DAMAGE: 'after_deal_damage',

  BEFORE_TAKE_DAMAGE: 'before_take_damage',
  AFTER_TAKE_DAMAGE: 'after_take_damage',

  BEFORE_HEAL: 'before_heal',
  AFTER_HEAL: 'after_heal',

  BEFORE_ATTACK: 'before_attack',
  AFTER_ATTACK: 'after_attack'
} as const;

export type EntityEvent = Values<typeof ENTITY_EVENTS>;

type DealDamageEvent = {
  entity: Entity;
  target: Entity;
  amount: number;
};
type TakeDamageEvent = {
  entity: Entity;
  source: AnyCard;
  amount: number;
};
type AttackEvent = {
  entity: Entity;
  target: Entity;
};

export type EntityEventMap = {
  [ENTITY_EVENTS.CREATED]: [entity: Entity];
  [ENTITY_EVENTS.DESTROYED]: [entity: Entity];

  [ENTITY_EVENTS.BEFORE_MOVE]: [entity: Entity];
  [ENTITY_EVENTS.AFTER_MOVE]: [entity: Entity];

  [ENTITY_EVENTS.BEFORE_DEAL_DAMAGE]: [event: DealDamageEvent];
  [ENTITY_EVENTS.AFTER_DEAL_DAMAGE]: [event: DealDamageEvent];

  [ENTITY_EVENTS.BEFORE_TAKE_DAMAGE]: [event: TakeDamageEvent];
  [ENTITY_EVENTS.AFTER_TAKE_DAMAGE]: [event: TakeDamageEvent];

  [ENTITY_EVENTS.BEFORE_HEAL]: [event: TakeDamageEvent];
  [ENTITY_EVENTS.AFTER_HEAL]: [event: TakeDamageEvent];

  [ENTITY_EVENTS.BEFORE_ATTACK]: [event: AttackEvent];
  [ENTITY_EVENTS.AFTER_ATTACK]: [event: AttackEvent];
};

export type EntityInterceptor = Entity['interceptors'];

export class Entity extends EventEmitter<EntityEventMap> implements Serializable {
  private cardIndex: CardIndex;

  private playerId: PlayerId;

  readonly id: EntityId;

  modifiers: Modifier[] = [];

  position: Vec3;

  private movementsTaken: number;
  private attacksTaken: number;

  private currentHp = new ReactiveValue(0, hp => {
    if (hp <= 0) {
      this.session.actionSystem.schedule(async () => {
        await this.session.fxSystem.playAnimation(this.id, 'death');
        this.destroy();
      });
    }
  });

  private interceptors = {
    attack: new Interceptable<number, Entity>(),
    maxHp: new Interceptable<number, Entity>(),
    reach: new Interceptable<number, Entity>(),
    canMove: new Interceptable<boolean, Entity>(),
    canAttack: new Interceptable<boolean, { entity: Entity; target: Entity }>(),
    canRetaliate: new Interceptable<boolean, { entity: Entity; source: Entity }>(),
    canBeAttackTarget: new Interceptable<boolean, { entity: Entity; source: Entity }>(),
    damageTaken: new Interceptable<number, { entity: Entity; amount: number }>(),
    healReceived: new Interceptable<number, { entity: Entity; amount: number }>()
  };

  constructor(
    protected session: GameSession,
    options: SerializedEntity
  ) {
    super();
    this.id = options.id;
    this.position = Vec3.fromPoint3D(options.position);
    this.cardIndex = options.cardIndex;
    this.playerId = options.playerId;
    this.movementsTaken = options?.movementsTaken ?? 0;
    this.attacksTaken = options?.attacksTaken ?? 0;

    this.currentHp.lazySetInitialValue(options.hp ?? this.maxHp);
    this.card.blueprint.modifiers.forEach(modifier => {
      this.addModifier(modifier);
    });

    this.emit('created', this);
  }

  equals(entity: Entity) {
    return entity.id === this.id;
  }

  serialize(): SerializedEntity {
    return {
      id: this.id,
      position: this.position.serialize(),
      cardIndex: this.cardIndex,
      playerId: this.playerId,
      hp: this.hp,
      movementsTaken: this.movementsTaken,
      attacksTaken: this.attacksTaken
    };
  }

  get card() {
    return this.player.cards[this.cardIndex] as Unit;
  }

  get player() {
    return this.session.playerSystem.getPlayerById(this.playerId)!;
  }

  get hp() {
    return this.currentHp.value;
  }

  private set hp(val: number) {
    this.currentHp.value = clamp(val, 0, this.maxHp);
  }

  get maxHp(): number {
    return this.interceptors.maxHp.getValue(this.card.maxHp, this);
  }

  get attack(): number {
    return this.interceptors.attack.getValue(this.card.attack, this);
  }

  get reach(): number {
    return this.interceptors.reach.getValue(config.UNIT_REACH, this);
  }

  canMove(distance: number) {
    return this.interceptors.canMove.getValue(
      distance <= this.reach && this.movementsTaken < 1 && this.attacksTaken === 0,
      this
    );
  }

  canRetaliate(source: Entity) {
    return this.interceptors.canRetaliate.getValue(true, { entity: this, source });
  }

  canBeAttacked(source: Entity) {
    return this.interceptors.canBeAttackTarget.getValue(true, { entity: this, source });
  }

  canAttackAt(point: Point3D, simulatedPosition?: Point3D) {
    return isWithinCells(simulatedPosition ?? this.position, point, 1);
  }

  canAttack(target: Entity) {
    if (!this.canAttackAt(target.position)) return false;

    const baseValue =
      this.attacksTaken < 1 &&
      this.canAttackAt(target.position) &&
      isEnemy(this.session, target.id, this.playerId);

    return (
      this.interceptors.canAttack.getValue(baseValue, { entity: this, target }) &&
      target.canBeAttacked(this)
    );
  }

  addInterceptor<T extends keyof EntityInterceptor>(
    key: T,
    interceptor: inferInterceptor<EntityInterceptor[T]>,
    priority?: number
  ) {
    this.interceptors[key].add(interceptor as any, priority);
  }

  removeInterceptor<T extends keyof EntityInterceptor>(
    key: T,
    interceptor: inferInterceptor<EntityInterceptor[T]>
  ) {
    this.interceptors[key].remove(interceptor as any);
  }

  startTurn() {
    this.movementsTaken = 0;
    this.attacksTaken = 0;
  }

  destroy() {
    this.session.entitySystem.removeEntity(this);
    this.emit('destroyed', this);
  }

  async move(path: Point3D[]) {
    const stopRunning = this.session.fxSystem.playAnimationUntil(this.id, 'run');

    await this.session.fxSystem.moveEntity(
      this.id,
      path.map(point => ({
        point,
        duration: 0.5
      }))
    );
    stopRunning();
    this.emit(ENTITY_EVENTS.BEFORE_MOVE, this);

    for (const point of path) {
      this.position = Vec3.fromPoint3D(point);
    }

    this.emit(ENTITY_EVENTS.AFTER_MOVE, this);
    this.movementsTaken++;
  }

  getTakenDamage(amount: number) {
    return this.interceptors.damageTaken.getValue(amount, {
      entity: this,
      amount
    });
  }

  getHealReceived(amount: number) {
    return this.interceptors.healReceived.getValue(amount, {
      entity: this,
      amount
    });
  }

  async dealDamage(power: number, target: Entity) {
    const payload = {
      entity: this,
      amount: power,
      target
    };
    this.emit(ENTITY_EVENTS.BEFORE_DEAL_DAMAGE, payload);

    await this.session.fxSystem.playAnimation(this.id, 'attack', {
      framePercentage: 0.75
    });
    await target.takeDamage(power, this.card);

    this.emit(ENTITY_EVENTS.AFTER_DEAL_DAMAGE, payload);
  }

  async takeDamage(power: number, source: AnyCard) {
    const amount = this.getTakenDamage(power);
    const payload = {
      entity: this,
      amount,
      source
    };
    this.emit(ENTITY_EVENTS.BEFORE_TAKE_DAMAGE, payload);
    const entity = source instanceof Unit ? source.entity : null;
    this.session.fxSystem.displayDamageIndicator(
      entity?.id ?? this.player.opponent.general.id,
      this.id,
      amount
    );
    await this.session.fxSystem.playAnimation(this.id, 'hit');
    this.hp -= amount;

    this.emit(ENTITY_EVENTS.AFTER_TAKE_DAMAGE, payload);
  }

  async performAttack(target: Entity) {
    this.emit(ENTITY_EVENTS.BEFORE_ATTACK, { entity: this, target });
    await this.dealDamage(this.attack, target);
    if (target.canRetaliate(this)) {
      await target.dealDamage(target.attack, this);
    }

    this.emit(ENTITY_EVENTS.AFTER_ATTACK, { entity: this, target });
  }

  async heal(baseAmount: number, source: AnyCard) {
    const amount = this.getTakenDamage(baseAmount);
    const payload = {
      entity: this,
      amount,
      source
    };
    this.emit(ENTITY_EVENTS.BEFORE_HEAL, payload);

    this.hp += amount;

    this.emit(ENTITY_EVENTS.AFTER_HEAL, payload);
  }

  getModifier(id: ModifierId) {
    return this.modifiers.find(m => m.id === id);
  }

  addModifier(modifier: Modifier) {
    const existing = this.getModifier(modifier.id);
    if (existing) {
      if (existing.stackable) {
        existing.stacks++;
      } else {
        return existing.onReapply(this.session, this, existing);
      }
    }

    this.modifiers.push(modifier);
    return modifier.onApplied(this.session, this, modifier);
  }

  removeModifier(modifierId: ModifierId, ignoreStacks = false) {
    this.modifiers.forEach(mod => {
      if (mod.id !== modifierId) return;

      if (mod.stackable && mod.stacks > 1 && !ignoreStacks) return;
      mod.onRemoved(this.session, this, mod);
    });

    this.modifiers = this.modifiers.filter(mod => {
      if (mod.id !== modifierId) return true;

      if (mod.stackable && mod.stacks > 1 && !ignoreStacks) return true;

      return false;
    });
  }

  isAlly(entityId: EntityId) {
    return isAlly(this.session, entityId, this.playerId);
  }

  isEnemy(entityId: EntityId) {
    return isEnemy(this.session, entityId, this.playerId);
  }

  get isGeneral() {
    return this.card.blueprint.kind == CARD_KINDS.GENERAL;
  }
}
