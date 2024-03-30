<script setup lang="ts">
const { dispatch, ui } = useGame();

const hand = useGameSelector(session => session.playerSystem.activePlayer.hand);

const activePlayer = useGameSelector(session => session.playerSystem.activePlayer);
</script>

<template>
  <div class="action-bar">
    <UiFancyButton
      :style="{ '--hue': '230DEG', '--hue2': '210DEG' }"
      :disabled="!activePlayer.canReplace() || !isDefined(ui.selectedCardIndex.value)"
      @click="
        () => {
          dispatch('replaceCard', {
            cardIndex: ui.selectedCardIndex.value!
          });
          ui.unselectCard();
        }
      "
    >
      Replace
    </UiFancyButton>
    <div class="flex gap-9 iems-center">
      <ActionBarItem
        v-for="(card, index) in hand"
        :key="`${card?.blueprintId}:${index}`"
        :index="index"
      />
    </div>
    <UiFancyButton
      :style="{ '--hue': '10DEG', '--hue2': '20DEG', 'min-width': '13ch' }"
      @click="
        () => {
          dispatch('endTurn');
          ui.unselectCard();
          ui.unselectEntity();
        }
      "
    >
      End turn
    </UiFancyButton>
  </div>
</template>

<style scoped lang="postcss">
.action-bar {
  position: absolute;
  bottom: var(--size-5);
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  gap: var(--size-9);
  align-items: center;
}

button:not(.card-button) {
  aspect-ratio: 1;
  border-radius: var(--radius-round);
}
</style>
