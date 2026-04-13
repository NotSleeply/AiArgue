<script setup lang="ts">
import { computed } from 'vue'
const { title, round, side } = defineProps<{
  title: string
  round: number
  side: 'positive' | 'negative'
}>()

const headerBg = computed(() => {
  return side === 'positive' ? 'bg-[#A1F65E]' : 'bg-[#A1F65E]'
})
</script>

<template>
  <div class="px-6 py-4 border-b-2 border-black" :class="headerBg">
    <div class="flex items-start justify-between gap-4">
      <div>
        <span class="inline-block px-2 py-1 text-xs font-bold rounded-none border border-black bg-white mb-2 text-black"
          style="box-shadow: 2px 2px 0px black;">
          第 {{ round }} 轮
        </span>
        <h3 class="text-lg font-black text-black leading-tight">
          {{ title }}
        </h3>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
