<script setup lang="ts">
import type { EntityId } from '@game/sdk';
import { AnimatedSprite, BlurFilter } from 'pixi.js';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import IlluminatedSprite from '../IlluminatedSprite.vue';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { clamp, dist, mapRange } from '@game/shared';
import { useScreen } from 'vue3-pixi';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { camera, ui, fx } = useGame();
const entity = useGameSelector(session => session.entitySystem.getEntityById(entityId)!);
const sprite = ref<AnimatedSprite>();
const { diffuseTextures, normalTextures } = useEntityTexture(entityId, sprite);

const screen = useScreen();

const scaleY = ref(-0.5);
watchEffect(() => {
  const root = fx.getEntityRoot(entityId);

  const dist = root
    ? ui.mousePosition.value.y - root.position.y
    : ui.mousePosition.value.y;

  const val = mapRange(
    dist,
    [-screen.value.height / 2, screen.value.height / 2],
    [-0.5, 0.5]
  );

  scaleY.value = clamp(val * 5, -0.5, 0.5);
});

const getSkewX = () => {
  let coef = entity.value.player.isPlayer1 ? 1 : -1;
  if (camera.angle.value === 90 || camera.angle.value === 180) {
    coef *= -1;
  }

  if (scaleY.value < 0) coef *= -1;

  const root = fx.getEntityRoot(entityId);

  const dist = root ? ui.mousePosition.value.x - root.position.x : null;

  return (
    coef *
    mapRange(
      dist ?? ui.mousePosition.value.x,
      [-camera.offset.value.x, screen.value.height - camera.offset.value.x],
      [-1, 1]
    )
  );
};

const skewX = ref(getSkewX());
watchEffect(() => {
  skewX.value = getSkewX();
});

const distanceFromMouse = computed(() => {
  const root = fx.getEntityRoot(entityId);
  return dist(root ? root.position : { x: 0, y: 0 }, ui.mousePosition.value);
});

const ALPHA_DISSIPATION_FACTOR = 2;
const MAX_ALPHA = 0.7;
const MAX_ALPHA_DISSIPATION = 0.5;
const MAX_BLUR = 10;

const alpha = computed(
  () =>
    MAX_ALPHA -
    mapRange(
      distanceFromMouse.value,
      [0, Math.hypot(screen.value.height, screen.value.width)],
      [0, MAX_ALPHA_DISSIPATION]
    ) *
      ALPHA_DISSIPATION_FACTOR
);

const blur = computed(() =>
  mapRange(
    distanceFromMouse.value,
    [0, Math.hypot(screen.value.height, screen.value.width)],
    [0, MAX_BLUR]
  )
);

const shadowFilters = computed(() => [
  new ColorOverlayFilter(0x000000),
  new AdjustmentFilter({ alpha: alpha.value }),
  new BlurFilter(blur.value)
]);
</script>

<template>
  <container
    :ref="
      (el: any) => {
        const spriteInst = el?.children?.find(
          (child: any) => child instanceof AnimatedSprite
        );

        if (spriteInst) sprite = spriteInst;
      }
    "
    :z-index="1"
  >
    <IlluminatedSprite
      v-if="diffuseTextures?.length && normalTextures?.length"
      ref="sprite"
      :diffuse-textures="diffuseTextures"
      :normal-textures="normalTextures"
      :filters="shadowFilters"
      :scale-y="scaleY"
      :skew-x="skewX"
      :anchor-x="0.5"
      :anchor-y="1"
      :x="0"
      :y="CELL_HEIGHT * 0.5"
      loop
      event-mode="none"
      playing
    />
  </container>
</template>
