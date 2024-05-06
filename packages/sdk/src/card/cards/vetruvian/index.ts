import { config } from '../../../config';
import { createEntityModifier } from '../../../modifier/entity-modifier';
import { type CardBlueprint } from '../../card-lookup';
import {
  CARD_KINDS,
  FACTIONS,
  gateway,
  RARITIES,
  rush,
  structure,
  TRIBES
} from '../../card-utils';
import { modifierStatModifierMixin } from '../../../modifier/mixins/stat-modifier.mixin';
import { PLAYER_EVENTS } from '../../../player/player';
import { sajj } from './generals';
import windDervish from './windDervish';
import etherealObelysk from './etherealObelysk';
import scionsFirstWish from './scionsFirstWish';

export const vetruvian: CardBlueprint[] = [
  sajj,
  windDervish,
  etherealObelysk,
  scionsFirstWish
];
