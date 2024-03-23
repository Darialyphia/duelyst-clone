import { config } from '../../../config';
import { type CardBlueprint } from '../../card-lookup';
import { CARD_KINDS } from '../../card-utils';

export const vetruvian: CardBlueprint[] = [
  {
    id: 'sajj',
    name: 'Scioness Sajj',
    spriteId: 'f3_altgeneral',
    kind: CARD_KINDS.GENERAL,
    manaCost: 0,
    modifiers: [],
    description: '',
    attack: config.GENERAL_DEFAULT_ATTACK,
    maxHp: config.GENERAL_DEFAULT_HP
  }
];
