import type { MaybePromise } from '@game/shared';
import { keyBy } from 'lodash-es';
import type { GameSession } from '../game-session';
import type { Entity } from '../entity/entity';
import type { Tile } from './tile';

export type TileblueprintId = string;

export type TileBlueprint = {
  id: string;
  spriteId: string;
  onEnter(session: GameSession, entity: Entity, tile: Tile): MaybePromise<void>;
  onLeave(session: GameSession, entity: Entity, tile: Tile): MaybePromise<void>;
};

const allTiles: TileBlueprint[] = [
  {
    id: 'mana-tile',
    spriteId: 'mana-tile',
    onEnter(session, entity, tile) {
      const interceptor = (val: number) => val + 1;
      entity.player.addInterceptor('maxMana', interceptor);
      entity.player.giveMana(1);
      entity.player.on('turn_end', () => {
        entity.player.removeInterceptor('maxMana', interceptor);
      });

      tile.blueprintId = 'mana-tile-depleted';
    },
    onLeave() {
      return;
    }
  },
  {
    id: 'mana-tile-depleted',
    spriteId: 'mana-tile-depleted',
    onEnter() {
      return;
    },
    onLeave() {
      return;
    }
  }
];
export const TILES: Record<TileblueprintId, TileBlueprint> = keyBy(allTiles, 'id');
