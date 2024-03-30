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
  options: SerializedCard,
  index: CardIndex,
  playerId: PlayerId
) => {
  const blueprint = CARDS[options.blueprintId];

  const card = match(blueprint.kind)
    .with(
      CARD_KINDS.GENERAL,
      CARD_KINDS.MINION,
      () => new Unit(session, index, options, playerId)
    )
    .with(CARD_KINDS.SPELL, () => new Spell(session, index, options, playerId))
    .with(CARD_KINDS.ARTIFACT, () => new Artifact(session, index, options, playerId))
    .exhaustive();
  card.setup();

  return card;
};
