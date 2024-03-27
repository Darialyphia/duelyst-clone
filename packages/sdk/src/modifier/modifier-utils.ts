import type { Point3D } from '@game/shared';
import type { Cell } from '../board/cell';
import type { Entity } from '../entity/entity';
import type { GameSession } from '../game-session';
import { createCardModifier } from './card-modifier';
import type { Unit } from '../card/unit';

export const dispelEntity = (entity: Entity) => {
  entity.modifiers.forEach(modifier => {
    entity.removeModifier(modifier.id);
  });

  entity.clearAllInterceptors();
};

export const dispelCell = (cell: Cell) => {
  cell.tile = null;
  if (cell.entity) {
    dispelEntity(cell.entity);
  }
};

export const dispelAt = (session: GameSession, point: Point3D) => {
  const cell = session.boardSystem.getCellAt(point);
  if (cell) {
    dispelCell(cell);
  }
};

export const airdrop = () =>
  createCardModifier<Unit>({
    id: 'airdrop',
    mixins: [
      {
        onApplied(session, attachedTo) {
          attachedTo.addInterceptor(
            'canSummonAt',
            (value, { point }) => !session.entitySystem.getEntityAt(point)
          );
        }
      }
    ]
  });
