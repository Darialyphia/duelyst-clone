import { z } from 'zod';
import { GAME_PHASES } from '../game-session';
import { GameAction, defaultActionSchema } from './action';
import { config } from '../config';

const schema = defaultActionSchema.extend({
  cardIndices: z.number().positive().max(config.MAX_HAND_SIZE).array()
});

export class MulliganAction extends GameAction<typeof schema> {
  readonly name = 'mulligan';
  protected phase = GAME_PHASES.MULLIGAN;

  protected payloadSchema = schema;

  async impl() {
    if (this.player.hasMulliganed) return;
    this.payload.cardIndices.forEach(index => {
      this.player.replaceCard(index);
    });

    this.player.hasMulliganed = true;

    const shouldSwitchToBattlePhase = this.session.playerSystem
      .getList()
      .every(player => player.hasMulliganed);

    if (shouldSwitchToBattlePhase) {
      this.session.phase = GAME_PHASES.BATTLE;
    }
  }
}
