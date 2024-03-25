<script setup lang="ts">
import { useStage } from 'vue3-pixi';

// watchEffect(() => {
//   if (gameObjectsLayer.value) {
//     gameObjectsLayer.value.group.enableSort = true;
//     gameObjectsLayer.value.sortableChildren = true;
//   }
// });
const { ui } = useGame();

const cells = useGameSelector(session => session.boardSystem.cells);
const entities = useGameSelector(session => session.entitySystem.getList());
</script>

<template>
  <Sky />
  <Camera>
    <Layer :ref="(layer: any) => ui.registerLayer(layer, 'scene')">
      <!-- <Underground /> -->
      <MapCell v-for="cell in cells" :key="cell.id" :cell-id="cell.id" />

      <Entity v-for="entity in entities" :key="entity.id" :entity-id="entity.id" />
      <SummonPreview />
    </Layer>
  </Camera>

  <Tint />
  <FollowupOverlay />
  <Layer :ref="(layer: any) => ui.registerLayer(layer, 'ui')" />
  <Fps />
</template>
