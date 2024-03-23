import { type CardBlueprint } from '../../card-lookup';
import { CARD_KINDS } from '../../card-utils';

export const neutral: CardBlueprint[] = [
  {
    id: 'healing_mystic',
    name: 'Healing Mystic',
    spriteId: 'neutral_healingmystic',
    kind: CARD_KINDS.MINION,
    manaCost: 2,
    modifiers: [],
    description: '',
    attack: 2,
    maxHp: 3
  }
];
