import { z } from 'zod';
import { GAME_PHASES } from '../game-session';
import { GameAction, defaultActionSchema } from './action';
import { config } from '../config';

const schema = defaultActionSchema.extend({
  cardIndex: z
    .number()
    .positive()
    .max(config.MAX_HAND_SIZE - 1)
});

export class ReplaceCardAction extends GameAction<typeof schema> {
  readonly name = 'replaceCard';
  protected phase = GAME_PHASES.BATTLE;

  protected payloadSchema = schema;

  async impl() {
    this.player.replaceCard(this.payload.cardIndex);
  }
}
