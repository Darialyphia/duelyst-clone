import type { AnyCard } from '../card/card';
import { dyingWish, onGameEvent, openingGambit, rush } from '../card/card-utils';
import type { GameSession } from '../game-session';
import { createEntityModifier } from '../modifier/entity-modifier';
import {
  amountInput,
  attackModifierInput,
  entityEventInput,
  entityEventSourceInput,
  hpModifierInput,
  targetInput,
  type CustomCardInput,
  type EnumCardInput,
  type NodeCardInput,
  type inferProcessedInput
} from './custom-card-inputs';
import { modifierStatModifierMixin } from '../modifier/mixins/stat-modifier.mixin';
import { match } from 'ts-pattern';
import { runPromisesSequentially, type MaybePromise } from '@game/shared';
import type { Unit } from '../card/unit';
import type { Entity } from '../entity/entity';

type inferInputs<T extends CustomCardInput[]> = {
  [P in keyof T]: inferProcessedInput<T[P]>;
};
type inferDescriptions<T extends CustomCardInput[]> = {
  [P in keyof T]: string;
};

export type CustomCardNode<T extends CustomCardInput[]> = {
  id: string;
  label: string;
  inputs: [...T];
  process(
    session: GameSession,
    card: AnyCard,
    config: NodeConfig[],
    node: CustomCardNode<T>
  ): () => MaybePromise<any>;
  getDescription(config: NodeConfig[], node: CustomCardNode<T>): string;
};

export type AnyCardNode = CustomCardNode<CustomCardInput[]>;
export type inferProcessedNode<T extends AnyCardNode> = Awaited<ReturnType<T['process']>>;

export type NodeConfig = {
  value: number | string | number[] | string[];
  next: NodeConfig[];
};

const defineNode = <T extends CustomCardInput[]>(node: CustomCardNode<T>) => node;

const getInputs = <TNode extends AnyCardNode>(
  session: GameSession,
  card: AnyCard,
  nodeConfig: NodeConfig[],
  node: TNode
): inferInputs<TNode['inputs']> => {
  return nodeConfig.map((conf, index) => {
    const input = node.inputs?.[index];
    if (!input) throw new Error('invalid node config');

    return match(input)
      .with({ type: 'number' }, () => Number(conf.value))
      .with({ type: 'choices' }, input => {
        if (input.multiple) {
          if (!Array.isArray(conf.value)) {
            throw new Error('Input value needs to be an array');
          }
          return conf.value.map(val => {
            return input.choices[Number(val)];
          });
        }

        return input.choices[Number(conf.value)];
      })
      .with({ type: 'node' }, input => {
        if (input.multiple) {
          if (!Array.isArray(conf.value)) {
            throw new Error('Input value needs to be an array');
          }
          return runPromisesSequentially(
            conf.value.map(val => {
              const childNode = input.choices[Number(val)];
              return () => childNode.process(session, card, conf.next, childNode);
            })
          );
        }
        const childNode = input.choices[Number(conf.value)];
        return childNode.process(session, card, conf.next, childNode);
      })
      .run();
  }) as inferInputs<TNode['inputs']>;
};

const getInputDescriptions = <TNode extends AnyCardNode>(
  nodeConfig: NodeConfig[],
  node: TNode
): inferDescriptions<TNode['inputs']> => {
  return nodeConfig.map((conf, index) => {
    const input = node.inputs?.[index];
    if (!input) throw new Error('invalid node config');

    return match(input.type)
      .with('number', () => String(conf.value))
      .with(
        'choices',
        () => (input as EnumCardInput<any>).choices[Number(conf.value)].description
      )
      .with('node', () => {
        const childNode = (input as NodeCardInput<any>).choices[Number(conf.value)];
        return (input as NodeCardInput<any>).choices[Number(conf.value)].getDescription(
          conf.next,
          childNode
        );
      })
      .run();
  }) as inferDescriptions<TNode['inputs']>;
};

export const dealDamageNode = defineNode({
  id: 'deal_damage',
  label: 'Deal damage',
  inputs: [targetInput, amountInput] as const,
  process(session, card, config, node) {
    const [targets, amount] = getInputs(session, card, config, node);

    return () => Promise.all(targets.map(target => target.takeDamage(amount, card)));
  },
  getDescription(config, node) {
    const [targets, amount] = getInputDescriptions(config, node);
    return `Deal ${amount} damage to ${targets}`;
  }
});

export const healNode = defineNode({
  id: 'heal',
  label: 'Heal',
  inputs: [targetInput, amountInput] as const,
  process(session, card, config, node) {
    const [targets, amount] = getInputs(session, card, config, node);

    return () => Promise.all(targets.map(target => target.heal(amount, card)));
  },
  getDescription(config, node) {
    const [targets, amount] = getInputDescriptions(config, node);
    return `Restore ${amount} health to ${targets}`;
  }
});

