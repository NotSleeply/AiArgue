<script setup lang="ts">
const { debateTitle, roundNumber, totalRounds, isPlaying, toggleAutoPlay, progress } = defineProps<{
  debateTitle: string
  roundNumber: number
  totalRounds: number
  isPlaying: boolean
  toggleAutoPlay: () => void
  progress: number
}>()
</script>

<template>
  <header class="sticky top-0 z-50 bg-white border-b-4 border-black font-bold">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black uppercase tracking-tight text-black border-b-2 border-black inline-block">
            ⚔️ AI 辩论赛
          </h1>
          <p class="text-black font-bold text-sm mt-1">{{ debateTitle }}</p>
        </div>
        <div class="flex items-center gap-4">
          <span
            class="text-black font-bold text-sm border-2 border-black px-2 py-1 rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white">
            第 {{ roundNumber }} 轮 / 共 {{ totalRounds }} 轮
          </span>
          <div class="flex gap-2">
            <button @click="toggleAutoPlay"
              class="px-4 py-2 border-2 border-black font-bold transition-all active:translate-y-1 active:shadow-none shadow-[4px_4px_0_black]"
              :class="isPlaying ? 'bg-white text-black' : 'bg-[#A1F65E] text-black'">
              {{ isPlaying ? '⏸ 暂停' : '▶ 播放' }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-4 h-4 bg-white border-2 border-black overflow-hidden flex shadow-[2px_2px_0_black]">
        <div class="h-full bg-[#A1F65E] transition-all duration-500 border-r-2 border-black"
          :style="{ width: `${progress}%` }"></div>
      </div>
    </div>
  </header>
</template>
