import { isDefined, Vec3, type Nullable, type Point3D } from '@game/shared';
import type { GameSession } from '../game-session';
import { TILES, type TileblueprintId } from './tile-lookup';
import type { Entity } from '../entity/entity';

export type TileOptions = {
  blueprintId: TileblueprintId;
  position: Point3D;
};

export class Tile {
  position: Vec3;
  blueprintId: TileblueprintId;
  private occupant: Nullable<Entity> = null;

  constructor(
    private session: GameSession,
    options: TileOptions
  ) {
    this.blueprintId = options.blueprintId;
    this.position = Vec3.fromPoint3D(options.position);

    this.checkOccupation = this.checkOccupation.bind(this);
    this.session.on('entity:created', this.checkOccupation);
    this.session.on('entity:destroyed', this.checkOccupation);
    this.session.on('entity:after-move', this.checkOccupation);
  }

  get blueprint() {
    return TILES[this.blueprintId];
  }

  private checkOccupation() {
    const previous = this.occupant;

    this.occupant = this.session.entitySystem.getEntityAt(this.position);

    if (!previous && this.occupant) {
      this.blueprint.onEnter(this.session, this.occupant);
    } else if (previous && !this.occupant) {
      this.blueprint.onLeave(this.session, previous);
    }
  }
}
