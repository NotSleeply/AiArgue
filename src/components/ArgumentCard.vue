<script setup lang="ts">
import { computed } from 'vue'
import type { Argument } from '../data/debate'
import MarkdownIt from 'markdown-it'

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

const md = new MarkdownIt({ html: true })

const formatContent = (content: string): string => {
  return md.render(content)
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
      <div class="prose-container max-w-none" v-html="formatContent(argument.content)"></div>
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

<style>
.prose-container {
  font-family: sans-serif;
  color: black;
  font-weight: 500;
  line-height: 1.6;
}

.prose-container h1,
.prose-container h2,
.prose-container h3,
.prose-container h4 {
  font-weight: 900;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.prose-container h2 {
  font-size: 1.5rem;
  border-bottom: 2px solid black;
  padding-bottom: 0.25rem;
}

.prose-container h3 {
  font-size: 1.25rem;
}

.prose-container p {
  margin-bottom: 1rem;
}

.prose-container ul {
  list-style-type: disc;
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose-container ol {
  list-style-type: decimal;
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose-container blockquote {
  border-left: 4px solid black;
  padding-left: 1rem;
  margin-left: 0;
  margin-right: 0;
  font-style: italic;
}

.prose-container code {
  background: #A1F65E;
  padding: 0.125rem 0.25rem;
  border: 2px solid black;
  font-weight: 700;
}

.prose-container table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  border: 4px solid black;
}

.prose-container th,
.prose-container td {
  border: 2px solid black;
  padding: 0.5rem;
}

.prose-container th {
  background: #F3F4F6;
  font-weight: 900;
}
</style>
