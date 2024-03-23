<script setup lang="ts">
import type { EntityId } from '@game/sdk';

const { entityId } = defineProps<{ entityId: EntityId }>();

const entity = useGameSelector(session => session.entitySystem.getEntityById(entityId));
</script>

<template>
  <ul v-if="entity">
    <li v-for="modifier in entity.modifiers" :key="modifier.id">
      <UiTooltip :side-offset="20" :delay="200" side="right">
        <template #trigger>
          <img :src="`/assets/modifiers/${modifier.iconId}.png`" />
        </template>

        <ModifierCard :modifier="modifier" />
      </UiTooltip>
    </li>
  </ul>
</template>

<style scoped lang="postcss">
ul {
  > li + li {
    margin-block-start: var(--size-1);
  }
}
</style>
