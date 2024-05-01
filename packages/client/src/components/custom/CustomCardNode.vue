<script setup lang="ts">
import type { AnyCardNode } from '@game/sdk';
import type { NodeConfig } from '@game/sdk/src/custom/custom-card-nodes';
import { isDefined } from '@game/shared';

const { node } = defineProps<{ node: AnyCardNode }>();
const config = defineModel<NodeConfig[]>('config', { required: true });

// node.inputs.forEach((input, inputIndex) => {
//   if (input.type === 'node') {
//     config.value[inputIndex].next = Array.from(
//       { length: input.choices[inputIndex].inputs.length },
//       () => ({
//         value: '0',
//         next: []
//       })
//     );
//   }
// });
</script>

<template>
  <div v-if="node" style="margin-block-end: 1rem; padding-left: 1rem">
    <div v-for="(input, inputIndex) in node.inputs" :key="input.label">
      <Label>{{ input.label }}</Label>

      <div v-if="input.type === 'node'">
        <UiCombobox
          :model-value="config[inputIndex].value"
          :options="
            input.choices.map((choice, choiceIndex) => ({
              label: choice.label,
              value: String(choiceIndex)
            }))
          "
          :display-value="val => input.choices[Number(val)].label"
          @update:model-value="
            (newValue: any) => {
              config[inputIndex].value = newValue;
              if (!isDefined(newValue)) return;
              // @ts-expect-error
              config[inputIndex].next = Array.from(
                { length: input.choices[newValue].inputs.length },
                () => ({
                  value: undefined,
                  next: []
                })
              );
            }
          "
        />
        <CustomCardNode
          v-if="isDefined(config[inputIndex]?.next)"
          :node="input.choices[Number(config[inputIndex]?.value)]"
          :config="config[inputIndex].next"
        />
      </div>

      <div v-else-if="input.type === 'choices'">
        <UiCombobox
          :model-value="config[inputIndex].value"
          :options="
            input.choices.map((choice, choiceIndex) => ({
              label: choice.label,
              value: String(choiceIndex)
            }))
          "
          :display-value="val => input.choices[Number(val)].label"
          @update:model-value="
            (newValue: any) => {
              config[inputIndex].value = newValue;
            }
          "
        />
      </div>

      <div v-else-if="input.type === 'number'">
        <UiTextInput id="foo" v-model="config[inputIndex].value" type="number" step="1" />
      </div>
    </div>
  </div>
</template>
