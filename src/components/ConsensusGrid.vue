<script setup lang="ts">
const props = defineProps<{
  summary: string[]
}>()
</script>

<template>
  <div class="mb-8">
    <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
      <span>🤝</span> 双方达成的七项共识
    </h3>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="(item, index) in props.summary" :key="index"
        class="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 hover:border-green-500/50 transition-all">
        <div class="flex items-start gap-3">
          <span
            class="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold">
            {{ index + 1 }}
          </span>
          <p class="text-slate-300 text-sm">{{ item }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
