<script setup lang="ts">
const { ui } = useGame();
</script>

<template>
  <container
    :ref="(container: any) => ui.assignLayer(container, 'ui')"
    :y="-CELL_HEIGHT * 1.1"
    :x="-CELL_WIDTH * 0.3"
    event-mode="none"
  ></container>
</template>
