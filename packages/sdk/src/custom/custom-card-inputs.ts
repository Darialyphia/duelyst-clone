import type { MaybePromise, Point3D } from '@game/shared';
import type { CustomCardNode, inferProcessedNode } from './custom-card-nodes';

import type { GameSession } from '../game-session';
import type { Entity } from '../entity/entity';

export type EnumCardInput<T> = {
  type: 'choices';
  label: string;
  choices: Array<{
    label: string;
    description: string;
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
      label: 'An enemy',
      description: 'an enemy',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'An ally',
      description: 'an ally',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'An enemy minion',
      description: 'an enemy minion',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'An ally minion',
      description: 'an allied minion',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },

    {
      label: 'The enemy general',
      description: 'the enemy general',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'Your general',
      description: 'your general',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },

    {
      label: 'A nearby enemy',
      description: 'a nearby enemy',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'A nearby enemy minion',
      description: 'a nearby enemy minion',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'A nearby ally',
      description: 'a nearby ally',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'A nearby ally minion',
      description: 'a nearby allied minion',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },

    {
      label: 'All enemies',
      description: 'all enemies',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'All enemy minions',
      description: 'all enemy minions',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'All allies',
      description: 'all allies',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'All ally minions',
      description: 'all allied minions',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },

    {
      label: 'All nearby enemy',
      description: 'all nearby enemies',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'All nearby enemy minions',
      description: 'all  nearby enemy minions',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'All nearby allies',
      description: 'all nearby allies',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'All nearby ally minions',
      description: 'all nearby ally minions',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },

    {
      label: 'All minions',
      description: 'all minions',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'Any unit',
      description: 'a unit',
      value(session, castPoint) {
        return [] as Entity[];
      }
    },
    {
      label: 'everyone',
      description: 'everyone',
      value(session, castPoint) {
        return [] as Entity[];
      }
    }
  ]
} satisfies EnumCardInput<Entity[]>;
