<script setup lang="ts">
import type { EntityId } from '@game/sdk';
import { TextStyle } from 'pixi.js';

const { ui } = useGame();
const { entityId } = defineProps<{ entityId: EntityId }>();

const entity = useGameSelector(session => session.entitySystem.getEntityById(entityId)!);

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
  <container
    :ref="(container: any) => ui.assignLayer(container, 'ui')"
    :y="CELL_HEIGHT * 0.7"
    :x="0"
    event-mode="none"
  >
    <graphics
      @render="
        g => {
          g.clear();
          g.beginFill('black');
          g.lineStyle({ color: 'yellow', width: 1 });
          g.drawCircle(-CELL_WIDTH * 0.2, 0, 7);
        }
      "
    >
      <pixi-text
        :style="attackStyle"
        :scale="0.25"
        :x="-CELL_WIDTH * 0.35 + 14"
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
          g.drawCircle(17, 0, 7);
        }
      "
    >
      <pixi-text :style="hpStyle" :scale="0.25" :x="17" :anchor="0.5">
        {{ entity.hp }}
      </pixi-text>
    </graphics>
  </container>
</template>
