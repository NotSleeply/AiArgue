<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { selectedRounds, debateTitle, positiveName, negativeName, totalRounds, finalConclusion, loadRoundContent, prefetchRound, ensureManifestLoaded } from './data/debate'
// import leftAvatarUrl from './assets/left-avatar.svg?url'
// import rightAvatarUrl from './assets/right-avatar.svg?url'
import ArgumentCard from './components/ArgumentCard.vue'
import DebateTimeline from './components/DebateTimeline.vue'
import FinalResult from './components/FinalResult.vue'

const currentRoundIndex = ref(0)
const isPlaying = ref(false)
const autoPlayInterval = ref<number | null>(null)
const showFullContent = ref(false)
const activeSide = ref<'positive' | 'negative'>('positive')

const activate = (side: 'positive' | 'negative') => {
  activeSide.value = side
}

const currentRound = computed(() => selectedRounds.value[currentRoundIndex.value] || null)
const progress = computed(() => ((currentRoundIndex.value + 1) / (selectedRounds.value.length || 1)) * 100)
const roundNumber = computed(() => currentRound.value?.round || 1)

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

onMounted(async () => {
  // 初始加载 manifest，然后加载第一个回合并预取下一回合
  await ensureManifestLoaded()
  const initialRound = selectedRounds.value[0]?.round
  if (initialRound) await loadRoundContent(initialRound)
  const next = selectedRounds.value[1]?.round
  if (next) prefetchRound(next)
  // 默认 active side 基于第一回合奇偶
  if (initialRound) {
    activeSide.value = (initialRound % 2 === 1) ? 'positive' : 'negative'
  }
})

watch(currentRoundIndex, (newIdx) => {
  const round = selectedRounds.value[newIdx]?.round
  if (round) loadRoundContent(round)
  const next = selectedRounds.value[newIdx + 1]?.round
  if (next) prefetchRound(next)
  // 切换回合时，基于轮号改变 speaking side
  if (round) activeSide.value = (round % 2 === 1) ? 'positive' : 'negative'
})

