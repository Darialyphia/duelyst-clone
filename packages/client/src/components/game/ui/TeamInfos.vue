<script setup lang="ts">
const players = useGameSelector(session => session.playerSystem.getList());
</script>

<template>
  <div class="absolute top-3 left-3" :class="players[0].isActive && 'active'">
    <div class="text-4">
      {{ players[0].general.card.blueprint.name }}
    </div>
    <div>Active: {{ players[0].isActive }}</div>
    <div class="flex gap-3">
      <div
        v-for="i in players[0].maxMana"
        :key="i"
        class="mana"
        :class="players[0].currentMana < i && 'empty'"
      />
    </div>
  </div>

  <div class="absolute top-3 right-3" :class="players[1].isActive && 'active'">
    <div class="text-4">
      {{ players[1].general.card.blueprint.name }}
    </div>
    <div>Active: {{ players[1].isActive }}</div>
    <div class="flex gap-3 flex-row-reverse">
      <div
        v-for="i in players[1].maxMana"
        :key="i"
        class="mana"
        :class="players[1].currentMana < i && 'empty'"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.active {
  color: var(--yellow-6);
  text-decoration: underline;
}

.mana {
  aspect-ratio: 1;
  width: 27px;
  background: url('/assets/ui/mana-crystal.png');

  &.empty {
    background: url('/assets/ui/mana-crystal-empty.png');
  }
}
</style>
