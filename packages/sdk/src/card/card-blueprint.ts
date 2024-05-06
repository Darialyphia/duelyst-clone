import type { AnyObject, MaybePromise, Point3D, Prettify } from '@game/shared';
import type { Faction } from '..';
import type { Entity } from '../entity/entity';
import type { GameSession } from '../game-session';
import type { CardModifier } from '../modifier/card-modifier';
import type { Artifact } from './artifact';
import type { Tribe, CardKind, Rarity } from './card-utils';
import type { Spell } from './spell';
import type { Unit } from './unit';
import type { CardBlueprintId } from './card';

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
