<script setup lang="ts">
import { Unit } from '@game/sdk';
import type { CellId } from '@game/sdk/src/board/cell';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import type { FederatedPointerEvent, Filter } from 'pixi.js';
import { match } from 'ts-pattern';
import { Hitbox } from '~/utils/hitbox';

const { cellId } = defineProps<{ cellId: CellId }>();

const { assets, camera, ui, dispatch, pathfinding, fx, session } = useGame();
const cell = useGameSelector(session => session.boardSystem.getCellAt(cellId)!);

const textures = computed(() => {
  const sheet = assets.getSpritesheet(cell.value.spriteId);
  return sheet.animations[0];
});

const tileTexture = computed(() => {
  if (!cell.value.tile) return null;
  const sheet = assets.getSpritesheet(cell.value.tile.blueprint.spriteId);
  return createSpritesheetFrameObject('idle', sheet);
});

const boardDimensions = useGameSelector(session => ({
  width: session.boardSystem.width,
  height: session.boardSystem.height
}));
const activePlayer = useGameSelector(session => session.playerSystem.activePlayer);

const isHovered = computed(() => ui.hoveredCell.value?.equals(cell.value));

const shape = assets.getHitbox('tile');
const hitArea = Hitbox.from(shape.shapes[0].points, shape.shapes[0].source, 0.5);

const pathFilter = new ColorOverlayFilter(0x4455bb, 0.5);
const attackFilter = new ColorOverlayFilter(0xff0000, 0.5);
const isMovePathHighlighted = computed(() => {
  if (!ui.hoveredCell.value) return false;
  if (ui.targetingMode.value !== TARGETING_MODES.BASIC) return false;

  const entityOnCell = session.entitySystem.getEntityAt(cell.value);
  if (!ui.selectedEntity.value) return false;

  const canMoveTo = pathfinding.canMoveTo(ui.selectedEntity.value, cell.value);
  if (!canMoveTo) return false;

  const path = pathfinding.getPath(
    ui.selectedEntity.value,
    ui.hoveredCell.value,
    ui.selectedEntity.value.reach
  );

  if (!path) return false;

  const isInPath = path.some(vec => vec.equals(cell.value.position));

  return isInPath || entityOnCell?.equals(ui.selectedEntity.value);
});

const filters = computed(() => {
  const result: Filter[] = [];
  if (fx.isPlaying.value) return result;
  if (isMovePathHighlighted.value) result.push(pathFilter);
  if (
    ui.selectedEntity.value &&
    ui.hoveredCell.value?.equals(cell.value) &&
    ui.hoveredEntity.value?.isEnemy(ui.selectedEntity.value.id) &&
    ui.selectedEntity.value.canAttack(ui.hoveredEntity.value) &&
    ui.targetingMode.value === TARGETING_MODES.BASIC
  ) {
    result.push(attackFilter);
  }

  return result;
});
</script>

<template>
  <IsoPositioner
    :animated="!fx.isPlaying.value"
    v-bind="cell.position"
    :angle="camera.angle.value"
    :height="boardDimensions.height"
    :width="boardDimensions.width"
  >
    <container>
      <animated-sprite
        :textures="textures"
        :anchor="0.5"
        :hit-area="hitArea"
        :filters="filters"
        @pointerenter="ui.hoverAt(cell.position)"
        @pointerleave="ui.unhover()"
        @pointerup="
          (event: FederatedPointerEvent) => {
            if (event.button !== 0) {
              ui.unselectEntity();
              ui.unselectCard();
              return;
            }

            match(ui.targetingMode.value)
              .with(TARGETING_MODES.BASIC, () => {
                if (cell.entity) {
                  if (cell.entity.player.equals(activePlayer)) {
                    ui.selectEntity(cell.entity.id);
                  } else if (ui.selectedEntity.value!.canAttack(cell.entity)) {
                    dispatch('attack', {
                      targetId: cell.entity.id,
                      entityId: ui.selectedEntity.value!.id
                    });
                  } else {
                    ui.unselectEntity();
                  }
                } else {
                  if (pathfinding.canMoveTo(ui.selectedEntity.value!, cell)) {
                    dispatch('move', {
                      entityId: ui.selectedEntity.value!.id,
                      position: cell.position
                    });
                  } else {
                    ui.unselectEntity();
                  }
                }
              })
              .with(TARGETING_MODES.SUMMON, () => {
                if (
                  ui.selectedCard.value instanceof Unit &&
                  ui.selectedCard.value.canSummonAt(cell.position)
                ) {
                  if (ui.selectedCard.value.blueprint.followup) {
                    ui.summonTarget.value = cell.position;
                    ui.switchTargetingMode(TARGETING_MODES.FOLLOWUP);
                  } else {
                    dispatch('playCard', {
                      cardIndex: ui.selectedCardIndex.value!,
                      position: cell.position,
                      targets: []
                    });
                    ui.unselectCard();
                  }
                }
              })
              .with(TARGETING_MODES.FOLLOWUP, () => {
                if (
                  ui.selectedCard.value instanceof Unit &&
                  ui.selectedCard.value.blueprint.followup?.isTargetable(
                    session,
                    cell,
                    ui.summonTarget.value!,
                    ui.selectedCard.value
                  )
                ) {
                  ui.followupTargets.value.push(cell.position);
                }
              })
              .with(TARGETING_MODES.NONE, () => {
                if (cell.entity?.player.equals(activePlayer)) {
                  ui.selectEntity(cell.entity.id);
                }
              });
          }
        "
      />
      <animated-sprite
        v-if="tileTexture"
        event-mode="none"
        :textures="tileTexture"
        :anchor="0.5"
        :y="-CELL_HEIGHT * 0.45"
      />

      <MapCellHighlights :cell="cell" />
      <HoveredCell v-if="isHovered" />
    </container>
  </IsoPositioner>
</template>
