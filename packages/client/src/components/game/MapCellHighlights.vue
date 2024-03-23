<script setup lang="ts">
import { isDefined } from '@game/shared';
import type { Cell } from '@game/sdk';
import { match } from 'ts-pattern';
import { PTransition } from 'vue3-pixi';
import { Unit } from '@game/sdk/src/card/unit';

const { cell } = defineProps<{ cell: Cell }>();
const { session, assets, camera, ui, pathfinding, fx } = useGame();
const activePlayer = useGameSelector(session => session.playerSystem.activePlayer);
const phase = useGameSelector(session => session.phase);

const movementTileset = computed(() => assets.getSpritesheet('bitmask-movement-ally'));
const attackTileset = computed(() => assets.getSpritesheet('bitmask-danger'));
const summonTileset = computed(() => assets.getSpritesheet('deploy-zone'));

const matchMovement = (cellToTest: Cell) => {
  if (phase.value !== 'battle') return false;

  return match(ui.targetingMode.value)
    .with(TARGETING_MODES.FOLLOWUP, TARGETING_MODES.SUMMON, () => false)
    .with(TARGETING_MODES.BASIC, () => {
      return pathfinding.canMoveTo(ui.selectedEntity.value!, cellToTest);
    })
    .with(TARGETING_MODES.NONE, () => {
      if (!ui.hoveredEntity.value) return false;
      if (!ui.hoveredEntity.value.player.equals(activePlayer.value)) return false;

      return pathfinding.canMoveTo(ui.hoveredEntity.value, cellToTest);
    })
    .exhaustive();
};

const matchAttack = (cell: Cell) => {
  if (phase.value !== 'battle') return false;
  return match(ui.targetingMode.value)
    .with(
      TARGETING_MODES.BASIC,
      TARGETING_MODES.SUMMON,
      TARGETING_MODES.FOLLOWUP,
      () => false
    )
    .with(TARGETING_MODES.NONE, () => {
      if (!ui.hoveredEntity.value) return false;
      if (ui.hoveredEntity.value.player.equals(activePlayer.value)) return false;

      return pathfinding.canAttackAt(ui.hoveredEntity.value, cell);
    })
    .exhaustive();
};

const matchFollowup = (cell: Cell) => {
  if (phase.value !== 'battle') return false;
  return match(ui.targetingMode.value)
    .with(
      TARGETING_MODES.BASIC,
      TARGETING_MODES.SUMMON,
      TARGETING_MODES.NONE,
      () => false
    )
    .with(TARGETING_MODES.FOLLOWUP, () => {
      if (!ui.selectedCard.value) return false;
      if (!(ui.selectedCard.value instanceof Unit)) return false;

      return (
        ui.selectedCard.value.blueprint.summonedFollowup?.isTargetable(
          session,
          cell,
          ui.summonTarget.value!,
          ui.selectedCard.value
        ) ?? false
      );
    })
    .exhaustive();
};

const matchSummon = (cell: Cell) => {
  if (ui.targetingMode.value !== TARGETING_MODES.SUMMON) return false;
  if (!ui.selectedCard.value) return false;
  if (!(ui.selectedCard.value instanceof Unit)) return false;

  return ui.selectedCard.value.canSummonAt(cell.position);
};

const isMovementDisplayed = computed(() => !fx.isPlaying.value && matchMovement(cell));
const isAttackDisplayed = computed(() => !fx.isPlaying.value && matchAttack(cell));
const isSummonDisplayed = computed(() => !fx.isPlaying.value && matchSummon(cell));
const isFollowupDisplayed = computed(() => !fx.isPlaying.value && matchFollowup(cell));

const movementBitmask = computed(() => {
  return getBitMask(session, cell, camera.angle.value, neighbor => {
    if (!neighbor) return false;

    return matchMovement(neighbor);
  });
});

const attackBitmask = computed(() => {
  return getBitMask(session, cell, camera.angle.value, neighbor => {
    if (!neighbor) return false;

    return matchAttack(neighbor);
  });
});

const summonBitmask = computed(() => {
  return getBitMask(session, cell, camera.angle.value, neighbor => {
    if (!neighbor) return false;

    return matchSummon(neighbor);
  });
});

const followupBitmask = computed(() => {
  return getBitMask(session, cell, camera.angle.value, neighbor => {
    if (!neighbor) return false;

    return matchFollowup(neighbor);
  });
});

const movementTexture = computed(() => {
  if (!isDefined(movementBitmask.value)) return;

  return getTextureIndexFromBitMask(movementBitmask.value, movementTileset.value);
});

const dangerTexture = computed(() => {
  if (!isDefined(attackBitmask.value)) return;

  return getTextureIndexFromBitMask(attackBitmask.value, attackTileset.value);
});

const summonTexture = computed(() => {
  if (!isDefined(summonBitmask.value)) return;

  return getTextureIndexFromBitMask(summonBitmask.value, summonTileset.value);
});

const followupTexture = computed(() => {
  if (!isDefined(followupBitmask.value)) return;

  return getTextureIndexFromBitMask(followupBitmask.value, summonTileset.value);
});

const { autoDestroyRef } = useAutoDestroy();
</script>

<template>
  <PTransition
    appear
    :duration="{ enter: 300, leave: 300 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
    :leave="{ alpha: 0 }"
  >
    <container
      v-if="movementTexture && isMovementDisplayed"
      :ref="container => autoDestroyRef(container)"
      event-mode="none"
    >
      <sprite :texture="movementTexture" :anchor="0.5" />
    </container>
  </PTransition>

  <PTransition
    appear
    :duration="{ enter: 300, leave: 300 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
    :leave="{ alpha: 0 }"
  >
    <container
      v-if="dangerTexture && isAttackDisplayed"
      :ref="container => autoDestroyRef(container)"
      event-mode="none"
    >
      <sprite :texture="dangerTexture" :anchor="0.5" />
    </container>
  </PTransition>

  <PTransition
    appear
    :duration="{ enter: 300, leave: 300 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
    :leave="{ alpha: 0 }"
  >
    <container
      v-if="summonTexture && isSummonDisplayed"
      :ref="container => autoDestroyRef(container)"
      event-mode="none"
    >
      <sprite :texture="summonTexture" :anchor="0.5" />
    </container>
  </PTransition>

  <PTransition
    appear
    :duration="{ enter: 300, leave: 300 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
    :leave="{ alpha: 0 }"
  >
    <container
      v-if="followupTexture && isFollowupDisplayed"
      :ref="container => autoDestroyRef(container)"
      event-mode="none"
    >
      <sprite :texture="followupTexture" :anchor="0.5" />
    </container>
  </PTransition>
</template>
