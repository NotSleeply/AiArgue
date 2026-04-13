<script setup lang="ts">
import ArgumentCard from './ArgumentCard.vue'
const { side, name, tagline = '', argument, round, isSpeaking = false, activate, expanded = false } = defineProps<{
  side: 'positive' | 'negative'
  name: string
  tagline?: string
  argument: any
  round: number
  isSpeaking?: boolean
  activate: (s: 'positive' | 'negative') => void
  expanded?: boolean
}>()
</script>

<template>
  <div class="space-y-4 side-wrap relative" :class="{ 'speaking': isSpeaking }" @click="activate(side)">
    <div class="flex items-center gap-3 mb-4 border-2 border-black p-2 bg-white shadow-[4px_4px_0_black]">
      <span class="text-3xl">{{ side === 'positive' ? '🔵' : '🔴' }}</span>
      <div>
        <h2 class="text-xl font-black text-black uppercase">{{ name }}</h2>
        <p class="text-sm font-bold text-black border-t-2 border-black pt-1 mt-1">{{ tagline }}</p>
      </div>
    </div>
    <ArgumentCard :argument="argument" :round="round" :side="side" :expanded="expanded" />
  </div>
</template>
