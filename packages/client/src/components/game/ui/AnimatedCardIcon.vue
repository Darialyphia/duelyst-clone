<script setup lang="ts">
import { CARD_KINDS, type CardKind } from '@game/sdk';
import { match } from 'ts-pattern';
const { spriteId, kind } = defineProps<{ spriteId: string; kind: CardKind }>();
const { assets } = useGame();

const sheet = assets.getSpritesheet(spriteId);
const el = ref<HTMLElement>();
const isHovered = useElementHover(el);
const animation = computed(() =>
  match(kind)
    .with(CARD_KINDS.MINION, CARD_KINDS.GENERAL, () =>
      isHovered.value ? sheet.animations.idle : sheet.animations.breathing
    )
    .with(CARD_KINDS.SPELL, CARD_KINDS.ARTIFACT, () =>
      isHovered.value ? sheet.animations.active : sheet.animations.default
    )
    .exhaustive()
);
const frame = ref(0);
const frameDuration = HALF_SPEED_SPRITES.includes(sheet.data.meta.image!) ? 160 : 80;
console.log(sheet.data.meta.image, frameDuration);
useIntervalFn(() => {
  frame.value = (frame.value + 1) % (animation.value.length - 1);
}, frameDuration);

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
  pointer-events: none;

  width: calc(1px * var(--width));
  height: calc(1px * var(--height));

  background: var(--bg);
  background-position: calc(-1px * var(--pos-x)) calc(-1px * var(--pos-y));

  image-rendering: pixelated;
}
</style>
