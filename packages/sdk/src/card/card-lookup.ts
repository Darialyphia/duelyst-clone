import { keyBy } from 'lodash-es';
import type { CardBlueprintId } from './card';
import type { AnyObject } from '@game/shared';
import { lyonar } from './cards/lyonar/_index';
import { songhai } from './cards/songhai/_index';
import { vetruvian } from './cards/vetruvian/_index';
import { abyssian } from './cards/abyssian/_index';
import { magmar } from './cards/magmar/_index';
import { vanar } from './cards/vanar/_index';
import { neutral } from './cards/neutral/_index';
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
