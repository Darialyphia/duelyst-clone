import type { Point3D } from '@game/shared';
import type { CustomCardNode, inferProcessedNode } from './custom-card-nodes';
import type { GameSession } from '../game-session';
import type { Entity } from '../entity/entity';

type EnumCardInput<T> = {
  type: 'choices';
  label: string;
  choices: Array<{
    label: string;
    value: (session: GameSession, castPoint: Point3D) => T;
  }>;
};

type NumberCardInput = { type: 'number'; label: string; allowNegative: boolean };

type NodeCardInput<T extends CustomCardInput[]> = {
  type: 'node';
  choices: CustomCardNode<T>[];
};

export type CustomCardInput<T = any> = T extends CustomCardInput[]
  ? EnumCardInput<T> | NumberCardInput | NodeCardInput<T>
  : EnumCardInput<T> | NumberCardInput;

export type inferProcessedInput<T> =
  T extends CustomCardInput<infer U>
    ? T extends EnumCardInput<U>
      ? U
      : T extends NumberCardInput
        ? number
        : U extends CustomCardInput[]
          ? T extends NodeCardInput<U>
            ? inferProcessedNode<T['choices'][number]>
            : 'Unknown CustomCardInput type'
          : 'Wrong generic type for NodeCardInput'
    : 'Not a CustomCardInput';

export const attackModifierInput = {
  type: 'number',
  label: 'Attack',
  allowNegative: true
} satisfies CustomCardInput;

export const hpModifierInput: CustomCardInput = {
  type: 'number',
  label: 'Health',
  allowNegative: true
} satisfies CustomCardInput;

export const amountInput = {
  type: 'number',
  label: 'string',
  allowNegative: false
} satisfies CustomCardInput;

export const targetInput = {
  type: 'choices',
  label: 'Target',
  choices: [
    {
      label: 'An enemy unit',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'An ally unit',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'An enemy minion',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'An ally minion',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },

    {
      label: 'The enemy general',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'Your general',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },

    {
      label: 'A nearby enemy unit',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'A nearby enemy minion',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'A nearby ally unit',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'A nearby ally minion',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },

    {
      label: 'All enemy units',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'All enemy minions',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'All ally units',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'All ally minions',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },

    {
      label: 'All nearby enemy units',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'All nearby enemy minions',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'All nearby ally units',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'All nearby ally minions',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },

    {
      label: 'All units',
      value(session, castPoint) {
        return [] as Entity[];
      }
    }
  ]
} satisfies EnumCardInput<Entity[]>;
