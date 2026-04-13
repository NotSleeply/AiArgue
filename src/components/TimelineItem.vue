<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  roundNumber: number
  index: number
  currentIndex: number
}>()

const emit = defineEmits<{
  select: [index: number]
}>()

const onClick = () => emit('select', props.index)

const btnClass = computed(() => {
  if (props.index === props.currentIndex)
    return 'bg-[#A1F65E] text-black shadow-[4px_4px_0_black] scale-110 z-10'
  if (props.index < props.currentIndex) return 'bg-black text-white shadow-[4px_4px_0_black]'
  return 'bg-white text-black shadow-[4px_4px_0_black] hover:bg-gray-200'
})
</script>

<template>
  <button @click="onClick"
    class="relative flex-shrink-0 font-black text-xl w-16 h-16 flex items-center justify-center border-4 border-black transition-all active:translate-y-1 active:shadow-none"
    :class="btnClass">
    {{ props.roundNumber }}
  </button>
</template>

<style scoped></style>
