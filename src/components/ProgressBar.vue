<script setup lang="ts">
const { progress } = defineProps<{
  progress: number
}>()
</script>

<template>
  <div class="mt-4 h-4 bg-white border-2 border-black overflow-hidden flex shadow-[2px_2px_0_black]">
    <div class="h-full bg-[#A1F65E] transition-all duration-500 border-r-2 border-black"
      :style="{ width: `${progress}%` }"></div>
  </div>
</template>

<style scoped></style>
