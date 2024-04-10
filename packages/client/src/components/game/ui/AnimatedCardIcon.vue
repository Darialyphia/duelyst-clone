<script setup lang="ts">
import { CARD_KINDS, type CardKind } from '@game/sdk';
import { match } from 'ts-pattern';
const { spriteId, kind, isActive, isHovered } = defineProps<{
  spriteId: string;
  kind: CardKind;
  isActive?: boolean;
  isHovered?: boolean;
}>();
const assets = useAssets();

const sheet = ref<SpritesheetWithAnimations>();

const getSheet = async () => {
  sheet.value = await assets.loadSpritesheet(spriteId);
};

watchEffect(getSheet);

const animationName = computed(() =>
  match(kind)
    .with(CARD_KINDS.MINION, CARD_KINDS.GENERAL, () =>
      isHovered || isActive ? 'idle' : 'breathing'
    )
    .with(CARD_KINDS.SPELL, CARD_KINDS.ARTIFACT, () =>
      isHovered || isActive ? 'active' : 'default'
    )
    .exhaustive()
);
const animation = computed(() =>
  sheet.value ? sheet.value.animations[animationName.value] : null
);

const frame = ref(0);

const frameDuration = computed(() => {
  if (!sheet.value) return 100;
  return isHalfSpeed(sheet.value, animationName.value) ? 160 : 80;
});

useIntervalFn(() => {
  if (!animation.value) return;
  frame.value = (frame.value + 1) % (animation.value.length - 1);
}, frameDuration);

watch([() => isHovered, () => isActive], () => {
  frame.value = 0;
});

const style = computed(() => {
  if (!sheet.value || !animation.value) return {};

  const bg = sheet.value.baseTexture.resource.src;
  const texture = animation.value[frame.value];
  return {
    '--width': texture.orig.width,
    '--height': texture.orig.height,
    '--bg': `url('${bg}')`,
    '--pos-x': texture.orig.x,
    '--pos-y': texture.orig.y
  };
});
</script>

<template>
  <div :style="style" />
</template>

<style scoped lang="postcss">
div {
  pointer-events: none;

  width: calc(1px * var(--width));
  height: calc(1px * var(--height));

  background: var(--bg);
  background-position: calc(-1px * var(--pos-x)) calc(-1px * var(--pos-y));

  image-rendering: pixelated;
}
</style>
