import type { MaybePromise } from '@game/shared';
import { keyBy } from 'lodash-es';
import type { GameSession } from '../game-session';
import type { Entity } from '../entity/entity';

export type TileblueprintId = string;

export type TileBlueprint = {
  id: string;
  spriteId: string;
  onEnter(session: GameSession, entity: Entity): MaybePromise<void>;
  onLeave(session: GameSession, entity: Entity): MaybePromise<void>;
};

const allTiles: TileBlueprint[] = [];
export const TILES: Record<TileblueprintId, TileBlueprint> = keyBy(allTiles, 'id');
