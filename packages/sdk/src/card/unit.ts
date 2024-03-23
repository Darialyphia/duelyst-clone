import { CARDS, type CardBlueprint } from './card-lookup';
import { Interceptable, type inferInterceptor } from '../utils/helpers';
import { Card } from './card';
import type { Nullable, Point3D } from '@game/shared';
import { config } from '../config';
import type { Entity } from '../entity/entity';

export type UnitInterceptor = Unit['interceptors'];

type UnitBlueprint = CardBlueprint & {
  kind: 'MINION' | 'GENERAL';
};

type UnitCtx = { position: Point3D; targets: Point3D[] };

export class Unit extends Card<UnitCtx> {
  entity: Nullable<Entity> = null;
  summonFollowupTargets: Point3D[] = [];

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
    canSummonAt: new Interceptable<boolean, Unit>()
  };

  addInterceptor<T extends keyof UnitInterceptor>(
    key: T,
    interceptor: inferInterceptor<UnitInterceptor[T]>,
    priority?: number
  ) {
    this.interceptors[key].add(interceptor as any, priority);
  }

  removeInterceptor<T extends keyof UnitInterceptor>(
    key: T,
    interceptor: inferInterceptor<UnitInterceptor[T]>
  ) {
    this.interceptors[key].remove(interceptor as any);
  }

  async onPlay(ctx: UnitCtx) {
    this.summonFollowupTargets = ctx.targets;
    this.entity = this.session.entitySystem.addEntity({
      cardIndex: this.index,
      playerId: this.playerId,
      position: ctx.position
    });
  }

  get attack(): number {
    this.blueprint.kind;
    return this.interceptors.attack.getValue(this.blueprint.attack, this);
  }

  get maxHp(): number {
    return this.interceptors.maxHp.getValue(this.blueprint.maxHp, this);
  }

  canSummonAt(point: Point3D) {
    const isOccupied = !!this.session.entitySystem.getEntityAt(point);
    if (isOccupied) return false;
    const nearby = this.session.boardSystem.getNeighbors(point);
    const predicate = nearby.some(cell => cell.entity?.player.equals(this.player));

    return this.interceptors.canSummonAt.getValue(predicate, this);
  }
}
