import { keyBy } from 'lodash-es';
import type { CardBlueprintId } from './card';
import type { AnyObject } from '@game/shared';
import { lyonar } from './cards/lyonar';
import { songhai } from './cards/songhai';
import { vetruvian } from './cards/vetruvian';
import { abyssian } from './cards/abyssian';
import { magmar } from './cards/magmar';
import { vanar } from './cards/vanar';
import { neutral } from './cards/neutral';
import type { CardBlueprint } from './card-blueprint';

const allCards: CardBlueprint<AnyObject>[] = [
  ...lyonar,
  ...songhai,
  ...vetruvian,
  ...abyssian,
  ...magmar,
  ...vanar,
  ...neutral
];
export const CARDS: Record<CardBlueprintId, CardBlueprint> = keyBy(allCards, 'id');
