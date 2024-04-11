import type { NodeConfig } from './custom-card-nodes';

export type CustomCardBlueprint = {
  name: string;
  description: string;
  spriteId: string;
  manaCost: number;
  attack: number;
  maxHp: number;
  nodes: NodeConfig[][];
};
