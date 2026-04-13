<script setup lang="ts">
const { side, active = false } = defineProps<{
  side: 'positive' | 'negative'
  active?: boolean
}>()
</script>

<template>
  <div class="character" :class="[side === 'positive' ? 'left' : 'right', { active: active }]">
    <svg viewBox="0 0 200 400" preserveAspectRatio="none" fill="black">
      <path v-if="side === 'positive'"
        d="M-50,400 L120,400 C150,350 180,300 170,250 C160,200 120,180 100,150 C80,120 70,80 90,40 C100,20 80,-10 30,-20 L-50,-20 Z" />
      <path v-else
        d="M250,400 L80,400 C50,350 20,300 30,250 C40,200 80,180 100,150 C120,120 130,80 110,40 C100,20 120,-10 170,-20 L250,-20 Z" />
    </svg>
  </div>
</template>
