import { isDefined, type MaybePromise, type Point3D } from '@game/shared';
import type { CustomCardNode } from './custom-card-nodes';

import type { GameSession } from '../game-session';
import { ENTITY_EVENTS, type Entity, type EntityEvent } from '../entity/entity';
import type { Unit } from '../card/unit';

export type EnumCardInput<T> = {
  type: 'choices';
  label: string;
  multiple: boolean;
  choices: Array<{
    label: string;
    description: string;
    value: (
      session: GameSession,
      card: Unit,
      castPoint: Point3D,
      followupIndex: number
    ) => T;
  }>;
};

export type NumberCardInput = { type: 'number'; label: string; allowNegative: boolean };

export type NodeCardInput<T extends CustomCardInput[]> = {
  type: 'node';
  label: string;
  choices: CustomCardNode<T>[];
  multiple: boolean;
};

export type CustomCardInput<T = any> = T extends CustomCardInput[]
  ? EnumCardInput<T> | NumberCardInput | NodeCardInput<T>
  : EnumCardInput<T> | NumberCardInput;

export type inferProcessedInput<T> =
  T extends EnumCardInput<infer U>
    ? T['multiple'] extends true
      ? Array<U>
      : U
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
  multiple: false,
  choices: [
    {
      label: 'An enemy',
      description: 'an enemy',
      value(session, card, castPoint, followupIndex) {
        const entity = session.entitySystem.getEntityAt(
          card.followupTargets[followupIndex]
        );
        if (!entity) return [];
        if (entity.player.equals(card.player)) return [];

        return [entity];
      }
    },
    {
      label: 'An ally',
      description: 'an ally',
      value(session, card, castPoint, followupIndex) {
        const entity = session.entitySystem.getEntityAt(
          card.followupTargets[followupIndex]
        );
        if (!entity) return [];
        if (!entity.player.equals(card.player)) return [];

        return [entity];
      }
    },
    {
      label: 'An enemy minion',
      description: 'an enemy minion',
      value(session, card, castPoint, followupIndex) {
        const entity = session.entitySystem.getEntityAt(
          card.followupTargets[followupIndex]
        );
        if (!entity) return [];
        if (entity.player.equals(card.player)) return [];
        if (entity.isGeneral) return [];

        return [entity];
      }
    },
    {
      label: 'An ally minion',
      description: 'an allied minion',
      value(session, card, castPoint, followupIndex) {
        const entity = session.entitySystem.getEntityAt(
          card.followupTargets[followupIndex]
        );
        if (!entity) return [];
        if (!entity.player.equals(card.player)) return [];
        if (entity.isGeneral) return [];

        return [entity];
      }
    },

    {
      label: 'The enemy general',
      description: 'the enemy general',
      value(session, card) {
        return [card.player.opponent.general];
      }
    },
    {
      label: 'Your general',
      description: 'your general',
      value(session, card) {
        return [card.player.general];
      }
    },

    {
      label: 'A nearby enemy',
      description: 'a nearby enemy',
      value(session, card, castPoint, followupIndex) {
        const entity = session.entitySystem.getEntityAt(
          card.followupTargets[followupIndex]
        );
        if (!entity) return [];
        if (entity.player.equals(card.player)) return [];

        return [entity];
      }
    },
    {
      label: 'A nearby enemy minion',
      description: 'a nearby enemy minion',
      value(session, card, castPoint, followupIndex) {
        const entity = session.entitySystem.getEntityAt(
          card.followupTargets[followupIndex]
        );
        if (!entity) return [];
        if (entity.player.equals(card.player)) return [];
        if (entity.isGeneral) return [];

        return [entity];
      }
    },
    {
      label: 'A nearby ally',
      description: 'a nearby ally',
      value(session, card, castPoint, followupIndex) {
        const entity = session.entitySystem.getEntityAt(
          card.followupTargets[followupIndex]
        );
        if (!entity) return [];
        if (!entity.player.equals(card.player)) return [];

        return [entity];
      }
    },
    {
      label: 'A nearby ally minion',
      description: 'a nearby allied minion',
      value(session, card, castPoint, followupIndex) {
        const entity = session.entitySystem.getEntityAt(
          card.followupTargets[followupIndex]
        );
        if (!entity) return [];
        if (entity.player.equals(card.player)) return [];
        if (entity.isGeneral) return [];

        return [entity];
      }
    },

    {
      label: 'All enemies',
      description: 'all enemies',
      value(session, card) {
        return card.player.opponent.entities;
      }
    },
    {
      label: 'All enemy minions',
      description: 'all enemy minions',
      value(session, card) {
        return card.player.opponent.entities.filter(e => !e.isGeneral);
      }
    },
    {
      label: 'All allies',
      description: 'all allies',
      value(session, card) {
        return card.player.entities;
      }
    },
    {
      label: 'All ally minions',
      description: 'all allied minions',
      value(session, card) {
        return card.player.entities.filter(e => !e.isGeneral);
      }
    },

    {
      label: 'All nearby enemy',
      description: 'all nearby enemies',
      value(session, card, castPoint) {
        return session.boardSystem
          .getNeighbors(castPoint)
          .map(cell => cell.entity)
          .filter(isDefined)
          .filter(entity => !card.player.equals(entity.player));
      }
    },
    {
      label: 'All nearby enemy minions',
      description: 'all  nearby enemy minions',
      value(session, card, castPoint) {
        return session.boardSystem
          .getNeighbors(castPoint)
          .map(cell => cell.entity)
          .filter(isDefined)
          .filter(entity => !entity.isGeneral && !card.player.equals(entity.player));
      }
    },
    {
      label: 'All nearby allies',
      description: 'all nearby allies',
      value(session, card, castPoint) {
        return session.boardSystem
          .getNeighbors(castPoint)
          .map(cell => cell.entity)
          .filter(isDefined)
          .filter(entity => card.player.equals(entity.player));
      }
    },
    {
      label: 'All nearby allied minions',
      description: 'all nearby allied minions',
      value(session, card, castPoint) {
        return session.boardSystem
          .getNeighbors(castPoint)
          .map(cell => cell.entity)
          .filter(isDefined)
          .filter(entity => !entity.isGeneral && card.player.equals(entity.player));
      }
    },

    {
      label: 'All minions',
      description: 'all minions',
      value(session) {
        return session.entitySystem.getList().filter(e => !e.isGeneral);
      }
    },
    {
      label: 'Any unit',
      description: 'a unit',
      value(session, card, castPoint, followupIndex) {
        const entity = session.entitySystem.getEntityAt(
          card.followupTargets[followupIndex]
        );
        if (!entity) return [];

        return [entity];
      }
    },
    {
      label: 'Everyone',
      description: 'everyone',
      value(session) {
        return session.entitySystem.getList();
      }
    },
    {
      label: 'Self',
      description: 'to this unit.',
      value(session, card) {
        return [card.entity!];
      }
    }
  ]
} satisfies EnumCardInput<Entity[]>;