export const drawNode = defineNode({
  id: 'draw_cards',
  label: 'Draw X',
  inputs: [amountInput] as const,
  process(session, card, config, node) {
    const [amount] = getInputs(session, card, config, node);

    return () => card.player.draw(amount);
  },
  getDescription(config, node) {
    const [amount] = getInputDescriptions(config, node);
    return `Draw ${amount} cards.`;
  }
});

export const statChangeNode = defineNode({
  id: 'stat_change',
  label: 'Give +X / +X',
  inputs: [attackModifierInput, hpModifierInput, targetInput] as const,
  process(session, card, config, node) {
    const [attack, hp, targets] = getInputs(session, card, config, node);

    return () =>
      targets
        .map(target => {
          target.addModifier(
            createEntityModifier({
              stackable: true,
              visible: true,
              name: 'Custom modifier',
              description: `${attack > 0 ? '+' : ''}${attack} / ${hp > 0 ? '+' : ''}${hp}`,
              stacks: 1,
              mixins: [
                modifierStatModifierMixin({
                  attack: attack,
                  maxHp: hp
                })
              ]
            })
          );
        })
        .flat();
  },
  getDescription(config, node) {
    const [attack, hp, targets] = getInputDescriptions(config, node);
    return `Give ${Number(attack) > 0 ? '+' : ''}${attack} / ${Number(hp) > 0 ? '+' : ''}${hp} to ${targets}`;
  }
});

export const openingGambitNode = defineNode({
  id: 'opening_gambit',
  label: 'Opening Gambit',
  inputs: [
    {
      type: 'node',
      label: 'Action',
      multiple: true,
      choices: [dealDamageNode, healNode, statChangeNode, drawNode] as const
    }
  ],
  process(session, card, config, node) {
    const [action] = getInputs(session, card, config, node);

    return () =>
      openingGambit(card as any, () => {
        action();
      });
  },
  getDescription(config, node) {
    const [action] = getInputDescriptions(config, node);
    return `Opening Gambit: ${action}`;
  }
});

export const dyingWishNode = defineNode({
  id: 'dying_wish',
  label: 'Dying Wish',
  inputs: [
    {
      type: 'node',
      label: 'Action',
      multiple: true,
      choices: [dealDamageNode, healNode, statChangeNode, drawNode]
    }
  ],
  process(session, card, config, node) {
    const [action] = getInputs(session, card, config, node);

    return () =>
      dyingWish(card as any, () => {
        action();
      });
  },
  getDescription(config, node) {
    const [action] = getInputDescriptions(config, node);
    return `Opening Gambit: ${action}`;
  }
});

export const rushNode = defineNode({
  id: 'rush',
  label: 'Rush',
  inputs: [],
  process(session, card) {
    return () => rush(card as any);
  },
  getDescription() {
    return `Rush`;
  }
});

export const eventNode = defineNode({
  id: 'event',
  label: 'Whenever',
  inputs: [
    entityEventSourceInput,
    entityEventInput,
    {
      type: 'node',
      label: 'Action',
      choices: [dealDamageNode, healNode, statChangeNode, drawNode],
      multiple: true
    }
  ],
  process(session, card, config, node) {
    return () => {
      const [source, events, action] = getInputs(session, card, config, node);
      const unit = card as Unit & { entity: Entity };

      events.forEach(event => {
        onGameEvent(unit, `entity:${event}`, ([event]) => {
          match(source)
            .with('self', () => {
              const entity = 'entity' in event ? event.entity : event;
              if (unit.entity.equals(entity)) action();
            })
            .with('ally', () => {
              const entity = 'entity' in event ? event.entity : event;
              if (unit.entity.isAlly(entity.id)) action();
            })
            .with('enemy', () => {
              const entity = 'entity' in event ? event.entity : event;
              if (unit.entity.isEnemy(entity.id)) action();
            })
            .with('ally_general', () => {
              const entity = 'entity' in event ? event.entity : event;
              if (!entity.isGeneral) return;
              if (unit.entity.isAlly(entity.id)) action();
            })
            .with('enemy_general', () => {
              const entity = 'entity' in event ? event.entity : event;
              if (!entity.isGeneral) return;
              if (unit.entity.isEnemy(entity.id)) action();
            })
            .with('any', () => {
              action();
            })
            .exhaustive();
        });
      });
    };
  },
  getDescription(config, node) {
    const [source, event, action] = getInputDescriptions(config, node);
    return `Whenever ${source} ${event}, ${action}`;
  }
});

export const rootNode = defineNode({
  id: 'root',
  label: 'Choose an Action',
  inputs: [
    {
      type: 'node',
      label: 'Effect type',
      multiple: true,
      choices: [openingGambitNode, dyingWishNode, rushNode, eventNode]
    }
  ] as const,
  process(session, card, config, node) {
    const [action] = getInputs(session, card, config, node);

    return () => action();
  },
  getDescription(config, node) {
    const [action] = getInputDescriptions(config, node);
    return action;
  }
});
