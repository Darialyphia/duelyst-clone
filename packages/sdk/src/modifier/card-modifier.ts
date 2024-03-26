import { type MaybePromise, type PartialBy, type Prettify } from '@game/shared';
import type { GameSession } from '../game-session';
import { nanoid } from 'nanoid';
import type { AnyCard } from '../card/card';

export type ModifierId = string;

type ModifierBase<T extends AnyCard> = {
  id: ModifierId;
  onApplied(
    session: GameSession,
    attachedTo: T,
    modifier: CardModifier<T>
  ): MaybePromise<void>;
  onRemoved(
    session: GameSession,
    attachedTo: T,
    modifier: CardModifier<T>
  ): MaybePromise<void>;
};

export type CardModifier<T extends AnyCard> = Prettify<ModifierBase<T>>;

export type CardModifierMixin<T extends AnyCard> = Partial<
  Pick<CardModifier<T>, 'onApplied' | 'onRemoved'>
>;

type ModifierBuilderOptions<T extends AnyCard> = PartialBy<
  Pick<CardModifier<T>, 'id'>,
  'id'
> & {
  mixins: CardModifierMixin<T>[];
};

export const createCardModifier = <T extends AnyCard>({
  mixins,
  ...options
}: ModifierBuilderOptions<T>): CardModifier<T> => {
  return {
    ...options,
    id: options.id ?? nanoid(6),
    async onApplied(session, attachedTo) {
      for (const mixin of mixins) {
        mixin.onApplied?.(session, attachedTo, this);
      }
    },
    async onRemoved(session, attachedTo) {
      for (const mixin of mixins) {
        mixin.onRemoved?.(session, attachedTo, this);
      }
    }
  } as CardModifier<T>;
};
