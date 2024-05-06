export type CustomCardBlueprint = {
  name: string;
  description: string;
  spriteId: string;
  manaCost: number;
  attack: number;
  maxHp: number;
  effects: any[];
};

type CustomCardEffect = {
  trigger: any;
};
