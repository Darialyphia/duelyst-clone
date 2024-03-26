<script setup lang="ts">
import { OutlineFilter } from '@pixi/filter-outline';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';
import type { EntityId } from '@game/sdk';
import { AnimatedSprite, type Filter } from 'pixi.js';
import { AdjustmentFilter } from '@pixi/filter-adjustment';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { ui, fx } = useGame();
const entity = useGameSelector(session => session.entitySystem.getEntityById(entityId)!);
const sprite = ref<AnimatedSprite>();
const textures = useEntityTexture(entityId, sprite);

const isSelected = computed(() => ui.selectedEntity.value?.equals(entity.value));
watchEffect(() => {
  fx.entityAnimationsMap.value.set(entityId, isSelected.value ? 'idle' : 'breathing');
});

const hoveredFilters = [
  new AdvancedBloomFilter({
    blur: 0,
    bloomScale: 0.9,
    threshold: 0.75
  }),
  new OutlineFilter(2, 0xffffff, 0.2, 0)
] as const;
const exhaustedFilter = new AdjustmentFilter({ saturation: 0 });

const isHovered = computed(() => ui.hoveredEntity.value?.equals(entity.value));

watchEffect(() => {
  gsap.to(hoveredFilters[0], {
    duration: 0.2,
    blur: isHovered.value ? 4 : 0,
    ease: Power2.easeOut
  });
  gsap.to(hoveredFilters[1], {
    duration: 0.2,
    alpha: isHovered.value ? 1 : 0,
    ease: Power2.easeOut
  });
});

const filters = computed(() => {
  const result: Filter[] = [];
  if (isHovered.value) {
    result.push(...hoveredFilters);
  }
  if (entity.value.hasKeyword('Exhausted')) {
    result.push(exhaustedFilter);
  }

  return result;
});
</script>

<template>
  <animated-sprite
    :ref="
      (el: any) => {
        if (entity) {
          fx.registerSprite(entity.id, el);
        }
        sprite = el;
      }
    "
    :textures="textures"
    :filters="filters"
    :anchor-x="0.5"
    :anchor-y="1"
    :y="CELL_HEIGHT * 0.9"
    :playing="true"
  />
</template>
