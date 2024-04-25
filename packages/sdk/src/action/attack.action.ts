import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { GAME_PHASES } from '../game-session';

const schema = defaultActionSchema.extend({
  entityId: z.number(),
  targetId: z.number()
});

export class AttackAction extends GameAction<typeof schema> {
  readonly name = 'attack';
  protected phase = GAME_PHASES.BATTLE;

  protected payloadSchema = schema;

  get attacker() {
    const entity = this.session.entitySystem.getEntityById(this.payload.entityId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.entityId}`);
    return entity;
  }

  get target() {
    const entity = this.session.entitySystem.getEntityById(this.payload.targetId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.targetId}`);
    return entity;
  }

  async impl() {
    if (!this.target.canBeAttacked(this.attacker)) return;
    if (!this.attacker.canAttack(this.target)) return;

    await this.attacker.performAttack(this.target);
  }
}
