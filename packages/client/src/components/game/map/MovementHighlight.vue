<script setup lang="ts">
import type { Cell } from '@game/sdk';
import { match } from 'ts-pattern';

const { cell } = defineProps<{ cell: Cell }>();
const { session, assets, camera, ui, pathfinding, fx } = useGame();
const activePlayer = useGameSelector(session => session.playerSystem.activePlayer);
const phase = useGameSelector(session => session.phase);

const sheet = computed(() => assets.getSpritesheet('bitmask-movement-ally'));

const isMatch = (cellToTest: Cell) => {
  if (phase.value !== 'battle') return false;

  return match(ui.targetingMode.value)
    .with(TARGETING_MODES.FOLLOWUP, TARGETING_MODES.SUMMON, () => false)
    .with(TARGETING_MODES.BASIC, () => {
      return pathfinding.canMoveTo(ui.selectedEntity.value!, cellToTest);
    })
    .with(TARGETING_MODES.NONE, () => {
      if (!ui.hoveredEntity.value) return false;
      if (!ui.hoveredEntity.value.player.equals(activePlayer.value)) return false;

      return pathfinding.canMoveTo(ui.hoveredEntity.value, cellToTest);
    })
    .exhaustive();
};

const isEnabled = computed(() => !fx.isPlaying.value && isMatch(cell));

const bitmask = computed(() => {
  return getBitMask(session, cell, camera.angle.value, neighbor => {
    if (!neighbor) return false;

    return isMatch(neighbor);
  });
});
</script>

<template>
  <BitmaskCell :bitmask="bitmask" :is-enabled="isEnabled" :sheet="sheet" />
</template>
