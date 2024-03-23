<script setup lang="ts">
import { Unit } from '@game/sdk/src/card/unit';
import { AnimatedSprite } from 'pixi.js';

const { camera, assets, ui, fx } = useGame();

const textures = computed(() => {
  const id = ui.selectedCard.value?.blueprint.spriteId;
  if (!id) return null;
  const sheet = assets.getSpritesheet(id);

  return createSpritesheetFrameObject('breathing', sheet);
});

const scaleX = computed(() => {
  let value = ui.selectedCard.value!.player.isPlayer1 ? 1 : -1;
  if (camera.angle.value === 90 || camera.angle.value === 180) {
    value *= -1;
  }

  return value;
});

const boardDimensions = useGameSelector(session => ({
  width: session.boardSystem.width,
  height: session.boardSystem.height
}));

const isDisplayed = computed(() => {
  if (!textures) return false;
  if (
    !ui.hoveredCell.value ||
    ui.targetingMode.value !== TARGETING_MODES.SUMMON ||
    !ui.selectedCard.value
  ) {
    return false;
  }
  return (
    ui.selectedCard.value instanceof Unit &&
    ui.selectedCard.value.canSummonAt(ui.hoveredCell.value.position)
  );
});
</script>

<template>
  <IsoPositioner
    v-if="isDisplayed"
    :animated="false"
    v-bind="ui.hoveredCell.value!.position"
    :z-index-offset="3"
    :angle="camera.angle.value"
    :height="boardDimensions.height"
    :width="boardDimensions.width"
    :offset="{
      x: 0,
      y: -CELL_HEIGHT * 0.7
    }"
    event-mode="none"
  >
    <animated-sprite
      :alpha="0.5"
      :textures="textures"
      :anchor="0.5"
      :scale-x="scaleX"
      :playing="true"
    />
  </IsoPositioner>
</template>
