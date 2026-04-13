<script setup lang="ts">
const { onPrev, onNext, disabledPrev = false, disabledNext = false } = defineProps<{
  onPrev: () => void
  onNext: () => void
  disabledPrev?: boolean
  disabledNext?: boolean
}>()
</script>

<template>
  <button @click="onPrev" :disabled="disabledPrev"
    class="fixed left-2 md:left-6 top-1/2 -translate-y-1/2 z-50 px-2 py-4 md:px-4 md:py-8 text-lg md:text-2xl font-black bg-white border-4 border-black hover:bg-[#A1F65E] disabled:opacity-50 disabled:hover:bg-white transition-all shadow-[4px_4px_0_black] md:shadow-[8px_8px_0_black] active:shadow-none active:translate-y-[calc(-50%+4px)] active:translate-x-1"
    style="writing-mode: vertical-lr;">
    上一轮
  </button>

  <button @click="onNext" :disabled="disabledNext"
    class="fixed right-2 md:right-6 top-1/2 -translate-y-1/2 z-50 px-2 py-4 md:px-4 md:py-8 text-lg md:text-2xl font-black bg-white border-4 border-black hover:bg-[#A1F65E] disabled:opacity-50 disabled:hover:bg-white transition-all shadow-[4px_4px_0_black] md:shadow-[8px_8px_0_black] active:shadow-none active:translate-y-[calc(-50%+4px)] active:translate-x-1"
    style="writing-mode: vertical-lr;">
    下一轮
  </button>
</template>
