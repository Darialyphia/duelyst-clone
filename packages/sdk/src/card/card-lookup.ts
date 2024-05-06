import { keyBy } from 'lodash-es';
import type { CardBlueprintId } from './card';
import type { AnyObject, MaybePromise, Point3D, Prettify, Values } from '@game/shared';
import type { GameSession } from '../game-session';
import type { Entity } from '../entity/entity';
import { lyonar } from './cards/lyonar';
import { songhai } from './cards/songhai';
import { vetruvian } from './cards/vetruvian';
import { abyssian } from './cards/abyssian';
import { magmar } from './cards/magmar';
import { vanar } from './cards/vanar';
import { neutral } from './cards/neutral';
import type { CardKind, Faction, Rarity, Tribe } from './card-utils';
import type { Unit } from './unit';
import type { Spell } from './spell';
import type { CardModifier } from '../modifier/card-modifier';
import type { Artifact } from './artifact';

type CardBlueprintBase<T extends AnyObject> = {
  id: CardBlueprintId;
  name: string;
  description: string;
  faction: Faction;
  rarity: Rarity;
  manaCost: number;
  spriteId: string;
  meta: T;
};

type CardBlueprintUnit<T extends AnyObject> = {
  attack: number;
  maxHp: number;
  modifiers?: CardModifier<Unit>[];
  tribe?: Tribe;
  onPlay(
    session: GameSession,
    card: Unit & { entity: Entity },
    meta: T
  ): MaybePromise<void>;
  followup?: {
    minTargetCount: number;
    maxTargetCount: number;
    isTargetable(
      session: GameSession,
      point: Point3D,
      summonedPoint: Point3D,
      card: Unit
    ): boolean;
  };
};

type CardBlueprintSpell<T extends AnyObject> = {
  onPlay(session: GameSession, card: Spell, meta: T): Promise<void>;
  modifiers?: CardModifier<Spell>[];
  isTargetable(session: GameSession, point: Point3D): boolean;
  followup?: {
    minTargetCount: number;
    maxTargetCount: number;
    isTargetable(
      session: GameSession,
      point: Point3D,
      castPoint: Point3D,
      card: Unit
    ): boolean;
  };
};

type CardBlueprintArtifact<T extends AnyObject> = {
  onEquiped(session: GameSession, equipedOn: Entity, meta: T): Promise<void>;
  onRemoved(session: GameSession, equipedOn: Entity, meta: T): Promise<void>;
  modifiers?: CardModifier<Artifact>[];
  followup?: {
    minTargetCount: number;
    maxTargetCount: number;
    isTargetable(
      session: GameSession,
      point: Point3D,
      castPoint: Point3D,
      card: Unit
    ): boolean;
  };
};

export type CardBlueprint<T extends AnyObject = AnyObject> = Prettify<
  | (CardBlueprintBase<T> &
      CardBlueprintArtifact<T> & {
        kind: Extract<CardKind, 'ARTIFACT'>;
      })
  | (CardBlueprintBase<T> &
      CardBlueprintUnit<T> & {
        kind: Extract<CardKind, 'MINION' | 'GENERAL'>;
      })
  | (CardBlueprintBase<T> &
      CardBlueprintSpell<T> & {
        kind: Extract<CardKind, 'SPELL'>;
      })
>;

export const defineBlueprint = <T extends AnyObject>(blueprint: CardBlueprint<T>) =>
  blueprint;

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
