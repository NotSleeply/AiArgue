<script setup lang="ts">
const { expanded, toggle } = defineProps<{
  expanded: boolean
  toggle: () => void
}>()
</script>

<template>
  <div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
    <button @click="toggle"
      class="px-8 py-4 text-xl font-black bg-[#A1F65E] border-4 border-black hover:bg-white transition-all shadow-[8px_8px_0_black] active:shadow-none active:translate-y-2 active:translate-x-2">
      {{ expanded ? '收起详情' : '展开详情' }}
    </button>
  </div>
</template>
