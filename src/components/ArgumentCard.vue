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
  return 'border-black border-2'
})

const bgColor = computed(() => {
  return 'bg-white'
})

const headerBg = computed(() => {
  return props.side === 'positive' ? 'bg-[#A1F65E]' : 'bg-[#A1F65E]'
})

// 简单的 Markdown 解析。注意：移除了对 '<' 的全量转义，以允许渲染 Markdown 中的内嵌 HTML（本地项目内使用）
const formatContent = (content: string): string => {
  return content
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2 text-black">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3 text-black">$1</h2>')
    .replace(/^#### (.+)$/gm, '<h4 class="text-base font-bold mt-3 mb-2 text-black">$1</h4>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-black list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-black list-decimal">$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-black font-black">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-[#A1F65E] px-1 border border-black rounded-none text-black font-bold">$1</code>')
    // 保留引用前缀处理，但不全量转义 '<'
    .replace(/^>/gm, '<blockquote class="pl-4 border-l-4 border-black text-black font-medium italic">')
    .split('\n\n')
    .map(p => p.startsWith('<') ? p : `<p class="text-black font-medium mb-2">${p}</p>`)
    .join('')
}
</script>

<template>
  <div class="argument-card rounded-none overflow-hidden" :class="[borderColor, bgColor]"
    style="box-shadow: 6px 6px 0px black;">
    <!-- Header -->
    <div class="px-6 py-4 border-b-2 border-black" :class="headerBg">
      <div class="flex items-start justify-between gap-4">
        <div>
          <span
            class="inline-block px-2 py-1 text-xs font-bold rounded-none border border-black bg-white mb-2 text-black"
            style="box-shadow: 2px 2px 0px black;">
            第 {{ round }} 轮
          </span>
          <h3 class="text-lg font-black text-black leading-tight">
            {{ argument.title }}
          </h3>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-6 py-4">
      <div class="prose prose-sm max-w-none" v-html="formatContent(argument.content)"></div>
    </div>

    <!-- Footer -->
    <div class="px-6 py-3 border-t-2 border-black bg-[#F3F4F6]">
      <div class="flex items-center justify-between text-xs font-bold text-black uppercase">
        <span>来源: {{ argument.source }}</span>
        <span>{{ argument.time }}</span>
      </div>
    </div>
  </div>
</template>
