<script setup lang="ts">
const props = defineProps<{
  finalConclusion: any
  totalRounds: number
}>()
</script>

<template>
  <div class="text-center mb-8">
    <div class="text-6xl mb-4">🏆</div>
    <h2 class="text-3xl font-bold text-yellow-400 mb-2">
      {{ props.finalConclusion.winner }} 获胜！
    </h2>
    <p class="text-slate-400">
      经过 {{ props.totalRounds }} 轮精彩辩论，胜负已分
    </p>
  </div>
</template>

<style scoped></style>
