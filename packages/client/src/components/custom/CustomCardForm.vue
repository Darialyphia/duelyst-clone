<script setup lang="ts">
const plists = import.meta.glob('@/assets/units{m}/*.plist', {
  eager: true,
  query: '?url',
  import: 'default'
});

const assets = useAssetsProvider();
assets.load();

const spriteOptions = computed(() => {
  return Object.keys(plists)
    .map(k => k.replace('/assets/units{m}/', '').split('.')[0])
    .filter(k => !k.startsWith('boss'))
    .map(k => ({ label: k, value: k }));
});

const form = reactive({
  spriteId: null as any,
  cost: 2,
  name: 'My Cool Card',
  description: 'My Cool description',
  attack: 2,
  hp: 3
});
</script>

<template>
  <p v-if="!assets.loaded">Loading card data...</p>
  <div v-else class="fancy-surface grid grid-cols-2 gap-8">
    <form>
      <Label>Sprite</Label>
      <UiCombobox v-model="form.spriteId" :options="spriteOptions" />

      <Label>
        Name
        <UiTextInput id="card-name" v-model="form.name" />
      </Label>

      <Label>
        Description
        <UiTextInput id="card-description" v-model="form.description" />
      </Label>

      <Label>
        Mana Cost
        <UiTextInput id="card-cost" v-model.number="form.cost" step="1" type="number" />
      </Label>

      <Label>
        Attack
        <UiTextInput
          id="card-attack"
          v-model.number="form.attack"
          step="1"
          type="number"
        />
      </Label>

      <Label>
        Health
        <UiTextInput id="card-hp" v-model.number="form.hp" step="1" type="number" />
      </Label>
    </form>
    <div>
      <UiCenter v-if="form.spriteId">
        <Card
          :card="{
            cost: form.cost,
            name: form.name,
            description: form.description,
            kind: 'MINION',
            spriteId: form.spriteId,
            rarity: 'legendary',
            attack: form.attack,
            hp: form.hp
          }"
        />
      </UiCenter>
      <UiCenter v-else>Select a sprite to see a preview of your card</UiCenter>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.form {
  transform: scale(1);
}

.sprite {
  image-rendering: pixelated;
}

:global(.ui-combobox-root) {
  position: relative;
}

.anchor {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  justify-content: between;

  height: 35px;
  padding: var(--size-1);

  line-height: 1;

  background-color: var(--surface-2);
  border: solid var(--border-size-2) var(--primary);
  border-radius: var(--radius-1);

  &:hover {
    background-color: var(--surface-3);
  }

  &:focus-within {
    background-color: var(--surface-3);
    outline: solid var(--border-size-2) var(--primary);
    outline-offset: 5px;
  }

  & > input {
    background-color: transparent;

    &:focus {
      outline: none;
    }
  }
}

.content {
  position: absolute;
  z-index: 10;

  width: 100%;
  max-height: 300px;
  margin-top: 8px;
  padding-block: var(--size-2);

  background-color: var(--surface-2);
  border-radius: 6px;
  box-shadow:
    0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
}

.item {
  position: relative;
  display: flex;
  align-items: center;
  padding: var(--size-1) var(--size-3);
  &[data-disabled] {
    pointer-events: none;
    opacity: 0.5;
  }
  &[data-highlighted] {
    color: var(--text-on-primary);
    background-color: var(--primary);
    outline: none;
  }
  &[data-state='checked'] {
    color: var(--text-on-primary);
    background-color: var(--primary-dark);
    outline: none;
  }
}
</style>
