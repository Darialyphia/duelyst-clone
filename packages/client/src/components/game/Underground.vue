<script setup lang="ts">
const { camera, fx, assets } = useGame();

const DEPTH = 1;
const UNDERGROUND_SPRITE_SIZE = 4;

const cells = useGameSelector(session => session.boardSystem.cells);
const boardDimensions = useGameSelector(session => ({
  width: session.boardSystem.width,
  height: session.boardSystem.height
}));

const edgeCells = computed(() =>
  cells.value.filter(
    cell =>
      cell.z === 0 &&
      (cell.x === 0 ||
        cell.y === 0 ||
        cell.x === boardDimensions.value.width - 1 ||
        cell.y === boardDimensions.value.height - 1)
  )
);

const textures = computed(() => {
  const sheet = assets.getSpritesheet('underground');
  return sheet.animations[0];
});

// const floor = Array.from({ length: state.value.map.height + 6 }, (_, y) =>
//   Array.from({ length: state.value.map.width + 6 }, (_, x) => ({
//     x: x,
//     y: y,
//     z: -1
//   }))
// )
//   .flat()
//   .filter(cell => cell.x > state.value.map.width || cell.y > state.value.map.height);

// const floorTexture = computed(() => {
//   const sheet = assets.getSpritesheet('water');
//   return sheet.animations[0];
// });
</script>

<template>
  <template v-for="cell in edgeCells">
    <IsoPositioner
      v-for="i in DEPTH"
      :key="`${cell.id}:${i}`"
      :animated="!fx.isPlaying.value"
      v-bind="cell.position"
      :z="-i * UNDERGROUND_SPRITE_SIZE + 2"
      :angle="camera.angle.value"
      :height="boardDimensions.height"
      :width="boardDimensions.width"
    >
      <animated-sprite :textures="textures" :anchor="0.5" event-mode="none" />
    </IsoPositioner>
  </template>
  <!-- <IsoPositioner
    v-for="(cell, index) in floor"
    :key="index"
    :animated="!fx.isPlaying.value"
    v-bind="cell"
    :angle="0"
    :height="state.map.height + 5"
    :width="state.map.width + 5"
    :z-index-offset="100"
  >
    <animated-sprite :textures="floorTexture" :anchor="0.5" event-mode="none" />
  </IsoPositioner> -->
</template>
