<script setup lang="ts">
import { computed } from 'vue'
import type { Argument } from '../data/debate'

const props = defineProps<{
  argument: Argument
  round: number
  side: 'positive' | 'negative'
  expanded: boolean
}>()

const borderColor = computed(() => {
  return props.side === 'positive' ? 'border-blue-500/30' : 'border-red-500/30'
})

const bgColor = computed(() => {
  return props.side === 'positive' ? 'bg-blue-500/5' : 'bg-red-500/5'
})

const headerBg = computed(() => {
  return props.side === 'positive' ? 'bg-blue-500/10' : 'bg-red-500/10'
})

// 简单的 Markdown 解析
const formatContent = (content: string): string => {
  return content
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-white">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3 text-white">$1</h2>')
    .replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold mt-3 mb-2 text-slate-300">$1</h4>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-slate-300 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-slate-300 list-decimal">$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-yellow-300 font-semibold">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-slate-700 px-1 rounded text-purple-300">$1</code>')
    .replace(/^>/g, '&gt;')
    .replace(/</g, '&lt;')
    .split('\n\n')
    .map(p => p.startsWith('<') ? p : `<p class="text-slate-300 mb-2">${p}</p>`)
    .join('')
}
</script>

<template>
  <div 
    class="rounded-xl border transition-all duration-300 overflow-hidden"
    :class="[borderColor, bgColor]"
  >
    <!-- Header -->
    <div class="px-6 py-4" :class="headerBg">
      <div class="flex items-start justify-between gap-4">
        <div>
          <span class="inline-block px-2 py-1 text-xs font-medium rounded bg-slate-700/50 mb-2">
            第 {{ round }} 轮
          </span>
          <h3 class="text-lg font-bold text-white leading-tight">
            {{ argument.title }}
          </h3>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-6 py-4">
      <div 
        class="prose prose-invert prose-sm max-w-none"
        v-html="formatContent(argument.content)"
      ></div>
    </div>

    <!-- Footer -->
    <div class="px-6 py-3 border-t border-slate-700/30 bg-slate-800/20">
      <div class="flex items-center justify-between text-xs text-slate-500">
        <span>来源: {{ argument.source }}</span>
        <span>{{ argument.time }}</span>
      </div>
    </div>
  </div>
</template>
