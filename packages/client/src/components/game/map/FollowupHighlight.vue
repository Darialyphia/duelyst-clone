<script setup lang="ts">
import { Artifact, Unit, type Cell } from '@game/sdk';
import { match } from 'ts-pattern';

const { cell } = defineProps<{ cell: Cell }>();
const { session, assets, camera, ui, fx } = useGame();
const phase = useGameSelector(session => session.phase);

const sheet = computed(() => assets.getSpritesheet('deploy-zone'));

const isMatch = (cellToTest: Cell) => {
  if (phase.value !== 'battle') return false;
  return match(ui.targetingMode.value)
    .with(
      TARGETING_MODES.BASIC,
      TARGETING_MODES.SUMMON,
      TARGETING_MODES.NONE,
      () => false
    )
    .with(TARGETING_MODES.FOLLOWUP, () => {
      if (!ui.selectedCard.value) return false;
      if (ui.selectedCard.value instanceof Artifact) return false;

      return (
        ui.selectedCard.value.blueprint.followup?.isTargetable(
          session,
          cellToTest,
          ui.summonTarget.value!,
          ui.selectedCard.value as any
        ) ?? false
      );
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
