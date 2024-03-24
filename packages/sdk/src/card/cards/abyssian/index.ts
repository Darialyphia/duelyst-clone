import { config } from '../../../config';
import { type CardBlueprint } from '../../card-lookup';
import { CARD_KINDS } from '../../card-utils';

export const abyssian: CardBlueprint[] = [
  {
    id: 'maehv',
    name: 'Maehv Skinsolder',
    spriteId: 'f4_3rdgeneral',
    kind: CARD_KINDS.GENERAL,
    manaCost: 0,
    modifiers: [],
    description: '',
    attack: config.GENERAL_DEFAULT_ATTACK,
    maxHp: config.GENERAL_DEFAULT_HP
  }
];
