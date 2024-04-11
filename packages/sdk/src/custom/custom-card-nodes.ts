import type { AnyCard } from '../card/card';
import { dyingWish, openingGambit } from '../card/card-utils';
import type { GameSession } from '../game-session';
import { createEntityModifier } from '../modifier/entity-modifier';
import {
  amountInput,
  attackModifierInput,
  hpModifierInput,
  targetInput,
  type CustomCardInput,
  type EnumCardInput,
  type NodeCardInput,
  type inferProcessedInput
} from './custom-card-inputs';
import { modifierStatModifierMixin } from '../modifier/mixins/stat-modifier.mixin';
import { match } from 'ts-pattern';
import type { MaybePromise } from '@game/shared';

type inferInputs<T extends CustomCardInput[]> = {
  [P in keyof T]: inferProcessedInput<T[P]>;
};
type inferDescriptions<T extends CustomCardInput[]> = {
  [P in keyof T]: string;
};

export type CustomCardNode<T extends CustomCardInput[]> = {
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
  value: number | string;
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

    return match(input.type)
      .with('number', () => Number(conf.value))
      .with('choices', () => (input as EnumCardInput<any>).choices[Number(conf.value)])
      .with('node', () => {
        const childNode = (input as NodeCardInput<any>).choices[Number(conf.value)];
        return (input as NodeCardInput<any>).choices[Number(conf.value)].process(
          session,
          card,
          conf.next,
          childNode
        );
      })
      .run();
  }) as inferInputs<TNode['inputs']>;
};

const getInputDescriptions = <TNode extends AnyCardNode>(
  nodeConfig: NodeConfig[],
  node: TNode
): inferDescriptions<TNode['inputs']> => {
  const ret = nodeConfig.map((conf, index) => {
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
  console.log(ret);
  return ret;
};

export const dealDamageNode = defineNode({
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

export const statChangeNode = defineNode({
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
  label: 'Opening Gambit',
  inputs: [
    {
      type: 'node',
      label: 'Action',
      choices: [dealDamageNode, healNode, statChangeNode] as const
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
  label: 'Dying Wish',
  inputs: [
    { type: 'node', label: 'Action', choices: [dealDamageNode, healNode, statChangeNode] }
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

export const rootNode = defineNode({
  label: 'Choose an Action',
  inputs: [
    { type: 'node', label: 'Effect type', choices: [openingGambitNode, dyingWishNode] }
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
