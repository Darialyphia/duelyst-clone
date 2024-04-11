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

type inferInputs<T extends CustomCardInput[]> = {
  [P in keyof T]: inferProcessedInput<T[P]>;
};

export type CustomCardNode<T extends CustomCardInput[], TReturn> = {
  label: string;
  inputs: [...T];
  process(
    session: GameSession,
    card: AnyCard,
    config: NodeConfig[],
    node: CustomCardNode<T, TReturn>
  ): TReturn;
};

type GenericNode = CustomCardNode<any, any>;
export type inferProcessedNode<T extends GenericNode> = Awaited<ReturnType<T['process']>>;

type NodeConfig = {
  value: number;
  next?: NodeConfig[];
};

const defineNode = <T extends CustomCardInput[], U = any>(node: CustomCardNode<T, U>) =>
  node;
const getInputs = <TNode extends GenericNode>(
  nodeConfig: NodeConfig[],
  node: TNode
): inferInputs<TNode['inputs']> => {
  return nodeConfig.map((conf, index) => {
    const input = node.inputs?.[index];
    if (!input) throw new Error('invalid node config');

    return match(input.type)
      .with('number', () => conf.value)
      .with('choices', () => (input as EnumCardInput<any>).choices[conf.value])
      .with('node', () => (input as NodeCardInput<any, any>).choices[conf.value]);
  }) as inferInputs<TNode['inputs']>;
};

export const dealDamageNode = defineNode({
  label: 'Deal damage',
  inputs: [targetInput, amountInput] as const,
  process(session, card, config, node) {
    const [targets, amount] = getInputs(config, node);

    return () => Promise.all(targets.map(target => target.takeDamage(amount, card)));
  }
});

export const healNode = defineNode({
  label: 'Heal',
  inputs: [targetInput, amountInput] as const,
  process(session, card, config, node) {
    const [targets, amount] = getInputs(config, node);

    return () => Promise.all(targets.map(target => target.heal(amount, card)));
  }
});

export const statChangeNode = defineNode({
  label: 'Give +X / +X',
  inputs: [attackModifierInput, hpModifierInput, targetInput] as const,
  process(session, card, config, node) {
    const [attack, hp, targets] = getInputs(config, node);

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
    const [action] = getInputs(config, node);

    return () =>
      openingGambit(card as any, () => {
        action();
      });
  }
});

export const dyingWishNode = defineNode({
  label: 'Dying Wish',
  inputs: [
    { type: 'node', label: 'Action', choices: [dealDamageNode, healNode, statChangeNode] }
  ],
  process(session, card, config, node) {
    const [action] = getInputs(config, node);

    return () =>
      dyingWish(card as any, () => {
        action();
      });
  }
});

// export const rootNode = defineNode({
//   label: 'Choose an effect',
//   inputs: [
//     { type: 'node', label: 'Action', choices: [openingGambitNode, dyingWishNode] }
//   ] as const,
//   async process(session, card, action) {
//     await action();
//   }
// });
