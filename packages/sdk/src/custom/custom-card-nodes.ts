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
  type CustomCardInput
} from './custom-card-inputs';

export type CustomCardNode<TInputs extends any[], TReturn = void> = {
  label: string;
  inputs?: CustomCardInput[];
  process(session: GameSession, card: AnyCard, ...inputs: TInputs): TReturn;
};

export const dealDamageNode: CustomCardNode<[Entity[], number]> = {
  label: 'Deal damage',
  inputs: [targetInput, amountInput],
  process(session, card, targets, amount) {
    targets.forEach(target => {
      target.takeDamage(amount, card);
    });
  }
};

export const healNode: CustomCardNode<[Entity[], number]> = {
  label: 'Heal',
  inputs: [targetInput, amountInput],
  process(session, card, targets, amount) {
    targets.forEach(target => {
      target.heal(amount, card);
    });
  }
};

export const statChangeNode: CustomCardNode<[number, number, Entity[]], (() => void)[]> =
  {
    label: 'Give +X / +X',
    inputs: [attackModifierInput, hpModifierInput, targetInput],
    process(session, card, attack, hp, targets) {
      return targets
        .map(target => {
          return [
            target.addInterceptor('attack', val => val + attack),
            target.addInterceptor('maxHp', val => val + hp)
          ];
        })
        .flat();
    }
  };

export const openingGambitNode: CustomCardNode<[CustomCardNode]> = {
  label: 'Opening Gambit',
  inputs: [{ type: 'node', choices: [dealDamageNode, healNode, statChangeNode] }],
  process(session, card, action) {
    // openingGambit(card, () => {
    //   action.
    // });
  }
};

export const dyingWishNode: CustomCardNode = {
  label: 'Dying Wish',
  inputs: [{ type: 'node', choices: [dealDamageNode, healNode, statChangeNode] }]
};

export const rootNode: CustomCardNode = {
  label: 'Choose an effect',
  inputs: [{ type: 'node', choices: [openingGambitNode, dyingWishNode] }]
};
