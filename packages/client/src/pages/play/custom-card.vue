<script setup lang="ts">
definePageMeta({
  name: 'CustomCardPage'
});
</script>

<template>
  <div class="h-screen grid place-content-center">
    <BackButton class="absolute top-0 left-0" />
    <ClientOnly>
      <CustomCardForm />
      <template #fallback><div /></template>
    </ClientOnly>
  </div>
</template>
