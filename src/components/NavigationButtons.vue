<script setup lang="ts">
import PrevButton from './PrevButton.vue'
import NextButton from './NextButton.vue'

const { onPrev, onNext, disabledPrev = false, disabledNext = false } = defineProps<{
  onPrev: () => void
  onNext: () => void
  disabledPrev?: boolean
  disabledNext?: boolean
}>()
</script>

<template>
  <PrevButton :onClick="onPrev" :disabled="disabledPrev" />
  <NextButton :onClick="onNext" :disabled="disabledNext" />
</template>
