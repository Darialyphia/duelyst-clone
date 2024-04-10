import type { CustomCardNode } from './custom-card-nodes';

export type CustomCardInput =
  | {
      type: 'choices';
      label: string;
      choices?: Array<{ label: string }>;
    }
  | { type: 'number'; label: string; allowNegative: boolean }
  | { type: 'node'; choices: CustomCardNode[] };

export const attackModifierInput: CustomCardInput = {
  type: 'number',
  label: 'Attack',
  allowNegative: true
};

export const hpModifierInput: CustomCardInput = {
  type: 'number',
  label: 'Health',
  allowNegative: true
};

export const amountInput: CustomCardInput = {
  type: 'number',
  label: 'string',
  allowNegative: false
};

export const targetInput: CustomCardInput = {
  type: 'choices',
  label: 'Target',
  choices: [
    {
      label: 'An enemy unit'
    },
    {
      label: 'An ally unit'
    },
    {
      label: 'An enemy minion'
    },
    {
      label: 'An ally minion'
    },

    {
      label: 'The enemy general'
    },
    {
      label: 'Your general'
    },

    {
      label: 'A nearby enemy unit'
    },
    {
      label: 'A nearby enemy minion'
    },
    {
      label: 'A nearby ally unit'
    },
    {
      label: 'A nearby ally minion'
    },

    {
      label: 'All enemy units'
    },
    {
      label: 'All enemy minions'
    },
    {
      label: 'All ally units'
    },
    {
      label: 'All ally minions'
    },

    {
      label: 'All nearby enemy units'
    },
    {
      label: 'All nearby enemy minions'
    },
    {
      label: 'All nearby ally units'
    },
    {
      label: 'All nearby ally minions'
    },

    { label: 'All units' }
  ]
};
