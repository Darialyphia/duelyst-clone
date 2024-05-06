import type { Faction, Rarity } from '../../card/card-utils';

export type SerializedBlueprintUnit = {
  name: string;
  faction: Faction;
  rarity: Rarity;
  description: string;
  spriteId: string;
  manaCost: number;
  attack: number;
  maxHp: number;
  effects: any[];
};

export type SerializedNode<TId extends string, TInputs extends any[]> = Readonly<
  [id: TId, ...inputs: TInputs]
>;

export const defineNode = <TId extends string, TInputs extends any[]>(
  node: SerializedNode<TId, TInputs>
) => node;

export type AnySerializedNode = SerializedNode<string, any[]>;

export type SerializedBlueprintEffect = {
  trigger: AnySerializedNode;
  actions: AnySerializedNode[];
};

type Node<TId extends string, TInputs extends any[]> = {
  id: TId;
  inputs: TInputs;
  serialize(): SerializedNode<TId, TInputs>;
};
