import type { MaybePromise, Point3D } from '@game/shared';
import type { CustomCardNode, inferProcessedNode } from './custom-card-nodes';

import type { GameSession } from '../game-session';
import type { Entity } from '../entity/entity';

export type EnumCardInput<T> = {
  type: 'choices';
  label: string;
  choices: Array<{
    label: string;
    value: (session: GameSession, castPoint: Point3D) => T;
  }>;
};

export type NumberCardInput = { type: 'number'; label: string; allowNegative: boolean };

export type NodeCardInput<T extends CustomCardInput[]> = {
  type: 'node';
  label: string;
  choices: CustomCardNode<T>[];
};

export type CustomCardInput<T = any> = T extends CustomCardInput[]
  ? EnumCardInput<T> | NumberCardInput | NodeCardInput<T>
  : EnumCardInput<T> | NumberCardInput;

export type inferProcessedInput<T> =
  T extends EnumCardInput<infer U>
    ? U
    : T extends NumberCardInput
      ? number
      : T extends NodeCardInput<any>
        ? () => MaybePromise<any>
        : 'Unknown CustomCardInput type';

export const attackModifierInput = {
  type: 'number',
  label: 'Attack',
  allowNegative: true
} satisfies CustomCardInput;

export const hpModifierInput = {
  type: 'number',
  label: 'Health',
  allowNegative: true
} satisfies CustomCardInput;

export const amountInput = {
  type: 'number',
  label: 'Amount',
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
