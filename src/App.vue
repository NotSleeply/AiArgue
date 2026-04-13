<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { selectedRounds, debateTitle, positiveName, negativeName, totalRounds, finalConclusion } from './data/debate'
import ArgumentCard from './components/ArgumentCard.vue'
import DebateTimeline from './components/DebateTimeline.vue'
import FinalResult from './components/FinalResult.vue'

const currentRoundIndex = ref(0)
const isPlaying = ref(false)
const autoPlayInterval = ref<number | null>(null)
const showFullContent = ref(false)

const currentRound = computed(() => selectedRounds.value[currentRoundIndex.value])
const progress = computed(() => ((currentRoundIndex.value + 1) / selectedRounds.value.length) * 100)
const roundNumber = computed(() => currentRound.value.round)

const goToRound = (index: number) => {
  currentRoundIndex.value = Math.max(0, Math.min(index, selectedRounds.value.length - 1))
  showFullContent.value = false
}

const nextRound = () => {
  if (currentRoundIndex.value < selectedRounds.value.length - 1) {
    currentRoundIndex.value++
    showFullContent.value = false
  } else {
    stopAutoPlay()
  }
}

const prevRound = () => {
  if (currentRoundIndex.value > 0) {
    currentRoundIndex.value--
    showFullContent.value = false
  }
}

const toggleAutoPlay = () => {
  if (isPlaying.value) {
    stopAutoPlay()
  } else {
    startAutoPlay()
  }
}

const startAutoPlay = () => {
  isPlaying.value = true
  autoPlayInterval.value = window.setInterval(() => {
    if (currentRoundIndex.value < selectedRounds.value.length - 1) {
      nextRound()
    } else {
      stopAutoPlay()
    }
  }, 8000)
}

const stopAutoPlay = () => {
  isPlaying.value = false
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value)
    autoPlayInterval.value = null
  }
}

const toggleContent = () => {
  showFullContent.value = !showFullContent.value
}

onMounted(() => {
  // Cleanup on unmount
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
    <!-- Header -->
    <header class="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-purple-500/20">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ⚔️ AI 辩论赛
            </h1>
            <p class="text-slate-400 text-sm mt-1">{{ debateTitle }}</p>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-slate-400 text-sm">
              第 {{ roundNumber }} 轮 / 共 {{ totalRounds }} 轮
            </span>
            <div class="flex gap-2">
              <button
                @click="toggleAutoPlay"
                class="px-4 py-2 rounded-lg font-medium transition-all"
                :class="isPlaying 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'"
              >
                {{ isPlaying ? '⏸ 暂停' : '▶ 播放' }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Progress bar -->
        <div class="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <!-- Round selector -->
      <div class="mb-8">
        <DebateTimeline 
          :rounds="selectedRounds"
          :current-index="currentRoundIndex"
          @select="goToRound"
        />
      </div>

      <!-- Debate content -->
      <div class="grid md:grid-cols-2 gap-8 mb-8">
        <!-- Positive side -->
        <div class="space-y-4">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">🔵</span>
            <div>
              <h2 class="text-xl font-bold text-blue-400">{{ positiveName }}</h2>
              <p class="text-sm text-blue-400/70">AI应该取代人类</p>
            </div>
          </div>
          <ArgumentCard 
            :argument="currentRound.positive"
            :round="currentRound.round"
            side="positive"
            :expanded="showFullContent"
          />
        </div>

        <!-- Negative side -->
        <div class="space-y-4">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">🔴</span>
            <div>
              <h2 class="text-xl font-bold text-red-400">{{ negativeName }}</h2>
              <p class="text-sm text-red-400/70">AI不应该取代人类</p>
            </div>
          </div>
          <ArgumentCard 
            :argument="currentRound.negative"
            :round="currentRound.round"
            side="negative"
            :expanded="showFullContent"
          />
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex items-center justify-between mb-8">
        <button
          @click="prevRound"
          :disabled="currentRoundIndex === 0"
          class="px-6 py-3 rounded-lg font-medium bg-slate-700/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          ← 上一轮
        </button>
        
        <button
          @click="toggleContent"
          class="px-6 py-3 rounded-lg font-medium bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-all"
        >
          {{ showFullContent ? '收起详情' : '展开详情' }}
        </button>
        
        <button
          @click="nextRound"
          :disabled="currentRoundIndex === selectedRounds.length - 1"
          class="px-6 py-3 rounded-lg font-medium bg-slate-700/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          下一轮 →
        </button>
      </div>

      <!-- Final result -->
      <FinalResult />
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-700/50 py-8 mt-12">
      <div class="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
        <p>⚔️ AI 辩论赛 | 60轮精彩辩论 | 最终结论：{{ finalConclusion.winner }}获胜</p>
        <p class="mt-2">Powered by AI vs AI</p>
      </div>
    </footer>
  </div>
</template>
