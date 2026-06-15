<template>
  <div class="space-y-4">
    <!-- 分类选择器 -->
    <CategorySelector />

    <!-- 主题输入框 -->
    <div class="bg-white/60 ring-1 ring-gray-200/60 rounded-xl p-4">
      <label class="text-sm font-medium text-gray-600 mb-2 block">主题</label>
      <textarea
        v-model="store.input"
        class="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        :class="{ 'bg-gray-50': store.isGenerating }"
        rows="4"
        placeholder="你打算写什么？比如：大理三天两夜攻略"
        :disabled="store.isGenerating"
        maxlength="500"
      ></textarea>
      <div class="flex justify-between items-center mt-2">
        <span class="text-xs text-gray-400">{{ store.input.length }}/500</span>
        <span class="text-xs text-gray-400">今日剩余 {{ usageStore.remainCount }} 次</span>
      </div>
    </div>

    <!-- 生成按钮 -->
    <button
      class="w-full py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-200"
      :class="{
        'bg-primary hover:bg-primary-hover active:scale-[0.98] active:bg-primary-dark': canGenerate,
        'bg-gray-200 text-gray-400 cursor-not-allowed': !canGenerate,
      }"
      :disabled="!canGenerate"
      @click="handleGenerate"
    >
      <span v-if="store.isGenerating" class="flex items-center justify-center gap-2">
        <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        AI 创作中...
      </span>
      <span v-else-if="usageStore.isLimitReached">今日次数已用完</span>
      <span v-else>生成文案</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGeneratorStore } from '../stores/generator';
import { useUsageStore } from '../stores/usage';
import { useGenerate } from '../composables/useGenerate';
import CategorySelector from './CategorySelector.vue';

const store = useGeneratorStore();
const usageStore = useUsageStore();
const { doGenerate } = useGenerate();

const canGenerate = computed(() => !store.isGenerating && !usageStore.isLimitReached);

async function handleGenerate(): Promise<void> {
  await doGenerate();
}
</script>
