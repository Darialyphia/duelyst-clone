import { match } from 'ts-pattern';
import type { GameSession } from '../game-session';
import type { CardIndex, PlayerId } from '../player/player';
import type { SerializedCard } from './card';
import { CARDS } from './card-lookup';
import { CARD_KINDS } from './card-utils';
import { Artifact } from './artifact';
import { Spell } from './spell';
import { Unit } from './unit';

export const createCard = (
  session: GameSession,
  card: SerializedCard,
  index: CardIndex,
  playerId: PlayerId
) => {
  const blueprint = CARDS[card.blueprintId];

  return match(blueprint.kind)
    .with(
      CARD_KINDS.GENERAL,
      CARD_KINDS.MINION,
      () => new Unit(session, index, card, playerId)
    )
    .with(CARD_KINDS.SPELL, () => new Spell(session, index, card, playerId))
    .with(CARD_KINDS.ARTIFACT, () => new Artifact(session, index, card, playerId))
    .exhaustive();
};
