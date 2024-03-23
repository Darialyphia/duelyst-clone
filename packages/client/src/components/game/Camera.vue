<script setup lang="ts">
import { useApplication } from 'vue3-pixi';
import { type Viewport } from 'pixi-viewport';
import { CELL_HEIGHT, CELL_WIDTH } from '@/utils/constants';
import { pointToIndex } from '@game/shared';
import { Container } from 'pixi.js';

const app = useApplication();
const screenViewport = shallowRef<Viewport>();

const { fx } = useGame();

const { camera } = useGame();

useEventListener('keydown', e => {
  if (e.repeat) return;

  if (e.code === 'KeyQ') {
    camera.rotateCCW();
  } else if (e.code === 'KeyE') {
    camera.rotateCW();
  }
});

const cells = useGameSelector(session => session.boardSystem.cells);
const boardDimensions = useGameSelector(session => ({
  width: session.boardSystem.width,
  height: session.boardSystem.height
}));
const isoCells = computed(() =>
  cells.value.map(cell => toIso(cell.position, camera.angle.value, boardDimensions.value))
);
const minX = computed(() => Math.min(...isoCells.value.map(c => c.isoX)));
const maxX = computed(() => Math.max(...isoCells.value.map(c => c.isoX)));
const minY = computed(() => Math.min(...isoCells.value.map(c => c.isoY - c.isoZ)));
const maxY = computed(() => Math.max(...isoCells.value.map(c => c.isoY - c.isoZ)));
const isoBoundingRect = computed(() => ({
  topLeft: { x: minX.value, y: minY.value },
  bottomRight: { x: maxX.value, y: maxY.value }
}));

const WORLD_PADDING = {
  x: CELL_WIDTH,
  y: CELL_HEIGHT * 2
};
const worldSize = computed(() => ({
  width:
    isoBoundingRect.value.bottomRight.x -
    isoBoundingRect.value.topLeft.x +
    WORLD_PADDING.x,
  height:
    isoBoundingRect.value.bottomRight.y -
    isoBoundingRect.value.topLeft.y +
    WORLD_PADDING.y
}));

const containerOffset = computed(() => ({
  x: -minX.value + WORLD_PADDING.x / 2,
  y: -minY.value + WORLD_PADDING.y / 2
}));

const isoCenter = computed(() => {
  const i = pointToIndex(
    {
      x: Math.round(boardDimensions.value.width / 2),
      y: Math.round(boardDimensions.value.height / 2)
    },
    boardDimensions.value.width
  );

  return isoCells.value[i];
});

until(screenViewport)
  .not.toBe(undefined)
  .then(() => {
    screenViewport.value
      ?.drag({
        mouseButtons: 'right'
      })
      .pinch()
      .decelerate({ friction: 0.88 })
      .wheel({ smooth: 3, percent: 0.05 })
      .clamp({
        direction: 'all'
      })
      .clampZoom({ minScale: 2, maxScale: 3 })
      .zoomPercent(0, false)
      .moveCenter(
        isoCenter.value.isoX + containerOffset.value.x,
        isoCenter.value.isoY + containerOffset.value.y - CELL_HEIGHT / 2
      );
  });
</script>

<template>
  <viewport
    ref="screenViewport"
    :screen-width="app.view.width"
    :screen-height="app.view.height"
    :world-width="worldSize.width"
    :world-height="worldSize.height"
    :events="app.renderer.events"
    :disable-on-context-menu="true"
    :sortable-children="true"
  >
    <graphics
      :alpha="0"
      @render="
        g => {
          g.clear();
          g.beginFill('red');
          g.drawRect(0, 0, worldSize.width, worldSize.height);
          g.endFill();
        }
      "
    />
    <container
      v-bind="containerOffset"
      :ref="
        (container: any) => {
          if (container instanceof Container) {
            fx.registerRoot(container);
          }
        }
      "
      :sortable-children="true"
    >
      <slot />
    </container>
  </viewport>

  <Fps />
</template>
