<script setup lang="ts">
import { diffuseGroup, normalGroup, lightGroup, PointLight } from '@pixi/lights';

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
    <Layer :group="diffuseGroup" />
    <Layer :group="normalGroup" />
    <Layer :group="lightGroup" />

    <AmbientLight
      :color="ui.ambientLightColor.value"
      :brightness="ui.ambientLightStrength.value"
    />

    <Underground />
    <MapCell v-for="cell in cells" :key="cell.id" :cell-id="cell.id" />

    <Entity v-for="entity in entities" :key="entity.id" :entity-id="entity.id" />
    <SummonPreview />
    <PointLight
      :brightness="10"
      :color="ui.mouseLightColor.value"
      :position="ui.mousePosition.value"
      :falloff="[ui.mouseLightStrength.value, 3, 10]"
    />
  </Camera>

  <!-- <Tint /> -->
  <FollowupOverlay />
  <Layer :ref="(layer: any) => ui.registerLayer(layer, 'ui')" />
  <Fps />
</template>
