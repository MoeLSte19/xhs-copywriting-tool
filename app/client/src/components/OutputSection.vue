<template>
  <div class="space-y-4">
    <!-- 标题选择器 -->
    <TitleSelector />

    <!-- AI味评分条 -->
    <AiScoreBar :score="store.aiScore" />

    <!-- 文案内容 -->
    <div class="bg-white rounded-2xl p-5 shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <label class="text-sm font-medium text-gray-600">📋 文案内容</label>
        <CopyButton :text="copyText" />
      </div>
      <div class="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap break-words select-all">
        {{ displayContent }}
      </div>
    </div>

    <!-- 降AI味按钮 -->
    <button
      v-if="store.aiScore < 80"
      class="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
      :class="{
        'bg-accent text-primary hover:bg-accent-dark border-2 border-primary/20': !store.isDeAiing,
        'bg-gray-100 text-gray-400 cursor-not-allowed': store.isDeAiing,
      }"
      :disabled="store.isDeAiing"
      @click="handleDeAi"
    >
      <span v-if="store.isDeAiing" class="flex items-center justify-center gap-2">
        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        降AI味改写中...
      </span>
      <span v-else>🔄 一键降AI味改写</span>
    </button>

    <!-- 评分合格提示 -->
    <div
      v-if="store.aiScore >= 80"
      class="bg-green-50 border border-green-200 rounded-2xl p-4 text-center"
    >
      <span class="text-lg">🎉</span>
      <p class="text-sm text-green-600 font-medium mt-1">AI味评分已达 {{ store.aiScore }} 分，文案很自然！</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGeneratorStore } from '../stores/generator';
import { useAiDetect } from '../composables/useAiDetect';
import TitleSelector from './TitleSelector.vue';
import AiScoreBar from './AiScoreBar.vue';
import CopyButton from './CopyButton.vue';

const store = useGeneratorStore();
const { doDeAi } = useAiDetect();

/** 展示内容：选中的标题 + 正文 */
const displayContent = computed(() => {
  const title = store.selectedTitle;
  const content = store.content;
  if (title && content) {
    return `${title}\n\n${content}`;
  }
  return content;
});

/** 复制文本 */
const copyText = computed(() => displayContent.value);

async function handleDeAi(): Promise<void> {
  await doDeAi();
}
</script>
