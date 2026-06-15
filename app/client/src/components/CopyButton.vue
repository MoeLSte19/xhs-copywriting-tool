<template>
  <button
    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
    :class="{
      'bg-primary text-white hover:bg-primary-hover': !isCopied && !isCopying,
      'bg-green-500 text-white': isCopied,
      'bg-gray-200 text-gray-400 cursor-wait': isCopying,
    }"
    :disabled="isCopying"
    @click="handleCopy"
  >
    <span v-if="isCopied">已复制</span>
    <span v-else-if="isCopying">复制中...</span>
    <span v-else>复制</span>
  </button>
</template>

<script setup lang="ts">
import { useCopy } from '../composables/useCopy';

const props = defineProps<{
  text: string;
}>();

const { isCopied, isCopying, copyToClipboard } = useCopy();

async function handleCopy(): Promise<void> {
  const success = await copyToClipboard(props.text);
  if (!success) {
    alert('复制失败，请手动选择复制');
  }
}
</script>
