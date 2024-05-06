import { CARDS } from './card-lookup';
import { Card } from './card';
import type { Entity } from '../entity/entity';
import type { CardBlueprint } from './card-blueprint';

export type ArtifactInterceptor = Artifact['interceptors'];

type ArtifactBlueprint = CardBlueprint & {
  kind: 'ARTIFACT';
};

type ArtifactCtx = {
  equipedOn: Entity;
};

export class Artifact extends Card<ArtifactCtx> {
  get blueprint(): ArtifactBlueprint {
    return CARDS[this.blueprintId] as ArtifactBlueprint;
  }

  get kind() {
    return this.blueprint.kind;
  }

  canPlayAt() {
    return true;
  }

  async onPlay(ctx: ArtifactCtx) {
    return this.blueprint.onEquiped(this.session, ctx.equipedOn, this.blueprint.meta);
  }
}
