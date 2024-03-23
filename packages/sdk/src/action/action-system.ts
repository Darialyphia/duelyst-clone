import { GameAction, type DefaultSchema, type SerializedAction } from './action';
import { GameSession } from '../game-session';
import type {
  AnyAsyncFunction,
  AnyFunction,
  Constructor,
  MaybePromise,
  Serializable
} from '@game/shared';
import { AttackAction } from './attack.action';
import { EndTurnAction } from './end-turn.action';
import { MoveAction } from './move.action';
import { PlayCardAction } from './play-card.action';
import { ReplaceCardAction } from './replace-card.action';
import { MulliganAction } from './mulligan.action';

type GenericActionMap = Record<string, Constructor<GameAction<DefaultSchema>>>;

type ValidatedActionMap<T extends GenericActionMap> = {
  [Name in keyof T]: T[Name] extends Constructor<GameAction<DefaultSchema>>
    ? Name extends InstanceType<T[Name]>['name']
      ? T[Name]
      : never
    : never;
};

const validateActionMap = <T extends GenericActionMap>(data: ValidatedActionMap<T>) =>
  data;

const actionMap = validateActionMap({
  attack: AttackAction,
  endTurn: EndTurnAction,
  move: MoveAction,
  playCard: PlayCardAction,
  replaceCard: ReplaceCardAction,
  mulligan: MulliganAction
});

type ScheduledAction = () => MaybePromise<void>;
export class ActionSystem implements Serializable {
  private history: GameAction<any>[] = [];

  private scheduledActions: ScheduledAction[] = [];

  constructor(private session: GameSession) {}

  async setup(rawHistory: SerializedAction[]) {
    for (const action of rawHistory) {
      await this.dispatch(action);
    }
  }

  private isActionType(type: string): type is keyof typeof actionMap {
    return Object.keys(actionMap).includes(type);
  }

  schedule(fn: ScheduledAction) {
    this.scheduledActions.push(fn);
  }

  private async flushSchedule() {
    for (const fn of this.scheduledActions) {
      await fn();
    }

    this.scheduledActions = [];
  }

  async dispatch({ type, payload }: SerializedAction) {
    if (!this.isActionType(type)) return;
    console.log(`%c[${type}]`, 'color: blue', payload);
    const ctor = actionMap[type];
    const action = new ctor(payload, this.session);
    await action.execute();
    await this.flushSchedule();

    this.history.push(action);
    this.session.emit('game:action', action);
  }

  getHistory() {
    return [...this.history];
  }

  serialize() {
    return this.history.map(action => action.serialize());
  }
}
