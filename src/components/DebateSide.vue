<script setup lang="ts">
import ArgumentCard from './ArgumentCard.vue'
import SideHeader from './SideHeader.vue'
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
    <SideHeader :side="side" :name="name" :tagline="tagline" />
    <ArgumentCard :argument="argument" :round="round" :side="side" :expanded="expanded" />
  </div>
</template>
