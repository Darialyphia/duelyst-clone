import { keyBy } from 'lodash-es';
import type { Card, CardBlueprintId } from './card';
import type { Point3D, Prettify } from '@game/shared';
import type { Modifier } from '../modifier/modifier';
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
  modifiers: Modifier[];
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
  onPlay(
    session: GameSession,
    castPoint: Point3D,
    otherTargets: Point3D[],
    card: Spell
  ): Promise<void>;
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
