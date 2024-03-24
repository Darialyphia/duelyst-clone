import { z } from 'zod';
import { GAME_PHASES } from '../game-session';
import { GameAction, defaultActionSchema } from './action';
import { match, P } from 'ts-pattern';
import { Unit } from '../card/unit';
import { Spell } from '../card/spell';
import { Artifact } from '../card/artifact';
import { isDefined } from '@game/shared';
import { config } from '../config';

const schema = defaultActionSchema.extend({
  cardIndex: z
    .number()
    .nonnegative()
    .max(config.MAX_HAND_SIZE - 1),
  position: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number()
    })
    .optional(),
  targets: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number()
    })
    .array()
    .optional()
});

export class PlayCardAction extends GameAction<typeof schema> {
  readonly name = 'playCard';
  protected phase = GAME_PHASES.BATTLE;

  protected payloadSchema = schema;

  async impl() {
    if (!this.player.canPlayCardAtIndex(this.payload.cardIndex)) {
      console.error(`Not enough mana to play card at index ${this.payload.cardIndex}`);
      return;
    }

    const card = this.player.getCardFromHand(this.payload.cardIndex);
    if (!card) return;

    const { position, targets } = this.payload;

    this.player.currentMana -= card.manaCost;
    await match(card)
      .with(P.instanceOf(Unit), async card => {
        if (isDefined(position) && isDefined(targets)) {
          return card.play({ position, targets });
        }
      })
      .with(P.instanceOf(Spell), async card => {
        if (isDefined(targets) && isDefined(position)) {
          return card.play({ position, targets });
        }
      })
      .with(P.instanceOf(Artifact), async card => {
        return card.play({
          equipedOn: this.session.playerSystem.activePlayer.general
        });
      });

    this.player.hand[this.payload.cardIndex] = null;
  }
}
