import { head } from 'lodash-es';
import { isEmpty } from '../../../entity/entity-utils';
import { defineBlueprint, type CardBlueprint } from '../../card-lookup';
import {
  CARD_KINDS,
  FACTIONS,
  getFollowupEntities,
  openingGambit,
  RARITIES
} from '../../card-utils';

export default defineBlueprint({
  id: 'healing_mystic',
  name: 'Healing Mystic',
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
  description: 'Opening Gambit: Restore 2 Health to anything.',
  spriteId: 'neutral_healingmystic',
  kind: CARD_KINDS.MINION,
  manaCost: 2,
  attack: 2,
  maxHp: 3,
  meta: {
    healAmount: 2
  },
  onPlay(session, card, meta) {
    openingGambit(card, (session, attachedTo) => {
      const [entity] = getFollowupEntities(session, card);
      if (entity) {
        entity.heal(meta.healAmount, attachedTo.card);
      }
    });
  },
  followup: {
    minTargetCount: 0,
    maxTargetCount: 1,
    isTargetable(session, point) {
      return !isEmpty(session, point);
    }
  }
});
