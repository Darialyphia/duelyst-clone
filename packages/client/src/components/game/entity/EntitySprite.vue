<script setup lang="ts">
import { OutlineFilter } from '@pixi/filter-outline';
import { KEYWORDS, type EntityId } from '@game/sdk';
import { AnimatedSprite, type Filter } from 'pixi.js';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import IlluminatedSprite from '../IlluminatedSprite.vue';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { ui, fx } = useGame();
const entity = useGameSelector(session => session.entitySystem.getEntityById(entityId)!);
const sprite = ref<AnimatedSprite>();
const { diffuseTextures, normalTextures } = useEntityTexture(entityId, sprite);

const isSelected = computed(() => ui.selectedEntity.value?.equals(entity.value));
const isHovered = computed(() => ui.hoveredEntity.value?.equals(entity.value));

watchEffect(() => {
  fx.entityAnimationsMap.value.set(entityId, isSelected.value ? 'idle' : 'breathing');
});

const exhaustedFilter = new AdjustmentFilter({ saturation: 0 });
const outlineFilter = new OutlineFilter(1, 0xffffff, 0.2, 0);

watchEffect(() => {
  // gsap.to(bloomFilter, {
  //   duration: 0.2,
  //   blur: isSelected.value ? 4 : 0,
  //   ease: Power2.easeOut
  // });
  gsap.to(outlineFilter, {
    duration: 0.3,
    alpha: isSelected.value || isHovered.value ? 1 : 0,
    ease: Power2.easeOut
  });
});

const filters = computed(() => {
  const result: Filter[] = [outlineFilter];

  if (entity.value.hasKeyword(KEYWORDS.EXHAUSTED)) {
    result.push(exhaustedFilter);
  }
  return result;
});

watch(sprite, newSprite => {
  fx.registerSprite(entityId, newSprite);
});

const MIN_LIGHTNESS = 0.1;
const MAX_LIGHTNESS = 0.6;
const lightBrightness = ref(MIN_LIGHTNESS);
watchEffect(() => {
  gsap.to(lightBrightness, {
    duration: 0.3,
    value: isSelected.value || isHovered.value ? MAX_LIGHTNESS : MIN_LIGHTNESS,
    ease: Power2.easeOut
  });
});
</script>

<template>
  <container
    :ref="
      (el: any) => {
        const spriteInst = el?.children?.find(
          (child: any) => child instanceof AnimatedSprite
        );

        if (spriteInst) {
          sprite = spriteInst;
        }
      }
    "
  >
    <PointLight :color="0xff5500" :brightness="lightBrightness" :x="0" :y="50" />

    <IlluminatedSprite
      v-if="diffuseTextures && normalTextures"
      :diffuse-textures="diffuseTextures"
      :normal-textures="normalTextures"
      :anchor-x="0.5"
      :anchor-y="1"
      :y="CELL_HEIGHT * 0.9"
      :playing="true"
      :filters="filters"
    />
  </container>
</template>
