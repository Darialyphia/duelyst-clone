<script setup lang="ts">
import { uniqBy } from 'lodash-es';

const { pending, data } = await useFetch<any>(
  'https://api.duelyst2.com/legacy-cards.json'
);

const spriteOptions = computed(() => {
  if (!data.value) return null;
  const options: { value: string; label: string }[] = data.value.map((el: any) => ({
    value: el.resource.breathing,
    label: el.name
  }));

  return uniqBy(options, 'value');
});

const form = reactive({
  spriteId: ''
});
</script>

<template>
  <form class="fancy-surface">
    <UiCombobox v-if="spriteOptions" v-model="form.spriteId" :options="spriteOptions" />
  </form>
</template>

<style scoped lang="postcss">
.form {
  transform: scale(1);
}
</style>
