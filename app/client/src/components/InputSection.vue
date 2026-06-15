<template>
  <div class="space-y-4">
    <!-- 分类选择器 -->
    <CategorySelector />

    <!-- 主题输入框 -->
    <div class="bg-white rounded-2xl p-4 shadow-sm">
      <label class="text-sm font-medium text-gray-600 mb-2 block">📝 笔记主题</label>
      <textarea
        v-model="store.input"
        class="w-full border border-gray-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        :class="{ 'bg-gray-50': store.isGenerating }"
        rows="4"
        placeholder="描述你想写的小红书笔记主题，比如：&#10;• 夏天好用的防晒霜推荐&#10;• 第一次去大理的旅行攻略&#10;• 新开的网红咖啡店探店"
        :disabled="store.isGenerating"
        maxlength="500"
      ></textarea>
      <div class="flex justify-between items-center mt-2">
        <span class="text-xs text-gray-400">{{ store.input.length }}/500</span>
      </div>
    </div>

    <!-- 生成按钮 -->
    <button
      class="w-full py-4 rounded-2xl text-white font-bold text-lg transition-all active:scale-[0.98]"
      :class="{
        'bg-primary hover:bg-primary-dark shadow-lg shadow-primary/30': !store.isGenerating && !usageStore.isLimitReached,
        'bg-gray-300 cursor-not-allowed': store.isGenerating || usageStore.isLimitReached,
      }"
      :disabled="store.isGenerating || usageStore.isLimitReached"
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
      <span v-else>✨ 一键生成爆款文案</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useGeneratorStore } from '../stores/generator';
import { useUsageStore } from '../stores/usage';
import { useGenerate } from '../composables/useGenerate';
import CategorySelector from './CategorySelector.vue';

const store = useGeneratorStore();
const usageStore = useUsageStore();
const { doGenerate } = useGenerate();

async function handleGenerate(): Promise<void> {
  await doGenerate();
}
</script>
