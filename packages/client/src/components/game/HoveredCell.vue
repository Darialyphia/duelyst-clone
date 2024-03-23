<script setup lang="ts">
const { assets } = useGame();
const textures = computed(() =>
  createSpritesheetFrameObject('idle', assets.getSpritesheet('hovered-cell'))
);
</script>

<template>
  <animated-sprite
    :x="0"
    :event-mode="'none'"
    :anchor="0.5"
    playing
    :textures="textures"
  />
</template>
