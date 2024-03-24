<script setup lang="ts">
const { dispatch, ui } = useGame();

const hand = useGameSelector(session => session.playerSystem.activePlayer.hand);

const activePlayer = useGameSelector(session => session.playerSystem.activePlayer);
</script>

<template>
  <div class="action-bar">
    <UiFancyButton
      :style="{ '--hue': '230DEG', '--hue2': '210DEG' }"
      :disabled="!activePlayer.canReplace() || !ui.selectedCardIndex.value"
      @click="
        () => {
          dispatch('replaceCard', {
            cardIndex: ui.selectedCardIndex.value!
          });
        }
      "
    >
      Replace
    </UiFancyButton>
    <button
      v-for="(card, index) in hand"
      :key="`${card?.blueprintId}:${index}`"
      class="card-button"
      :class="card && ui.selectedCard.value === card && 'selected'"
      @click="ui.selectCardAtIndex(index)"
    >
      <AnimatedCardIcon v-if="card" :sprite-id="card.blueprint.spriteId" class="icon" />
    </button>
    <UiFancyButton
      :style="{ '--hue': '10DEG', '--hue2': '20DEG', 'min-width': '13ch' }"
      @click="dispatch('endTurn')"
    >
      End turn
    </UiFancyButton>
  </div>
</template>

<style scoped lang="postcss">
.action-bar {
  position: absolute;
  bottom: var(--size-3);
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  gap: var(--size-9);
  align-items: center;
}

.card-button {
  position: relative;

  box-sizing: content-box;
  aspect-ratio: 1;
  width: 100px;
  padding: 0;

  background: transparent;
  /* background: var(--bg); */
  background-size: cover;

  transition: transform 0.2s;

  > .icon {
    position: absolute;
    z-index: 1;
    bottom: 0;
    left: 0;
    transform-origin: bottom center;
    transform: scale(2);

    transition:
      transform 0.3s ease-out,
      filter 0.3s;
    &:hover,
    .card-button.selected > & {
      filter: drop-shadow(0 0 3px cyan);
    }
  }

  &.selected > .icon {
    transform: scale(2) translateY(-20px);
  }
}
</style>
