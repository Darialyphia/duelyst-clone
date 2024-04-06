<script setup lang="ts">
import type { EntityId } from '@game/sdk';
import { AnimatedSprite } from 'pixi.js';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import IlluminatedSprite from '../IlluminatedSprite.vue';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { camera } = useGame();
const entity = useGameSelector(session => session.entitySystem.getEntityById(entityId)!);
const sprite = ref<AnimatedSprite>();
const { diffuseTextures, normalTextures } = useEntityTexture(entityId, sprite);

const skewX = computed(() => {
  let value = entity.value.player.isPlayer1 ? -1 : 1;
  if (camera.angle.value === 90 || camera.angle.value === 180) {
    value *= -1;
  }

  return value;
});

const x = computed(() => {
  let value = entity.value.player.isPlayer1 ? -20 : 20;
  if (camera.angle.value === 90 || camera.angle.value === 180) {
    value *= -1;
  }

  return value;
});
const shadowFilters = [new ColorOverlayFilter(0x000000)];
</script>

<template>
  <IlluminatedSprite
    v-if="diffuseTextures?.length && normalTextures?.length"
    ref="sprite"
    :diffuse-textures="diffuseTextures"
    :normal-textures="normalTextures"
    :z-index="1"
    :alpha="0.85"
    :filters="shadowFilters"
    :scale-y="-0.5"
    :skew-x="skewX"
    :anchor="0.5"
    :x="x"
    :y="CELL_HEIGHT * 0.75"
    loop
    event-mode="none"
    playing
  />
</template>