// 当 selectedRounds 列表首次填充时，加载第一个回合并预取下一个
watch(selectedRounds, (val) => {
  if (val && val.length > 0) {
    const firstRound = val[0].round
    if (firstRound) loadRoundContent(firstRound)
    const next = val[1]?.round
    if (next) prefetchRound(next)
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#F3F4F6] text-black font-sans">
    <!-- Header -->
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
                :class="isPlaying
                  ? 'bg-white text-black'
                  : 'bg-[#A1F65E] text-black'">
                {{ isPlaying ? '⏸ 暂停' : '▶ 播放' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mt-4 h-4 bg-white border-2 border-black overflow-hidden flex shadow-[2px_2px_0_black]">
          <div class="h-full bg-[#A1F65E] transition-all duration-500 border-r-2 border-black"
            :style="{ width: `${progress}%` }"></div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <!-- Debate content -->
      <div v-if="currentRound" class="relative">
        <!-- 左侧人物（固定在边缘） -->
        <div class="character left" :class="{ 'active': activeSide === 'positive' }" @click="activate('positive')">
          <svg viewBox="0 0 200 400" preserveAspectRatio="none" fill="black">
            <!-- Menacing silhouette facing right -->
            <path
              d="M-50,400 L120,400 C150,350 180,300 170,250 C160,200 120,180 100,150 C80,120 70,80 90,40 C100,20 80,-10 30,-20 L-50,-20 Z" />
          </svg>
        </div>
        <!-- 右侧人物（固定在边缘） -->
        <div class="character right" :class="{ 'active': activeSide === 'negative' }" @click="activate('negative')">
          <svg viewBox="0 0 200 400" preserveAspectRatio="none" fill="black">
            <!-- Menacing silhouette facing left -->
            <path
              d="M250,400 L80,400 C50,350 20,300 30,250 C40,200 80,180 100,150 C120,120 130,80 110,40 C100,20 120,-10 170,-20 L250,-20 Z" />
          </svg>
        </div>

        <div class="flex flex-col md:flex-row gap-8 mb-8 relative sides-container">
          <!-- Positive side -->
          <div class="space-y-4 side-wrap positive-wrap relative" :class="{ 'speaking': activeSide === 'positive' }"
            @click="activate('positive')">
            <div class="flex items-center gap-3 mb-4 border-2 border-black p-2 bg-white shadow-[4px_4px_0_black]">
              <span class="text-3xl">🔵</span>
              <div>
                <h2 class="text-xl font-black text-black uppercase">{{ positiveName }}</h2>
                <p class="text-sm font-bold text-black border-t-2 border-black pt-1 mt-1">AI应该取代人类</p>
              </div>
            </div>
            <ArgumentCard :argument="currentRound.positive" :round="currentRound.round" side="positive"
              :expanded="showFullContent" />
          </div>

          <!-- Negative side -->
          <div class="space-y-4 side-wrap negative-wrap relative" :class="{ 'speaking': activeSide === 'negative' }"
            @click="activate('negative')">
            <div class="flex items-center gap-3 mb-4 border-2 border-black p-2 bg-white shadow-[4px_4px_0_black]">
              <span class="text-3xl">🔴</span>
              <div>
                <h2 class="text-xl font-black text-black uppercase">{{ negativeName }}</h2>
                <p class="text-sm font-bold text-black border-t-2 border-black pt-1 mt-1">AI不应该取代人类</p>
              </div>
            </div>
            <ArgumentCard :argument="currentRound.negative" :round="currentRound.round" side="negative"
              :expanded="showFullContent" />
          </div>
          <!-- Navigation -->
        </div>
      </div>

      <!-- Fixed Navigation Buttons (Side) -->
      <button @click="prevRound" :disabled="currentRoundIndex === 0"
        class="fixed left-2 md:left-6 top-1/2 -translate-y-1/2 z-50 px-2 py-4 md:px-4 md:py-8 text-lg md:text-2xl font-black bg-white border-4 border-black hover:bg-[#A1F65E] disabled:opacity-50 disabled:hover:bg-white transition-all shadow-[4px_4px_0_black] md:shadow-[8px_8px_0_black] active:shadow-none active:translate-y-[calc(-50%+4px)] active:translate-x-1"
        style="writing-mode: vertical-lr;">
        上一轮
      </button>

      <button @click="nextRound" :disabled="currentRoundIndex === selectedRounds.length - 1"
        class="fixed right-2 md:right-6 top-1/2 -translate-y-1/2 z-50 px-2 py-4 md:px-4 md:py-8 text-lg md:text-2xl font-black bg-white border-4 border-black hover:bg-[#A1F65E] disabled:opacity-50 disabled:hover:bg-white transition-all shadow-[4px_4px_0_black] md:shadow-[8px_8px_0_black] active:shadow-none active:translate-y-[calc(-50%+4px)] active:translate-x-1"
        style="writing-mode: vertical-lr;">
        下一轮
      </button>

      <!-- Toggle Content Button (Centered Bottom) -->
      <div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <button @click="toggleContent"
          class="px-8 py-4 text-xl font-black bg-[#A1F65E] border-4 border-black hover:bg-white transition-all shadow-[8px_8px_0_black] active:shadow-none active:translate-y-2 active:translate-x-2">
          {{ showFullContent ? '收起详情' : '展开详情' }}
        </button>
      </div>

      <!-- Final result -->
      <FinalResult v-if="currentRoundIndex === selectedRounds.length - 1" />

      <!-- Timeline at Bottom -->
      <div class="border-t-4 border-black pt-8 mt-12 mb-24">
        <DebateTimeline :rounds="selectedRounds" :current-index="currentRoundIndex" @select="goToRound" />
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t-4 border-black py-8 mt-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 text-center text-black font-bold text-sm">
        <template v-if="currentRoundIndex === selectedRounds.length - 1">
          <p>⚔️ AI 辩论赛 | {{ totalRounds }} 轮精彩辩论 | 最终结论：{{ finalConclusion.winner }}获胜</p>
        </template>
        <template v-else>
          <p>⚔️ AI 辩论赛 | 正在进行中...</p>
        </template>
        <p class="mt-2 text-black/60">Powered by AI vs AI</p>
      </div>
    </footer>
  </div>
</template>

<style>
/* 角色与语框动态样式 */
.character {
  position: fixed;
  top: 0;
  height: 100vh;
  width: 400px;
  transition: transform 450ms cubic-bezier(.2, .9, .2, 1), right 450ms, left 450ms;
  z-index: 0;
  pointer-events: none;
  filter: drop-shadow(15px 15px 0px rgba(0, 0, 0, 0.8));
  opacity: 0.3;
}

.character svg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.character.left {
  left: -200px;
  transform-origin: left center;
}

.character.right {
  right: -200px;
  transform-origin: right center;
}

.character.active {
  opacity: 0.8;
  z-index: 10;
}

.character.active.left {
  transform: translateX(100px) scale(1.1);
  filter: drop-shadow(25px 25px 0px rgba(0, 0, 0, 1));
}

.character.active.right {
  transform: translateX(-100px) scale(1.1);
  filter: drop-shadow(-25px 25px 0px rgba(0, 0, 0, 1));
}

/* Flex layout logic for width management */
@media (min-width: 768px) {
  .sides-container {
    flex-wrap: nowrap;
    align-items: flex-start;
  }

  .side-wrap {
    flex: 1 1 50%;
    transition: flex 450ms cubic-bezier(.2, .9, .2, 1), transform 450ms;
    max-width: 100%;
  }

  /* When speaker is active, exceed half width (60% / 40%) */
  .sides-container:has(.positive-wrap.speaking) .positive-wrap {
    flex: 1 1 60%;
    z-index: 30;
  }

  .sides-container:has(.positive-wrap.speaking) .negative-wrap {
    flex: 1 1 40%;
  }

  .sides-container:has(.negative-wrap.speaking) .negative-wrap {
    flex: 1 1 60%;
    z-index: 30;
  }

  .sides-container:has(.negative-wrap.speaking) .positive-wrap {
    flex: 1 1 40%;
  }
}

/* 让被突出的一侧在视觉上更显著 */
.side-wrap.speaking .argument-card {
  box-shadow: 10px 10px 0px rgba(0, 0, 0, 1) !important;
  transform: translateY(-4px);
}

/* 小屏幕微调 */
@media (max-width: 768px) {
  .character {
    display: none;
  }
}
</style>
