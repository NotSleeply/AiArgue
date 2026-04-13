<script setup lang="ts">
const { source, time } = defineProps<{
  source: string
  time: string
}>()
</script>

<template>
  <div class="px-6 py-3 border-t-2 border-black bg-[#F3F4F6]">
    <div class="flex items-center justify-between text-xs font-bold text-black uppercase">
      <span>来源: {{ source }}</span>
      <span>{{ time }}</span>
    </div>
  </div>
</template>

<style scoped></style>
