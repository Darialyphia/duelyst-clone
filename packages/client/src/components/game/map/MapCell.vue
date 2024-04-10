<script setup lang="ts">
import { Unit } from '@game/sdk';
import type { CellId } from '@game/sdk/src/board/cell';
import type { FederatedPointerEvent } from 'pixi.js';
import { match } from 'ts-pattern';
import {
  DEFAULT_MOUSE_LIGHT_COLOR,
  DEFAULT_MOUSE_LIGHT_STRENGTH
} from '@/composables/useGameUi';
const { cellId } = defineProps<{ cellId: CellId }>();

const { assets, camera, ui, dispatch, pathfinding, fx, session } = useGame();
const cell = useGameSelector(session => session.boardSystem.getCellAt(cellId)!);
const activePlayer = useGameSelector(session => session.playerSystem.activePlayer);

const tileDiffuseTexture = computed(() => {
  if (!cell.value.tile) return null;
  const sheet = assets.getSpritesheet(cell.value.tile.blueprint.spriteId);
  return createSpritesheetFrameObject('idle', sheet);
});
const tileNormalTextures = computed(() => {
  if (!cell.value.tile) return null;
  const sheet = assets.getSpritesheet(cell.value.tile.blueprint.spriteId);
  return createSpritesheetFrameObject('idle', sheet);
});

const boardDimensions = useGameSelector(session => ({
  width: session.boardSystem.width,
  height: session.boardSystem.height
}));

const isHovered = computed(() => ui.hoveredCell.value?.equals(cell.value));
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
      <container
        @pointerenter="
          () => {
            ui.hoverAt(cell.position);
            match(ui.targetingMode.value)
              .with(TARGETING_MODES.SUMMON, TARGETING_MODES.NONE, () => {})
              .with(TARGETING_MODES.BASIC, () => {
                if (
                  ui.selectedEntity.value &&
                  ui.hoveredCell.value?.equals(cell) &&
                  ui.hoveredEntity.value?.isEnemy(ui.selectedEntity.value.id) &&
                  ui.selectedEntity.value.canAttack(ui.hoveredEntity.value) &&
                  ui.targetingMode.value === TARGETING_MODES.BASIC
                ) {
                  ui.setMouseLightColor('#ff0000');
                  ui.setMouseLightStrength(8);
                }
              })
              .with(TARGETING_MODES.FOLLOWUP, () => {
                if (!cell.entity) return;
                if (
                  ui.selectedCard.value instanceof Unit &&
                  ui.selectedCard.value.blueprint.followup?.isTargetable(
                    session,
                    cell,
                    ui.summonTarget.value!,
                    ui.selectedCard.value
                  )
                ) {
                  ui.setMouseLightStrength(8);
                  ui.setMouseLightColor(
                    cell.entity?.player.equals(activePlayer) ? '#77ff77' : '#ff7777'
                  );
                }
              });
          }
        "
        @pointerleave="
          () => {
            ui.unhover();
            ui.setMouseLightColor(DEFAULT_MOUSE_LIGHT_COLOR);
            ui.setMouseLightStrength(DEFAULT_MOUSE_LIGHT_STRENGTH);
          }
        "
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
                if (!ui.selectedCard.value?.canPlayAt(cell.position)) return;
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
              })
              .with(TARGETING_MODES.FOLLOWUP, () => {
                if (!ui.selectedCard.value) return;
                if (
                  ui.selectedCard.value.blueprint.followup?.isTargetable(
                    session,
                    cell,
                    ui.summonTarget.value!,
                    ui.selectedCard.value as any
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
      >
        <MapCellSprite :cell-id="cellId" />
      </container>
      <MapCellHighlights :cell="cell" />
      <container
        v-if="cell.tile && tileDiffuseTexture && tileNormalTextures"
        :y="-CELL_HEIGHT * 0.45"
        event-mode="none"
      >
        <PointLight
          v-if="cell.tile.blueprint.lightColor"
          :color="cell.tile.blueprint.lightColor"
          :brightness="0.5"
          :x="0"
          :y="0"
        />

        <IlluminatedSprite
          :diffuse-textures="tileDiffuseTexture"
          :normal-textures="tileNormalTextures"
          :anchor="0.5"
        />
      </container>

      <HoveredCell v-if="isHovered" />
    </container>
  </IsoPositioner>
</template>
