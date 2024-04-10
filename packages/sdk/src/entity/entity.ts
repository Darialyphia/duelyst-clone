import { type Serializable, Vec3, type Values, clamp, type Nullable } from '@game/shared';
import type { GameSession } from '../game-session';
import type { Point3D } from '../types';
import EventEmitter from 'eventemitter3';
import type { CardIndex, PlayerId } from '../player/player';
import { Interceptable, ReactiveValue, type inferInterceptor } from '../utils/helpers';
import { isAlly, isEnemy } from './entity-utils';
import { isWithinCells } from '../utils/targeting';
import {
  createEntityModifier,
  type EntityModifier,
  type ModifierId
} from '../modifier/entity-modifier';
import { Unit } from '../card/unit';
import { CARD_KINDS } from '../card/card-utils';
import { config } from '../config';
import type { AnyCard } from '../card/card';
import { KEYWORDS, type Keyword } from '../utils/keywords';
import { modifierInterceptorMixin } from '../modifier/mixins/interceptor.mixin';

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
  CREATED: 'created',

  BEFORE_DESTROY: 'before_destroy',
  AFTER_DESTROY: 'after_destroy',

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

  [ENTITY_EVENTS.BEFORE_DESTROY]: [entity: Entity];
  [ENTITY_EVENTS.AFTER_DESTROY]: [entity: Entity];

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

  modifiers: EntityModifier[] = [];

  position: Vec3;

  private movementsTaken: number;
  private attacksTaken: number;

  private currentHp = new ReactiveValue(0, hp => {
    const intercepted = this.interceptors.maxHp.getValue(hp, this);
    if (intercepted <= 0) {
      this.session.actionSystem.schedule(() => {
        this.destroy();
      });
    }
  });

  private interceptors = {
    attack: new Interceptable<number, Entity>(),
    maxHp: new Interceptable<number, Entity>(),
    reach: new Interceptable<number, Entity>(),
    range: new Interceptable<number, Entity>(),
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
    return this.interceptors.maxHp.getValue(this.currentHp.value, this);
  }

  private set hp(val: number) {
    this.currentHp.value = Math.min(val, this.maxHp);
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

  get range(): number {
    return this.interceptors.range.getValue(config.UNIT_ATTACK_RANGE, this);
  }

  canMove(distance: number) {
    return this.interceptors.canMove.getValue(
      distance <= this.reach && this.movementsTaken < 1 && this.attacksTaken === 0,
      this
    );
  }

  canRetaliate(source: Entity) {
    return this.interceptors.canRetaliate.getValue(this.canAttackAt(source.position), {
      entity: this,
      source
    });
  }

  canBeAttacked(source: Entity) {
    return this.interceptors.canBeAttackTarget.getValue(true, { entity: this, source });
  }

  canAttackAt(point: Point3D, simulatedPosition?: Point3D) {
    return isWithinCells(simulatedPosition ?? this.position, point, this.range);
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
    return () => this.removeInterceptor(key, interceptor);
  }

  removeInterceptor<T extends keyof EntityInterceptor>(
    key: T,
    interceptor: inferInterceptor<EntityInterceptor[T]>
  ) {
    this.interceptors[key].remove(interceptor as any);

    return () => this.removeInterceptor(key, interceptor);
  }

  clearAllInterceptors() {
    Object.values(this.interceptors).forEach(interceptor => interceptor.clear());
  }

  endTurn() {
    this.movementsTaken = 0;
    this.attacksTaken = 0;
  }

  destroy() {
    this.emit(ENTITY_EVENTS.BEFORE_DESTROY, this);
    this.session.fxSystem.playAnimation(this.id, 'death').then(() => {
      this.session.entitySystem.removeEntity(this);

      this.session.actionSystem.schedule(() => {
        this.emit(ENTITY_EVENTS.AFTER_DESTROY, this);
        this.modifiers.forEach(modifier => {
          modifier.onRemoved(this.session, this, modifier);
        });
      });
    });
  }

  async move(path: Point3D[]) {
    this.emit(ENTITY_EVENTS.BEFORE_MOVE, this);

    const stopRunning = this.session.fxSystem.playAnimationUntil(this.id, 'run');
    await this.session.fxSystem.moveEntity(
      this.id,
      path.map(point => ({
        point,
        duration: 0.5
      }))
    );
    stopRunning();

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
    const clamped = Math.min(amount, this.maxHp - this.hp);
    return this.interceptors.healReceived.getValue(clamped, {
      entity: this,
      amount: clamped
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

    // @FIXME removing this lien causes a circular dependency issue...like wtf ??
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const entity = source instanceof Unit ? source.entity : null;

    const bloodFx = this.session.rngSystem.nextInt(4);
    this.session.fxSystem.playSfxOnEntity(this.id, {
      resourceName: 'fx_bloodground',
      animationName: `bloodground${bloodFx ? bloodFx : ''}`,
      offset: {
        x: 0,
        y: 20
      }
    });
    await this.session.fxSystem.playAnimation(this.id, 'hit');
    this.hp = this.currentHp.value - amount;
    this.emit(ENTITY_EVENTS.AFTER_TAKE_DAMAGE, payload);
  }

  exhaust() {
    const modifierId = 'exhausted';
    const modifier = createEntityModifier({
      id: modifierId,
      visible: true,
      name: KEYWORDS.EXHAUSTED.name,
      description: KEYWORDS.EXHAUSTED.description,
      stackable: false,
      mixins: [
        modifierInterceptorMixin({
          key: 'canAttack',
          duration: 1,
          tickOn: 'end',
          interceptor: () => () => false,
          keywords: [KEYWORDS.EXHAUSTED]
        }),
        modifierInterceptorMixin({
          key: 'canMove',
          duration: 1,
          tickOn: 'end',
          interceptor: () => () => false,
          keywords: [KEYWORDS.EXHAUSTED]
        })
      ]
    });
    this.addModifier(modifier);
    const remove = () => {
      this.removeModifier(modifierId);
    };
    this.session.once('player:turn_end', remove);
  }

  async performAttack(target: Entity) {
    this.emit(ENTITY_EVENTS.BEFORE_ATTACK, { entity: this, target });
    await this.dealDamage(this.attack, target);
    if (target.canRetaliate(this)) {
      await target.dealDamage(target.attack, this);
    }
    this.exhaust();
    this.emit(ENTITY_EVENTS.AFTER_ATTACK, { entity: this, target });
  }

  async heal(baseAmount: number, source: AnyCard) {
    const amount = this.getHealReceived(baseAmount);

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

  addModifier(modifier: EntityModifier) {
    const existing = this.getModifier(modifier.id);
    if (existing) {
      if (existing.stackable) {
        existing.stacks++;
        return;
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

  hasKeyword(keyword: Keyword) {
    return this.modifiers.some(mod => mod.keywords.some(k => keyword.id === k.id));
  }
}
