<script setup lang="ts">
import { Unit } from '@game/sdk';

const { ui, dispatch } = useGame();

const canSkip = computed(() => {
  const card = ui.selectedCard.value;
  if (!card) return false;
  if (!(card instanceof Unit)) return false;

  return (
    ui.followupTargets.value.length <=
    (card.blueprint.summonedFollowup?.minTargetCount ?? 0)
  );
});

const commit = () => {
  dispatch('playCard', {
    cardIndex: ui.selectedCardIndex.value!,
    position: ui.summonTarget.value!,
    targets: ui.followupTargets.value
  });
  ui.unselectCard();
};

watchEffect(() => {
  if (ui.targetingMode.value !== TARGETING_MODES.FOLLOWUP) return;
  const card = ui.selectedCard.value;
  if (!card) return false;
  if (!(card instanceof Unit)) return false;

  if (
    ui.followupTargets.value.length === card.blueprint.summonedFollowup!.maxTargetCount
  ) {
    commit();
  }
});
</script>

<template>
  <div v-if="ui.targetingMode.value === TARGETING_MODES.FOLLOWUP" class="followup-ui">
    <UiFancyButton
      :style="{ '--hue': '0DEG', '--hue2': '30DEG' }"
      @click="ui.unselectCard()"
    >
      Cancel
    </UiFancyButton>
    <UiFancyButton
      :style="{ '--hue': '230DEG', '--hue2': '210DEG' }"
      :disabled="!canSkip"
      @click="commit"
    >
      Skip
    </UiFancyButton>
  </div>
</template>

<style scoped lang="postcss">
.followup-ui {
  position: absolute;
  bottom: var(--size-12);
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  gap: var(--size-6);
  align-items: center;
}
</style>
