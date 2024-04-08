<script setup lang="ts">
import { type CardKind, CARD_KINDS } from '@game/sdk';

type ICard = {
  kind: CardKind;
  name: string;
  description: string;
  spriteId: string;
  rarity: string;
  attack?: number;
  hp?: number;
  cost: number;
};
const { card } = defineProps<{ card: ICard }>();

const rarityIcon = computed(
  () => `url('/assets/ui/collection_card_rarity_${card.rarity}.png')`
);
</script>

<template>
  <div class="card" :class="card.kind.toLowerCase()">
    <div class="cost">{{ card.cost }}</div>
    <div class="sprite">
      <AnimatedCardIcon
        :sprite-id="card.spriteId"
        :kind="card.kind"
        :is-active="false"
        :is-hovered="false"
      />
    </div>

    <div class="caption">
      <div class="name">{{ card.name }}</div>
      <p>{{ card.kind.toLowerCase() }}</p>
      <div class="rarity"></div>
    </div>
    <template v-if="card.kind === CARD_KINDS.GENERAL || card.kind === CARD_KINDS.MINION">
      <div class="stat atk">{{ card.attack }}</div>
      <div class="stat hp">{{ card.hp }}</div>
    </template>

    <p class="description">{{ card.description }}</p>
  </div>
</template>

<style scoped lang="postcss">
.card {
  width: 226px;
  height: 297px;
  padding: 0.8rem 0.6rem;
  border-radius: var(--radius-2);

  &:is(.general, .minion) {
    background-image: url('/assets/ui/card_bg_unit.png');
  }
  &.spell {
    background-image: url('/assets/ui/card_bg_spell.png');
  }
  &.artifact {
    background-image: url('/assets/ui/card_bg_artifact.png');
  }
}

.cost {
  position: absolute;
  top: -1.2rem;
  left: -1.5rem;

  display: grid;
  place-content: center;

  aspect-ratio: 1;
  width: 60px;

  font-size: var(--font-size-4);
  color: black;

  background: url('/assets/ui/icon_mana.png');
}
.sprite {
  position: relative;
  aspect-ratio: 1;
  width: 100px;
  margin: 0 auto 0;
  :is(.spell, .artifact) & {
    transform: translateY(-20px);
  }

  & > * {
    pointer-events: none;

    position: absolute;
    z-index: 1;
    bottom: -2rem;
    left: 50%;
    transform-origin: bottom center;
    transform: translateX(-50%) scale(2);
  }
}

.caption {
  text-align: center;
  text-transform: uppercase;

  .name {
    margin-top: var(--size-2);
    font-size: 1rem;
    line-height: 1;
  }

  > p {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .rarity {
    aspect-ratio: 1;
    width: 3rem;
    margin-inline: auto;
    background: v-bind(rarityIcon);
  }
}

.stat {
  position: absolute;
  top: 160px;

  display: grid;

  width: 2ch;

  font-size: var(--font-size-4);
  text-align: center;

  &.atk {
    left: calc(46px - 0.5ch);
  }

  &.hp {
    left: calc(166px - 0.5ch);
  }
}

.description {
  display: grid;
  place-content: center;

  height: 60px;

  font-size: var(--font-size-00);
  font-weight: 300;
  line-height: 1.2;
  color: #bbf7f7;
  text-align: center;
}
</style>
