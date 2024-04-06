<script setup lang="ts">
import type { Texture, FrameObject } from 'pixi.js';
import { diffuseGroup, normalGroup } from '@pixi/lights';

defineOptions({
  inheritAttrs: false
});

const { diffuseTextures, normalTextures } = defineProps<{
  diffuseTextures: (Texture | FrameObject)[];
  normalTextures: (Texture | FrameObject)[];
}>();
</script>

<template>
  <animated-sprite
    v-bind="$attrs"
    :ref="
      (el: any) => {
        if (!el) return;
        el.parentGroup = diffuseGroup;
      }
    "
    :textures="diffuseTextures"
  />

  <animated-sprite
    v-bind="$attrs"
    :ref="
      (el: any) => {
        if (!el) return;
        el.parentGroup = normalGroup;
      }
    "
    :textures="normalTextures"
  />
</template>
