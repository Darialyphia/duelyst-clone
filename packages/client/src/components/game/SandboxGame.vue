<script setup lang="ts">
import { GameSession, type SerializedGameState } from '@game/sdk';

const WIDTH = 9;
const HEIGHT = 5;
const OFFSET = 3;
const state: SerializedGameState = {
  activeEntityId: null,
  history: [],
  phase: 'battle',

  map: {
    height: HEIGHT,
    width: WIDTH,
    cells: Array.from({ length: HEIGHT }, (_, y) =>
      Array.from({ length: WIDTH }, (_, x) => ({
        position: {
          x: x + OFFSET,
          y: y + OFFSET,
          z: 0
        },
        spriteId: 'ground',
        tileBlueprintId:
          (x === 4 && y === 0) || (x === 4 && y === 4) || (x === 5 && y == 2)
            ? 'mana-tile'
            : null
      }))
    ).flat(),
    player1StartPosition: { x: 0 + OFFSET, y: 2 + OFFSET, z: 0 },
    player2StartPosition: { x: WIDTH - 1 + OFFSET, y: 2 + OFFSET, z: 0 }
  },
  entities: [],
  players: [
    {
      id: '1',
      name: 'Player 1',
      cards: [
        { blueprintId: 'maehv' },
        { blueprintId: 'mana_forger' },
        { blueprintId: 'mana_forger' },
        { blueprintId: 'mana_forger' },
        { blueprintId: 'emerald_rejuvenator' },
        { blueprintId: 'emerald_rejuvenator' },
        { blueprintId: 'emerald_rejuvenator' },
        { blueprintId: 'saberspine_tiger' },
        { blueprintId: 'saberspine_tiger' },
        { blueprintId: 'saberspine_tiger' },
        { blueprintId: 'primus_fist' },
        { blueprintId: 'primus_fist' },
        { blueprintId: 'primus_fist' },
        { blueprintId: 'void_pulse' },
        { blueprintId: 'void_pulse' },
        { blueprintId: 'void_pulse' },
        { blueprintId: 'healing_mystic' },
        { blueprintId: 'healing_mystic' },
        { blueprintId: 'healing_mystic' }
      ],
      isPlayer1: true,
      graveyard: [],
      hasMulliganed: true
    },
    {
      id: '2',
      name: 'Player 2',
      cards: [
        { blueprintId: 'sajj' },
        { blueprintId: 'mana_forger' },
        { blueprintId: 'mana_forger' },
        { blueprintId: 'mana_forger' },
        { blueprintId: 'emerald_rejuvenator' },
        { blueprintId: 'emerald_rejuvenator' },
        { blueprintId: 'emerald_rejuvenator' },
        { blueprintId: 'saberspine_tiger' },
        { blueprintId: 'saberspine_tiger' },
        { blueprintId: 'saberspine_tiger' },
        { blueprintId: 'primus_fist' },
        { blueprintId: 'primus_fist' },
        { blueprintId: 'primus_fist' },
        { blueprintId: 'scions_first_wish' },
        { blueprintId: 'scions_first_wish' },
        { blueprintId: 'scions_first_wish' },
        { blueprintId: 'healing_mystic' },
        { blueprintId: 'healing_mystic' },
        { blueprintId: 'healing_mystic' }
      ],
      isPlayer1: false,
      graveyard: [],
      hasMulliganed: true
    }
  ]
};

const fx = useFXProvider();
const session = GameSession.createClientSession(state, 'seed', fx.ctx);

const dispatch = (
  type: Parameters<(typeof session)['dispatch']>[0]['type'],
  payload: any
) => {
  session.dispatch({
    type,
    payload: {
      ...payload,
      playerId: payload?.playerId ?? session.playerSystem.activePlayer.id
    }
  });
};
</script>

<template>
  <Game
    :game-session="session"
    :player-id="null"
    :game-type="GAME_TYPES.SANDBOX"
    @move="dispatch('move', $event)"
    @attack="dispatch('attack', $event)"
    @end-turn="dispatch('endTurn', $event)"
    @use-skill="dispatch('useSkill', $event)"
    @play-card="dispatch('playCard', $event)"
    @replace-card="dispatch('replaceCard', $event)"
    @mulligan="dispatch('mulligan', $event)"
  />
</template>
