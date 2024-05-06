import { CARDS, type CardBlueprint } from './card-lookup';
import { Card } from './card';
import type { Point3D } from '@game/shared';

export type SpellInterceptor = Spell['interceptors'];

type SpellBlueprint = CardBlueprint & {
  kind: 'SPELL';
};

type SpellCtx = { position: Point3D; targets: Point3D[] };

export class Spell extends Card<SpellCtx> {
  followupTargets: Point3D[] = [];
  castPoint!: Point3D;

  get blueprint(): SpellBlueprint {
    return CARDS[this.blueprintId] as SpellBlueprint;
  }

  get kind() {
    return this.blueprint.kind;
  }

  canPlayAt(point: Point3D) {
    return this.blueprint.isTargetable(this.session, point);
  }

  async onPlay(ctx: SpellCtx) {
    this.castPoint = ctx.position;
    this.followupTargets = ctx.targets;
    this.blueprint.onPlay(this.session, this, this.blueprint.meta);
  }
}
