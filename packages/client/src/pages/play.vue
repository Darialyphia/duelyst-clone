<script setup lang="ts">
import bg from '../assets/backgrounds/spire.jpg';

definePageMeta({
  middleware: ['auth'],
  layout: 'fullscreen',
  colorMode: 'dark',
  pageTransition: { mode: 'out-in' }
});
</script>

<template>
  <div :style="{ '--bg': `url(${bg})` }" class="root">
    <UsernameModal />
    <NuxtPage />
  </div>
</template>

<style scoped lang="postcss">
.root {
  min-height: 100vh;
  background: var(--bg);
  background-attachment: fixed;
  background-size: cover;
}
</style>
