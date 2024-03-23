<script setup lang="ts">
import { OutlineFilter } from '@pixi/filter-outline';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';
import type { EntityId } from '@game/sdk';
import { AnimatedSprite, Container, type Filter, type FrameObject } from 'pixi.js';
import { TextStyle } from 'pixi.js';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { camera, assets, ui, fx } = useGame();

const entity = useGameSelector(session => session.entitySystem.getEntityById(entityId)!);
const textures = ref<FrameObject[]>([]);

const animationName = computed(
  () => fx.entityAnimationsMap.value.get(entityId) ?? 'breathing'
);
const setTextures = () => {
  if (!entity.value) return;
  const sheet = assets.getSpritesheet(entity.value.card.blueprint.spriteId);
  textures.value = createSpritesheetFrameObject(animationName.value, sheet);
  console.log(`[${entityId}] textures updated for ${animationName.value}`);
};
setTextures();

const sprite = ref<AnimatedSprite>();

watch(animationName, (newAnimation, oldAnimation) => {
  const updateAnimation = () => {
    setTextures();
    nextTick(() => {
      if (!sprite.value) return;
      sprite.value.gotoAndPlay(0);
      console.log(`[${entityId}] start playing animation ${newAnimation}`);
      setTimeout(() => {
        console.log(`[${entityId}] is playing : ${sprite.value?.playing}`);
      });
    });
  };

  const updateAnimationDelayed = () => {
    if (!sprite.value) return;
    sprite.value.onLoop = sprite.value.onComplete = () => {
      sprite.value!.onLoop = undefined;
      sprite.value!.onComplete = undefined;
      updateAnimation();
    };
  };
  console.log(`[${entityId}] update animation from ${oldAnimation} to ${newAnimation}`);
  if (newAnimation === 'breathing' && oldAnimation === 'idle') {
    updateAnimationDelayed();
  } else {
    updateAnimation();
  }
});

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

  return result;
});

const scaleX = computed(() => {
  let value = entity.value.player.isPlayer1 ? 1 : -1;
  if (camera.angle.value === 90 || camera.angle.value === 180) {
    value *= -1;
  }

  return value;
});

const boardDimensions = useGameSelector(session => ({
  width: session.boardSystem.width,
  height: session.boardSystem.height
}));

const attackStyle = new TextStyle({
  fontSize: 30,
  align: 'center',
  fill:
    entity.value.attack < entity.value.card.blueprint.attack
      ? 'red'
      : entity.value.attack > entity.value.card.blueprint.attack
        ? 0x12c943
        : 'white'
});

const hpStyle = new TextStyle({
  fontSize: 30,
  align: 'center',
  fill:
    entity.value.hp < entity.value.card.blueprint.maxHp
      ? 'red'
      : entity.value.hp > entity.value.card.blueprint.maxHp
        ? 0x12c943
        : 'white'
});

watchEffect(() => {
  attackStyle.fill =
    entity.value.attack < entity.value.card.blueprint.attack
      ? 'red'
      : entity.value.attack > entity.value.card.blueprint.attack
        ? 0x12c943
        : 'white';
  hpStyle.fill =
    entity.value.hp < entity.value.card.blueprint.maxHp
      ? 'red'
      : entity.value.hp > entity.value.card.blueprint.maxHp
        ? 0x12c943
        : 'white';
});
</script>

<template>
  <IsoPositioner
    v-if="entity"
    :animated="!fx.isPlaying.value"
    v-bind="fx.entityPositionsMap.value.get(entityId)!"
    :z-index-offset="3"
    :angle="camera.angle.value"
    :height="boardDimensions.height"
    :width="boardDimensions.width"
    :offset="{
      x: 0,
      y: -CELL_HEIGHT * 0.7
    }"
    event-mode="none"
  >
    <container
      :ref="
        (container: any) => {
          if (container?.parent) {
            fx.registerEntityRootContainer(entity.id, container.parent);
          }
        }
      "
    >
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
        :anchor="0.5"
        :scale-x="scaleX"
        :playing="true"
      />

      <container :y="CELL_HEIGHT * 0.7">
        <graphics
          @render="
            g => {
              g.clear();
              g.beginFill('black');
              g.lineStyle({ color: 'yellow', width: 1 });
              g.drawCircle(-CELL_WIDTH * 0.25, 0, 7);
            }
          "
        >
          <pixi-text
            :style="attackStyle"
            :scale="0.25"
            :x="-CELL_WIDTH * 0.4 + 14"
            :anchor="0.5"
          >
            {{ entity.attack }}
          </pixi-text>
        </graphics>

        <graphics
          @render="
            g => {
              g.clear();
              g.beginFill('black');
              g.lineStyle({ color: 'red', width: 1 });
              g.drawCircle(22, 0, 7);
            }
          "
        >
          <pixi-text :style="hpStyle" :scale="0.25" :x="22" :anchor="0.5">
            {{ entity.hp }}
          </pixi-text>
        </graphics>
      </container>
    </container>
  </IsoPositioner>
</template>
