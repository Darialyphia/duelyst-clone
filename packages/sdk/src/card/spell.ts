import { CARDS, type CardBlueprint } from './card-lookup';
import { Card } from './card';
import type { Point3D } from '@game/shared';
import type { Cell } from '../board/cell';

export type SpellInterceptor = Spell['interceptors'];

type SpellBlueprint = CardBlueprint & {
  kind: 'SPELL';
};

type SpellCtx = { targets: Point3D[] };

export class Spell extends Card<SpellCtx> {
  get blueprint(): SpellBlueprint {
    return CARDS[this.blueprintId] as SpellBlueprint;
  }

  get kind() {
    return this.blueprint.kind;
  }

  async onPlay(ctx: SpellCtx) {
    this.blueprint.onPlay(this.session, ctx.targets);
  }
}
