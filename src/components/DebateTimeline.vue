<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { DebateRound } from '../types/debate'
import TimelineItem from './TimelineItem.vue'

const props = defineProps<{
  rounds: DebateRound[]
  currentIndex: number
}>()

const emit = defineEmits<{
  select: [index: number]
}>()

const timelineScroll = ref<HTMLElement | null>(null)

watch(() => props.currentIndex, async (newVal) => {
  await nextTick()
  if (timelineScroll.value) {
    const parent = timelineScroll.value
    const children = parent.querySelectorAll('button')
    const activeChild = children[newVal]
    if (activeChild) {
      const scrollLeft = activeChild.offsetLeft - parent.clientWidth / 2 + activeChild.clientWidth / 2
      parent.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }
})
</script>

<template>
  <!-- 父容器负责外边框和阴影 -->
  <div class="relative w-full border-4 border-black bg-white shadow-[8px_8px_0_black]">
    <!-- 内部容器负责滚动 -->
    <div class="overflow-x-auto w-full p-4 custom-scrollbar" ref="timelineScroll">
      <div class="flex items-center gap-6 w-max px-2 py-4">
        <TimelineItem v-for="(round, index) in rounds" :key="round.round" :roundNumber="round.round" :index="index"
          :currentIndex="props.currentIndex" @select="(i) => emit('select', i)" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 16px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: white;
  border-top: 4px solid black;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: black;
  border-left: 2px solid white;
  border-right: 2px solid white;
}
</style>
