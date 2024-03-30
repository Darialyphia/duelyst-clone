<script setup lang="ts">
const { index } = defineProps<{ index: number }>();
const { ui } = useGame();

const card = useGameSelector(session => session.playerSystem.activePlayer.hand[index]);

const activePlayer = useGameSelector(session => session.playerSystem.activePlayer);
const hoveredIndex = ref<number | null>(null);
</script>

<template>
  <button
    class="card-button"
    :class="[
      card && ui.selectedCard.value === card && 'selected',
      card && card?.blueprint.kind.toLowerCase(),
      card && card.manaCost > activePlayer.currentMana && 'disabled',
      card && card.manaCost > card.blueprint.manaCost && 'cost-debuff',
      card && card.manaCost < card.blueprint.manaCost && 'cost-buff'
    ]"
    :disabled="!card"
    :data-cost="card && card.manaCost"
    @click="ui.selectCardAtIndex(index)"
    @mouseenter="hoveredIndex = index"
    @mouseleave="hoveredIndex = null"
  >
    <AnimatedCardIcon
      v-if="card"
      :sprite-id="card.blueprint.spriteId"
      :kind="card.blueprint.kind"
      :is-active="ui.selectedCardIndex.value === index"
      :is-hovered="hoveredIndex === index"
      class="icon"
    />
  </button>
</template>

<style scoped lang="postcss">
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

  &:disabled,
  &.disabled {
    filter: grayscale(1);
  }

  &[data-cost] {
    &::before {
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
    &.cost-buff::before {
      background: linear-gradient(to bottom, var(--green-7), var(--green-9));
    }
    &.cost-debuff::before {
      background: linear-gradient(to bottom, var(--red-9), var(--red-11));
    }
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
  }

  &.card-button.selected > .icon,
  &:hover > .icon {
    filter: drop-shadow(0 0 1px cyan) brightness(130%) contrast(115%);
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
</style>
