import type { MaybePromise } from '@game/shared';
import type { CharacterBlueprint } from '../entity/character-blueprint';
import type { Entity } from '../entity/entity';
import type { GameSession } from '../game-session';
import type { Keyword } from '../utils/keywords';

export type ModifierDescriptionContext = Pick<
  CharacterBlueprint,
  'attack' | 'initiative' | 'maxHp' | 'maxAp' | 'spellPower' | 'speed'
>;

export type ModifierId = string;

type ModifierBase = {
  id: ModifierId;
  name: string;
  iconId: string;
  keywords: Keyword[];
  description: string;
  onApplied(session: GameSession, attachedTo: Entity): MaybePromise<void>;
  onRemoved(session: GameSession, attachedTo: Entity): MaybePromise<void>;
};

type StackableMixin =
  | {
      stackable: true;
      stacks: number;
    }
  | {
      stackable: false;
      stacks?: never;
      onReapply(session: GameSession, attachedTo: Entity): MaybePromise<void>;
    };

export type Modifier = ModifierBase & StackableMixin;

export type ModifierMixin = Partial<
  Pick<
    Modifier & { stackable: false },
    'keywords' | 'onApplied' | 'onRemoved' | 'onReapply'
  >
>;

type ModifierBuilderOptions = Pick<Modifier, 'id' | 'description' | 'iconId' | 'name'> &
  Omit<StackableMixin, 'onReapply'> & { mixins: ModifierMixin[] };

export const createModifier = ({
  mixins,
  ...options
}: ModifierBuilderOptions): Modifier => {
  return {
    ...options,
    keywords: [...new Set(mixins.map(m => m.keywords).flat())],
    async onApplied(session, attachedTo) {
      for (const mixin of mixins) {
        mixin.onApplied?.(session, attachedTo);
      }
    },
    async onRemoved(session, attachedTo) {
      for (const mixin of mixins) {
        mixin.onRemoved?.(session, attachedTo);
      }
    },
    async onReapply(session, attachedTo) {
      for (const mixin of mixins) {
        mixin.onReapply?.(session, attachedTo);
      }
    }
  } as Modifier;
};
