<script setup lang="ts">
const props = defineProps<{
  side: 'positive' | 'negative'
  name: string
  tagline?: string
}>()
</script>

<template>
  <div class="flex items-center gap-3 mb-4 border-2 border-black p-2 bg-white shadow-[4px_4px_0_black]">
    <span class="text-3xl">{{ props.side === 'positive' ? '🔵' : '🔴' }}</span>
    <div>
      <h2 class="text-xl font-black text-black uppercase">{{ props.name }}</h2>
      <p class="text-sm font-bold text-black border-t-2 border-black pt-1 mt-1">{{ props.tagline }}</p>
    </div>
  </div>
</template>

<style scoped></style>
