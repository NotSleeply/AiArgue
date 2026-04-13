<script setup lang="ts">
import type { DebateRound } from '../data/debate'

defineProps<{
  rounds: DebateRound[]
  currentIndex: number
}>()

const emit = defineEmits<{
  select: [index: number]
}>()
</script>

<template>
  <div class="relative">
    <div class="flex items-center justify-between overflow-x-auto pb-4 gap-2">
      <button v-for="(round, index) in rounds" :key="round.round" @click="emit('select', index)"
        class="relative flex-shrink-0 group">
        <!-- 连接线 -->
        <div v-if="index < rounds.length - 1" class="absolute top-4 left-full w-4 md:w-8 h-0.5 -translate-y-1/2 z-0"
          :class="index < currentIndex ? 'bg-purple-500' : 'bg-slate-700'"></div>

        <!-- 节点 -->
        <div
          class="relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10"
          :class="[
            index === currentIndex
              ? 'bg-purple-500 text-white scale-125 shadow-lg shadow-purple-500/50'
              : index < currentIndex
                ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50'
                : 'bg-slate-700 text-slate-400 border-2 border-slate-600'
          ]">
          <span v-if="index < currentIndex">OK</span>
          <span v-else>{{ round.round }}</span>
        </div>

        <!-- 标签 -->
        <div class="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span class="text-xs transition-all duration-300"
            :class="index === currentIndex ? 'text-purple-400 font-medium' : 'text-slate-500'">
            第{{ round.round }}轮
          </span>
        </div>
      </button>
    </div>

    <!-- 进度指示器 -->
    <div class="flex justify-center gap-1 mt-12">
      <div v-for="(round, index) in rounds" :key="'dot-' + round.round"
        class="w-2 h-2 rounded-full transition-all duration-300" :class="[
          index === currentIndex ? 'bg-purple-500 w-4' : '',
          index < currentIndex ? 'bg-green-500' : 'bg-slate-600'
        ]"></div>
    </div>
  </div>
</template>
