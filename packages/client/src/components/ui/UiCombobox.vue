<script setup lang="ts" generic="T extends string | number">
const { options } = defineProps<{
  options: Array<{ label: string; value: T }>;
  displayValue?: (val: T) => string;
}>();

const selected = defineModel<T>({ required: true });
</script>

<template>
  <ComboboxRoot v-model="selected" class="ui-combobox-root" :display-value="displayValue">
    <ComboboxAnchor class="anchor">
      <ComboboxInput />
      <ComboboxTrigger>
        <Icon name="mdi:chevron-down" />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxPortal>
      <ComboboxContent class="ui-comboox-content" position="popper">
        <ComboboxViewport class="viewport">
          <ComboboxItem
            v-for="(option, index) in options"
            :key="index"
            :value="option.value"
            class="item"
          >
            {{ option.label }}
          </ComboboxItem>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>

<style scoped lang="postcss">
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

:global(.ui-comboox-content) {
  z-index: 10;

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
