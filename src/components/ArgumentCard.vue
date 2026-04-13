<script setup lang="ts">
import { computed } from 'vue'
import type { Argument } from '../types/debate'
import { renderMarkdown } from '../lib/markdown'
import ArgumentHeader from './ArgumentHeader.vue'
import ArgumentFooter from './ArgumentFooter.vue'

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

const formatContent = (content: string): string => renderMarkdown(content)
</script>

<template>
  <div class="argument-card rounded-none overflow-hidden" :class="[borderColor, bgColor]"
    style="box-shadow: 6px 6px 0px black;">
    <ArgumentHeader :title="props.argument.title" :round="props.round" :side="props.side" />

    <!-- Content -->
    <div class="px-6 py-4">
      <div class="prose-container max-w-none" v-html="formatContent(props.argument.content)"></div>
    </div>

    <ArgumentFooter :source="props.argument.source" :time="props.argument.time" />
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
