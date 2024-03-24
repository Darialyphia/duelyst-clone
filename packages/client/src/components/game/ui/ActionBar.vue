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
        }
      "
    >
      Replace
    </UiFancyButton>
    <button
      v-for="(card, index) in hand"
      :key="`${card?.blueprintId}:${index}`"
      class="card-button"
      :class="[
        card && ui.selectedCard.value === card && 'selected',
        card && card?.blueprint.kind.toLowerCase()
      ]"
      :disabled="!card || card.manaCost > activePlayer.currentMana"
      :data-cost="card && card.manaCost"
      @click="ui.selectCardAtIndex(index)"
    >
      <AnimatedCardIcon
        v-if="card"
        :sprite-id="card.blueprint.spriteId"
        :kind="card.blueprint.kind"
        :is-active="ui.selectedCardIndex.value === index"
        class="icon"
      />
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
  border: none;

  transition: transform 0.2s;

  &::after {
    content: '';

    position: absolute;
    inset: 0;
    transform: translateY(20%) scaleY(0.35) rotateZ(45deg);

    opacity: 0.8s;
    background: radial-gradient(circle at center, black 20%, transparent 80%);
    border: solid var(--border-size-3) var(--gray-5);
  }

  &:disabled {
    filter: grayscale(1);
  }

  &[data-cost]::before {
    content: attr(data-cost);

    position: absolute;
    z-index: 2;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);

    display: grid;
    place-content: center;

    aspect-ratio: 1;
    width: 4ch;
    padding: var(--size-2);

    line-height: 1;

    background: linear-gradient(to bottom, var(--red-7), var(--red-11));
    border: solid var(--border-size-1) currentColor;
    border-radius: var(--radius-1);
    box-shadow: 0 3px 5px 1px hsl(0 0 0 / 0.3);
  }

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
      filter: drop-shadow(0 0 3px yellow);
    }
  }

  &.spell > .icon {
    bottom: 10px;
    left: 26px;
    filter: drop-shadow(0 0 1px black);
  }
  &.selected > .icon {
    transform: scale(2) translateY(-15px);
  }
}
</style>
