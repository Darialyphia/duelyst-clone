import { keyBy } from 'lodash-es';
import type { CardBlueprintId } from './card';
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
};

type CardBlueprintSpell = {
  onPlay(session: GameSession, targets: Point3D[]): Promise<void>;
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
