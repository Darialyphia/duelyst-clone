import type { AnyCard } from '../card/card';
import { openingGambit } from '../card/card-utils';
import type { Entity } from '../entity/entity';
import type { GameSession } from '../game-session';
import type { EntityModifier } from '../modifier/entity-modifier';
import {
  amountInput,
  attackModifierInput,
  hpModifierInput,
  targetInput,
  type CustomCardInput,
  type inferProcessedInput
} from './custom-card-inputs';

type inferInputs<T extends CustomCardInput[]> = {
  [P in keyof T]: inferProcessedInput<T[P]>;
};

export type CustomCardNode<T extends CustomCardInput[]> = {
  label: string;
  inputs?: [...T];
  process(session: GameSession, card: AnyCard, ...inputs: inferInputs<T>): Promise<any>;
};

export type inferProcessedNode<T extends CustomCardNode<any>> = Awaited<
  ReturnType<T['process']>
>;

const defineNode = <T extends CustomCardInput[]>(node: CustomCardNode<T>) => node;

export const dealDamageNode = defineNode({
  label: 'Deal damage',
  inputs: [targetInput, amountInput],
  async process(session, card, targets, amount) {
    await Promise.all(targets.map(target => target.takeDamage(amount, card)));
  }
});

export const healNode = defineNode({
  label: 'Heal',
  inputs: [targetInput, amountInput],
  async process(session, card, targets, amount) {
    await Promise.all(targets.map(target => target.heal(amount, card)));
  }
});

export const statChangeNode = defineNode({
  label: 'Give +X / +X',
  inputs: [attackModifierInput, hpModifierInput, targetInput],
  process(session, card, attack, hp, targets) {
    return Promise.resolve(
      targets
        .map(target => {
          return [
            target.addInterceptor('attack', val => val + attack),
            target.addInterceptor('maxHp', val => val + hp)
          ];
        })
        .flat()
    );
  }
});

export const openingGambitNode = defineNode({
  label: 'Opening Gambit',
  inputs: [{ type: 'node', choices: [dealDamageNode, healNode, statChangeNode] }],
  process(session, card, action) {
    // openingGambit(card, () => {
    //   action.
    // });
  }
});

export const dyingWishNode: CustomCardNode = {
  label: 'Dying Wish',
  inputs: [{ type: 'node', choices: [dealDamageNode, healNode, statChangeNode] }]
};

export const rootNode: CustomCardNode = {
  label: 'Choose an effect',
  inputs: [{ type: 'node', choices: [openingGambitNode, dyingWishNode] }]
};
