import { keyBy } from 'lodash-es';
import type { CardBlueprintId } from './card';
import type { MaybePromise, Point3D, Prettify } from '@game/shared';
import type { GameSession } from '../game-session';
import type { Entity } from '../entity/entity';
import { lyonar } from './cards/lyonar';
import { songhai } from './cards/songhai';
import { vetruvian } from './cards/vetruvian';
import { abyssian } from './cards/abyssian';
import { magmar } from './cards/magmar';
import { vanar } from './cards/vanar';
import { neutral } from './cards/neutral';
import type { CardKind } from './card-utils';
import type { Unit } from './unit';
import type { Spell } from './spell';
import type { CardModifier } from '../modifier/card-modifier';
import type { Artifact } from './artifact';

type CardBlueprintBase = {
  id: CardBlueprintId;
  name: string;
  description: string;
  manaCost: number;
  spriteId: string;
};

type CardBlueprintUnit = {
  attack: number;
  maxHp: number;
  modifiers?: CardModifier<Unit>[];
  onPlay(session: GameSession, card: Unit & { entity: Entity }): MaybePromise<void>;
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

type CardBlueprintSpell = {
  onPlay(session: GameSession, card: Spell): Promise<void>;
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

type CardBlueprintArtifact = {
  onEquiped(session: GameSession, equipedOn: Entity): Promise<void>;
  onRemoved(session: GameSession, equipedOn: Entity): Promise<void>;
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

export type CardBlueprint = Prettify<
  | (CardBlueprintBase &
      CardBlueprintArtifact & {
        kind: Extract<CardKind, 'ARTIFACT'>;
      })
  | (CardBlueprintBase &
      CardBlueprintUnit & {
        kind: Extract<CardKind, 'MINION' | 'GENERAL'>;
      })
  | (CardBlueprintBase &
      CardBlueprintSpell & {
        kind: Extract<CardKind, 'SPELL'>;
      })
>;

const allCards: CardBlueprint[] = [
  ...lyonar,
  ...songhai,
  ...vetruvian,
  ...abyssian,
  ...magmar,
  ...vanar,
  ...neutral
];
export const CARDS: Record<CardBlueprintId, CardBlueprint> = keyBy(allCards, 'id');
