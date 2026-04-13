<script setup lang="ts">
import PlayButton from './PlayButton.vue'
import ProgressBar from './ProgressBar.vue'

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
            <PlayButton :isPlaying="isPlaying" :toggle="toggleAutoPlay" />
          </div>
        </div>
      </div>

      <ProgressBar :progress="progress" />
    </div>
  </header>
</template>
