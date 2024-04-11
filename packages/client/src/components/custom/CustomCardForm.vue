<script setup lang="ts">
import { rootNode, type CustomCardBlueprint } from '@game/sdk';

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

const form = reactive<Omit<CustomCardBlueprint, 'description'>>({
  spriteId: null as any,
  manaCost: 2,
  name: 'My Cool Card',
  attack: 2,
  maxHp: 3,
  nodes: []
});

const description = computed(() => {
  try {
    const res = form.nodes.map(node => rootNode.getDescription([node[0]], rootNode));

    return res.join('\n');
  } catch (err) {
    return '';
  }
});
</script>

<template>
  <p v-if="!assets.loaded">Loading card data...</p>
  <div v-else class="fancy-surface custom-card-form">
    <form>
      <Label>Sprite</Label>
      <UiCombobox v-model="form.spriteId" :options="spriteOptions" />

      <Label>
        Name
        <UiTextInput id="card-name" v-model="form.name" />
      </Label>

      <Label>
        Mana Cost
        <UiTextInput
          id="card-cost"
          v-model.number="form.manaCost"
          step="1"
          type="number"
        />
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
        <UiTextInput id="card-hp" v-model.number="form.maxHp" step="1" type="number" />
      </Label>

      <Label>Effects</Label>
      <ul>
        <li v-for="(node, index) in form.nodes" :key="index">
          <CustomCardNode v-model:config="form.nodes[index]" :node="rootNode" />
        </li>
      </ul>
      <UiButton
        class="primary-button"
        type="button"
        @click="form.nodes.push([{ value: undefined as any, next: [] }])"
      >
        Add new effect
      </UiButton>
    </form>
    <div class="sticky top-0" style="height: 75dvh">
      <UiCenter v-if="form.spriteId">
        <Card
          :card="{
            cost: form.manaCost,
            name: form.name,
            description: description,
            kind: 'MINION',
            spriteId: form.spriteId,
            rarity: 'legendary',
            attack: form.attack,
            hp: form.maxHp
          }"
        />
      </UiCenter>
      <UiCenter v-else>Select a sprite to see a preview of your card</UiCenter>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.custom-card-form {
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--size-8);

  height: 75dvh;
}
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
