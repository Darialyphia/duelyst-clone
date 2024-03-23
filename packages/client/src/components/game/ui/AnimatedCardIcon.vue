<script setup lang="ts">
const { spriteId } = defineProps<{ spriteId: string }>();
const { assets } = useGame();

const sheet = assets.getSpritesheet(spriteId);
const el = ref<HTMLElement>();
const isHovered = useElementHover(el);

const animation = computed(() =>
  isHovered.value ? sheet.animations.idle : sheet.animations.breathing
);
const frame = ref(0);
useIntervalFn(() => {
  frame.value = (frame.value + 1) % (animation.value.length - 1);
}, 80);

watch(isHovered, () => {
  frame.value = 0;
});

const style = computed(() => {
  const bg = sheet.baseTexture.resource.src;
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
  <div ref="el" :style="style" />
</template>

<style scoped lang="postcss">
div {
  width: calc(1px * var(--width));
  height: calc(1px * var(--height));

  background: var(--bg);
  background-position: calc(-1px * var(--pos-x)) calc(-1px * var(--pos-y));

  image-rendering: pixelated;
}
</style>