export const entityEventSourceInput = {
  type: 'choices',
  label: 'Event target',
  multiple: false,
  choices: [
    {
      label: 'This unit',
      description: 'this unit',
      value() {
        return 'self';
      }
    },
    {
      label: 'An enemy',
      description: 'an enemy',
      value() {
        return 'enemy';
      }
    },
    {
      label: 'An ally',
      description: 'An ally',
      value() {
        return 'ally';
      }
    },
    {
      label: 'The enemy general',
      description: 'the enemy general',
      value() {
        return 'enemy_general';
      }
    },
    {
      label: 'Your general',
      description: 'your general',
      value() {
        return 'ally_general';
      }
    },
    {
      label: 'Any unit',
      description: 'any unit',
      value() {
        return 'any';
      }
    }
  ]
} satisfies EnumCardInput<
  'self' | 'ally' | 'enemy' | 'ally_general' | 'enemy_general' | 'any'
>;

export const entityEventInput = {
  type: 'choices',
  label: 'Event',
  multiple: true,
  choices: [
    {
      label: 'Is summoned',
      description: 'is summoned',
      value() {
        return ENTITY_EVENTS.CREATED;
      }
    },
    {
      label: 'Is destroyed',
      description: 'is destroyed',
      value() {
        return ENTITY_EVENTS.AFTER_DESTROY;
      }
    },
    {
      label: 'Attacks',
      description: 'attacks',
      value() {
        return ENTITY_EVENTS.AFTER_ATTACK;
      }
    },
    {
      label: 'Moves',
      description: 'moves',
      value() {
        return ENTITY_EVENTS.AFTER_MOVE;
      }
    },
    {
      label: 'Takes damage',
      description: 'takes damage',
      value() {
        return ENTITY_EVENTS.AFTER_TAKE_DAMAGE;
      }
    },
    {
      label: 'Deals damage',
      description: 'deals damage',
      value() {
        return ENTITY_EVENTS.AFTER_DEAL_DAMAGE;
      }
    },
    {
      label: 'Is healed',
      description: 'is healed',
      value() {
        return ENTITY_EVENTS.AFTER_HEAL;
      }
    }
  ]
} satisfies EnumCardInput<EntityEvent>;
