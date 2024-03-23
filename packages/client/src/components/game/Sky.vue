<script setup lang="ts">
import sky1 from '@/assets/backgrounds/sky-1.png';
import sky2 from '@/assets/backgrounds/sky-2.png';
import sky4 from '@/assets/backgrounds/sky-4.png';
import { useApplication, useScreen } from 'vue3-pixi';

const app = useApplication();
const screen = useScreen();

const SKY_SIZE = { x: 576, y: 324 };
const scaleY = app.value.view.height / SKY_SIZE.y;
</script>

<template>
  <tiling-sprite
    :texture="sky1"
    :width="screen.width"
    :height="screen.height"
    :scale="scaleY"
  />
  <tiling-sprite
    :texture="sky2"
    :width="screen.width"
    :height="screen.height"
    :scale="scaleY"
  />
  <tiling-sprite
    :texture="sky4"
    :width="screen.width"
    :height="screen.height"
    :scale="scaleY"
  />
</template>
