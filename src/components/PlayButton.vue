<script setup lang="ts">
const { isPlaying, toggle } = defineProps<{
  isPlaying: boolean
  toggle: () => void
}>()
</script>

<template>
  <button @click="toggle"
    class="px-4 py-2 border-2 border-black font-bold transition-all active:translate-y-1 active:shadow-none shadow-[4px_4px_0_black]"
    :class="isPlaying ? 'bg-white text-black' : 'bg-[#A1F65E] text-black'">
    {{ isPlaying ? '⏸ 暂停' : '▶ 播放' }}
  </button>
</template>

<style scoped></style>
