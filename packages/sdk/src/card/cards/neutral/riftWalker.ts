import { getNearest } from '../../../entity/entity-utils';
import { airdrop } from '../../../modifier/modifier-utils';
import { defineBlueprint } from '../../card-lookup';
import { CARD_KINDS, FACTIONS, RARITIES, openingGambit } from '../../card-utils';

export default defineBlueprint({
  id: 'rift_walker',
  name: 'Rift Walker',
  description:
    'Airdrop\nOpening Gambit: Deal 2 damage to the nearest unit in front, behind, above, and below this.',
  kind: CARD_KINDS.MINION,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  spriteId: 'neutral_astralprime',
  manaCost: 3,
  attack: 2,
  maxHp: 1,
  meta: { damageAmount: 2 },
  onPlay(session, card, meta) {
    openingGambit(card, () => {
      [
        getNearest(session, 'up', card.entity.position),
        getNearest(session, 'down', card.entity.position),
        getNearest(session, 'right', card.entity.position),
        getNearest(session, 'left', card.entity.position)
      ].forEach(entity => {
        if (!entity) return;
        entity.takeDamage(meta.damageAmount, card);
      });
    });
  },
  modifiers: [airdrop()]
});
