import { CARDS, type CardBlueprint } from './card-lookup';
import { Interceptable, type inferInterceptor } from '../utils/helpers';
import { Card } from './card';
import type { Nullable, Point3D } from '@game/shared';
import { ENTITY_EVENTS, type Entity } from '../entity/entity';

export type UnitInterceptor = Unit['interceptors'];

type UnitBlueprint = CardBlueprint & {
  kind: 'MINION' | 'GENERAL';
};

type UnitCtx = { position: Point3D; targets: Point3D[] };

export class Unit extends Card<UnitCtx> {
  entity: Nullable<Entity> = null;
  followupTargets: Point3D[] = [];
  summonPoint!: Point3D;

  get blueprint(): UnitBlueprint {
    return CARDS[this.blueprintId] as UnitBlueprint;
  }

  get kind() {
    return this.blueprint.kind;
  }

  protected interceptors = {
    attack: new Interceptable<number, Unit>(),
    maxHp: new Interceptable<number, Unit>(),
    manaCost: new Interceptable<number, Card<UnitCtx>>(),
    canSummonAt: new Interceptable<boolean, { unit: Unit; point: Point3D }>(),
    shouldExhaustOnPlay: new Interceptable<boolean, Unit>()
  };

  get shouldExhaustOnPlay(): boolean {
    return this.interceptors.shouldExhaustOnPlay.getValue(true, this);
  }

  get attack(): number {
    this.blueprint.kind;
    return this.interceptors.attack.getValue(this.blueprint.attack, this);
  }

  get maxHp(): number {
    return this.interceptors.maxHp.getValue(this.blueprint.maxHp, this);
  }

  async onPlay(ctx: UnitCtx) {
    this.followupTargets = ctx.targets;
    this.summonPoint = ctx.position;

    this.entity = this.session.entitySystem.addEntity({
      cardIndex: this.index,
      playerId: this.playerId,
      position: ctx.position
    });
    const id = this.entity.id;
    this.session.fxSystem.playSfxOnEntity(id, {
      resourceName: 'fx_smoke2',
      animationName: 'smokeground',
      offset: { x: 0, y: 20 },
      delay: 200
    });
    await this.blueprint.onPlay(this.session, this as any);
    this.entity.emit(ENTITY_EVENTS.CREATED, this.entity);

    if (this.shouldExhaustOnPlay) {
      this.entity.exhaust();
    }
  }

  canPlayAt(point: Point3D) {
    const isOccupied = !!this.session.entitySystem.getEntityAt(point);
    if (isOccupied) return false;
    const nearby = this.session.boardSystem.getNeighbors(point);
    const predicate = nearby.some(cell => cell.entity?.player.equals(this.player));

    return this.interceptors.canSummonAt.getValue(predicate, { unit: this, point });
  }

  addInterceptor<T extends keyof UnitInterceptor>(
    key: T,
    interceptor: inferInterceptor<UnitInterceptor[T]>,
    priority?: number
  ) {
    this.interceptors[key].add(interceptor as any, priority);
    return () => this.removeInterceptor(key, interceptor);
  }

  removeInterceptor<T extends keyof UnitInterceptor>(
    key: T,
    interceptor: inferInterceptor<UnitInterceptor[T]>
  ) {
    this.interceptors[key].remove(interceptor as any);
  }
}
