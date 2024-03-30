<script setup lang="ts">
import { GameSession, type SerializedGameState } from '@game/sdk';

const WIDTH = 9;
const HEIGHT = 5;
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
          x,
          y,
          z: 0
        },
        spriteId: 'ground',
        tileBlueprintId:
          (x === 4 && y === 0) || (x === 4 && y === 4) || (x === 5 && y == 2)
            ? 'mana-tile'
            : null
      }))
    ).flat(),
    player1StartPosition: { x: 0, y: 2, z: 0 },
    player2StartPosition: { x: WIDTH - 1, y: 2, z: 0 }
  },
  entities: [],
  players: [
    {
      id: '1',
      name: 'Player 1',
      cards: [
        { blueprintId: 'maehv' },
        { blueprintId: 'dancing_blades' },
        { blueprintId: 'dancing_blades' },
        { blueprintId: 'dancing_blades' },
        { blueprintId: 'rift_walker' },
        { blueprintId: 'rift_walker' },
        { blueprintId: 'rift_walker' },
        { blueprintId: 'blaze_hound' },
        { blueprintId: 'blaze_hound' },
        { blueprintId: 'blaze_hound' },
        { blueprintId: 'ghost_lynx' },
        { blueprintId: 'ghost_lynx' },
        { blueprintId: 'ghost_lynx' },
        { blueprintId: 'flameblood_warlock' },
        { blueprintId: 'flameblood_warlock' },
        { blueprintId: 'flameblood_warlock' },
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
        { blueprintId: 'dancing_blades' },
        { blueprintId: 'dancing_blades' },
        { blueprintId: 'dancing_blades' },
        { blueprintId: 'rift_walker' },
        { blueprintId: 'rift_walker' },
        { blueprintId: 'rift_walker' },
        { blueprintId: 'blaze_hound' },
        { blueprintId: 'blaze_hound' },
        { blueprintId: 'blaze_hound' },
        { blueprintId: 'ghost_lynx' },
        { blueprintId: 'ghost_lynx' },
        { blueprintId: 'ghost_lynx' },
        { blueprintId: 'flameblood_warlock' },
        { blueprintId: 'flameblood_warlock' },
        { blueprintId: 'flameblood_warlock' },
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
