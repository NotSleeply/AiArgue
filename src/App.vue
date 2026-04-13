<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { debateTitle, positiveName, negativeName, totalRounds, finalConclusion } from './data/debate'
import useDebate from './composables/useDebate'
import useAutoPlay from './composables/useAutoPlay'
import DebateTimeline from './components/DebateTimeline.vue'
import FinalResult from './components/FinalResult.vue'
import HeaderBar from './components/HeaderBar.vue'
import DebateSide from './components/DebateSide.vue'
import NavigationButtons from './components/NavigationButtons.vue'
import ToggleContentButton from './components/ToggleContentButton.vue'
import CharacterSilhouette from './components/CharacterSilhouette.vue'

const currentRoundIndex = ref(0)
const showFullContent = ref(false)
const activeSide = ref<'positive' | 'negative'>('positive')

const activate = (side: 'positive' | 'negative') => {
  activeSide.value = side
}

const { selectedRounds, ensureManifestLoaded, loadRoundContent, prefetchRound } = useDebate()

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
  }
}

const prevRound = () => {
  if (currentRoundIndex.value > 0) {
    currentRoundIndex.value--
    showFullContent.value = false
  }
}

// 自动播放逻辑委托给 composable，避免在组件内管理定时器
const { isPlaying, toggle: toggleAutoPlay } = useAutoPlay(
  () => currentRoundIndex.value < selectedRounds.value.length - 1,
  () => {
    nextRound()
  },
  8000,
)

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
    <HeaderBar :debateTitle="debateTitle" :roundNumber="roundNumber" :totalRounds="totalRounds" :isPlaying="isPlaying"
      :toggleAutoPlay="toggleAutoPlay" :progress="progress" />

    <!-- Main content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <!-- Debate content -->
      <div v-if="currentRound" class="relative">
        <CharacterSilhouette side="positive" :active="activeSide === 'positive'" @click="activate('positive')" />
        <CharacterSilhouette side="negative" :active="activeSide === 'negative'" @click="activate('negative')" />

        <div class="flex flex-col md:flex-row gap-8 mb-8 relative sides-container">
          <DebateSide side="positive" :name="positiveName" tagline="AI应该取代人类" :argument="currentRound.positive"
            :round="currentRound.round" :isSpeaking="activeSide === 'positive'" :activate="activate"
            :expanded="showFullContent" />
          <DebateSide side="negative" :name="negativeName" tagline="AI不应该取代人类" :argument="currentRound.negative"
            :round="currentRound.round" :isSpeaking="activeSide === 'negative'" :activate="activate"
            :expanded="showFullContent" />
        </div>
      </div>

      <NavigationButtons :onPrev="prevRound" :onNext="nextRound" :disabledPrev="currentRoundIndex === 0"
        :disabledNext="currentRoundIndex === selectedRounds.length - 1" />

      <ToggleContentButton :expanded="showFullContent" :toggle="toggleContent" />

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
        <div class="mt-2 flex items-center justify-center gap-4 text-sm text-black/70">
          <span>版权所有 © Notsleeply</span>
          <span>联系: <a href="mailto:120233502050@stu.ustl.edu.cn"
              class="underline">120233502050@stu.ustl.edu.cn</a></span>
          <a href="https://github.com/NotSleeply/AiArgue" target="_blank" rel="noopener noreferrer"
            class="inline-flex items-center gap-2 text-black hover:text-black/80">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"
              aria-hidden="true">
              <path
                d="M12 .5C5.648.5.5 5.648.5 12c0 5.088 3.292 9.404 7.861 10.928.575.105.784-.25.784-.556 0-.275-.01-1.007-.015-1.978-3.197.696-3.873-1.542-3.873-1.542-.523-1.33-1.277-1.684-1.277-1.684-1.044-.713.08-.698.08-.698 1.155.082 1.763 1.187 1.763 1.187 1.025 1.755 2.69 1.249 3.345.955.104-.743.402-1.249.73-1.536-2.553-.291-5.238-1.277-5.238-5.682 0-1.255.448-2.279 1.187-3.083-.119-.291-.515-1.464.113-3.05 0 0 .97-.311 3.177 1.176A11.044 11.044 0 0112 6.844c.983.005 1.973.133 2.895.39 2.203-1.487 3.171-1.176 3.171-1.176.63 1.586.234 2.759.115 3.05.742.804 1.186 1.828 1.186 3.083 0 4.417-2.692 5.386-5.256 5.672.414.359.783 1.066.783 2.151 0 1.554-.014 2.806-.014 3.186 0 .31.207.667.79.554C20.71 21.402 24 17.086 24 12 24 5.648 18.352.5 12 .5z" />
            </svg>
            <span class="sr-only">GitHub</span>
          </a>
        </div>
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
