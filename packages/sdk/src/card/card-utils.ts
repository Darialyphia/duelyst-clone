import { isDefined, type MaybePromise, type Values } from '@game/shared';
import type { Unit } from './unit';
import { ENTITY_EVENTS, type Entity } from '../entity/entity';
import { createEntityModifier, type EntityModifier } from '../modifier/entity-modifier';
import { modifierOpeningGambitMixin } from '../modifier/mixins/opening-gambit.mixin';
import { modifierDyingWishMixin } from '../modifier/mixins/dying-wish.mixin';
import { modifierRushMixin } from '../modifier/mixins/rush.mixin';
import { modifierGameEventMixin } from '../modifier/mixins/game-event.mixin';
import { KEYWORDS } from '../utils/keywords';
import type { GameEvent, GameEventMap, GameSession } from '../game-session';
import { CARD_EVENTS, type AnyCard } from './card';
import { PLAYER_EVENTS } from '../player/player';
import { modifierRangedMixin } from '../modifier/mixins/ranged.mixin';
import type { Spell } from './spell';

export const CARD_KINDS = {
  MINION: 'MINION',
  GENERAL: 'GENERAL',
  SPELL: 'SPELL',
  ARTIFACT: 'ARTIFACT'
} as const;

export type CardKind = Values<typeof CARD_KINDS>;

export const FACTIONS = {
  LYONAR: 'Lyonar',
  SONGHAI: 'Songhai',
  VETRUVIAN: 'Vetruvian',
  ABYSSIAN: 'Abyssian',
  MAGMAR: 'Magmar',
  VANAR: 'Vanar',
  NEUTRAL: 'Neutral'
} as const;

export type Faction = Values<typeof FACTIONS>;

export const RARITIES = {
  BASIC: 'basic',
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
} as const;

export type Rarity = Values<typeof RARITIES>;

export const openingGambit = (
  card: Unit & { entity: Entity },
  handler: Parameters<typeof modifierOpeningGambitMixin>[0]['handler']
) => {
  card.entity.addModifier(
    createEntityModifier({
      visible: false,
      stackable: false,
      mixins: [
        modifierOpeningGambitMixin({
          keywords: [],
          handler
        })
      ]
    })
  );
};

export const dyingWish = (
  card: Unit & { entity: Entity },
  handler: Parameters<typeof modifierDyingWishMixin>[0]['listener'],
  phase?: 'after' | 'before'
) => {
  card.entity.addModifier(
    createEntityModifier({
      visible: false,
      stackable: false,
      mixins: [
        modifierDyingWishMixin({
          keywords: [],
          listener: handler,
          phase
        })
      ]
    })
  );
};

export const rush = (card: Unit & { entity: Entity }) => {
  card.entity.addModifier(
    createEntityModifier({
      visible: true,
      name: KEYWORDS.RUSH.name,
      description: KEYWORDS.RUSH.description,
      stackable: false,
      mixins: [modifierRushMixin()]
    })
  );
};

export const ranged = (card: Unit & { entity: Entity }) => {
  card.entity.addModifier(
    createEntityModifier({
      visible: true,
      name: KEYWORDS.RANGED.name,
      description: KEYWORDS.RANGED.description,
      stackable: false,
      mixins: [modifierRangedMixin()]
    })
  );
};

export const onGameEvent = <T extends GameEvent>(
  card: Unit & { entity: Entity },
  eventName: T,
  listener: (
    event: GameEventMap[T],
    ctx: { session: GameSession; attachedTo: Entity; modifier: EntityModifier }
  ) => MaybePromise<void>
) => {
  card.entity.addModifier(
    createEntityModifier({
      visible: false,
      stackable: false,
      mixins: [
        modifierGameEventMixin({
          eventName,
          keywords: [],
          listener
        })
      ]
    })
  );
};

export const whileInHand = (
  card: AnyCard,
  cb: (card: AnyCard) => any,
  cleanup: (card: AnyCard) => any
) => {
  card.on(CARD_EVENTS.DRAWN, cb);
  const unsub = () => {
    cleanup(card);
    card.off(CARD_EVENTS.AFTER_PLAYED, unsub);
    card.off(CARD_EVENTS.REPLACED, unsub);
  };
  card.on(CARD_EVENTS.AFTER_PLAYED, unsub);
  card.on(CARD_EVENTS.REPLACED, unsub);
};

export const whileOnBoard = (
  card: Unit & { entity: Entity },
  onApplied: EntityModifier['onApplied'],
  onRemoved: EntityModifier['onRemoved']
) => {
  card.entity.addModifier(
    createEntityModifier({
      stackable: false,
      visible: false,
      mixins: [
        {
          onApplied(session, attachedTo, modifier) {
            onApplied(session, attachedTo, modifier);
            card.entity.once(ENTITY_EVENTS.BEFORE_DESTROY, () => {
              onRemoved(session, attachedTo, modifier);
            });
          },
          onRemoved
        }
      ]
    })
  );
};

export const onlyDuringOwnerTurn = (card: AnyCard, cb: () => void) => {
  const listener = () => {
    cb();
    card.player.once(PLAYER_EVENTS.TURN_END, () => {
      card.player.off(PLAYER_EVENTS.TURN_START, listener);
    });
  };

  return {
    activate() {
      card.player.on(PLAYER_EVENTS.TURN_START, listener);
    },
    deactivate() {
      card.player.off(PLAYER_EVENTS.TURN_START, listener);
    }
  };
};

export const getFollowupEntities = (session: GameSession, card: Unit | Spell) => {
  return card.followupTargets
    .map(point => session.entitySystem.getEntityAt(point))
    .filter(isDefined);
};
