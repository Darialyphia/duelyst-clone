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
      <button
        v-for="(card, index) in hand"
        :key="`${card?.blueprintId}:${index}`"
        class="card-button"
        :class="[
          card && ui.selectedCard.value === card && 'selected',
          card && card?.blueprint.kind.toLowerCase(),
          card && card.manaCost > activePlayer.currentMana && 'disabled'
        ]"
        :disabled="!card"
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
    border: solid var(--border-size-3) var(--gray-5);

    transition: border-color 0.5s;
  }

  &:not(:empty)::after {
    background: radial-gradient(circle at center, black 20%, transparent 80%);
  }

  /* &:is(.v-enter-active, .v-leave-active) {
    transition: all 0.7s ease;
  }

  &.v-leave-active {
    position: absolute;
  }

  &:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }

  &.v-enter-from {
    transform: translateY(-10px);
  }

  &.v-leave-to {
    transform: translateX(-10px);
  } */

  &:disabled,
  &.disabled {
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

    line-height: 1;

    background: linear-gradient(to bottom, var(--blue-7), var(--blue-9));
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
      filter: drop-shadow(0 0 3px cyan);
    }
  }

  &.spell > .icon {
    bottom: 10px;
    left: 26px;
    filter: drop-shadow(0 0 1px black);
  }
  &.selected {
    &::after {
      border-color: var(--blue-2);
    }

    > .icon {
      transform: scale(2) translateY(-15px);
    }
  }
}

button:not(.card-button) {
  aspect-ratio: 1;
  border-radius: var(--radius-round);
}
</style>
