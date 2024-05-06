import { defineNode, type AnySerializedNode, type SerializedNode } from './types';

type GenericNodeMap = Record<string, AnySerializedNode>;

// provides validation at the type level that every key in the node map matches the node id of its value
type ValidatedNodeMap<T extends GenericNodeMap> = {
  [Name in keyof T]: T[Name] extends SerializedNode<infer Id, any[]>
    ? Name extends Id
      ? T[Name]
      : never
    : never;
};

const validateNodeMap = <T extends GenericNodeMap>(data: ValidatedNodeMap<T>) => data;

export const triggerNodes = validateNodeMap({
  openingGambit: defineNode(['openingGambit'])
});

export const actionNodes = validateNodeMap({
  test: defineNode(['test'])
});
