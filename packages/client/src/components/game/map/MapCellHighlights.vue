<script setup lang="ts">
import type { Cell } from '@game/sdk';

const { cell } = defineProps<{ cell: Cell }>();
</script>

<template>
  <MovementHighlight :cell="cell" />
  <DangerHighlight :cell="cell" />
  <SummonHighlight :cell="cell" />
  <FollowupHighlight :cell="cell" />
  <PathHighlight :cell-id="cell.id" />
</template>
