<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { DebateRound } from '../data/debate'

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
        <button v-for="(round, index) in rounds" :key="round.round" @click="emit('select', index)"
          class="relative flex-shrink-0 font-black text-xl w-16 h-16 flex items-center justify-center border-4 border-black transition-all active:translate-y-1 active:shadow-none"
          :class="[
            index === currentIndex
              ? 'bg-[#A1F65E] text-black shadow-[4px_4px_0_black] scale-110 z-10' 
              : index < currentIndex
                ? 'bg-black text-white shadow-[4px_4px_0_black]'
                : 'bg-white text-black shadow-[4px_4px_0_black] hover:bg-gray-200'
          ]">
          {{ round.round }}
        </button>
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
