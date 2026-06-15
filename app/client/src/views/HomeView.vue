<template>
  <div class="min-h-screen bg-surface flex flex-col">
    <!-- 顶部标题栏 -->
    <header class="sticky top-0 z-10 bg-white border-b border-gray-100">
      <div class="max-w-[768px] mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h1 class="text-lg font-bold text-gray-800 tracking-tight">笔记侠</h1>
          <span class="text-xs text-gray-400 hidden sm:inline">AI 写作助手</span>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="flex-1 max-w-[768px] w-full mx-auto px-4 py-6 space-y-5">
      <!-- 输入区域 -->
      <InputSection />

      <!-- 生成结果区域 -->
      <OutputSection v-if="store.hasResult" />

      <!-- Loading 骨架屏 -->
      <div v-if="store.isGenerating" class="space-y-4">
        <div class="bg-white/60 ring-1 ring-gray-200/60 rounded-xl p-6 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="space-y-2">
            <div class="h-3 bg-gray-200 rounded w-full"></div>
            <div class="h-3 bg-gray-200 rounded w-5/6"></div>
            <div class="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!store.hasResult && !store.isGenerating" class="text-center py-16">
        <p class="text-xl font-semibold text-gray-700 mb-2">写好你的出发点</p>
        <p class="text-sm text-gray-400">AI 帮你把想法变成小红书的语言</p>
      </div>

      <!-- 高级工具展开入口 -->
      <div v-if="store.hasResult" class="max-w-[768px] mx-auto">
        <button
          class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          @click="showAdvanced = !showAdvanced"
        >
          {{ showAdvanced ? '收起高级工具' : '高级工具' }}
        </button>
      </div>

      <!-- Lmscan + Stop Slop 面板（默认折叠） -->
      <LmscanPanel v-if="store.hasResult && showAdvanced" />
    </main>

    <!-- 底部提示 -->
    <footer class="border-t border-gray-100">
      <div class="max-w-[768px] mx-auto px-4 py-3">
        <p class="text-xs text-gray-400 text-center">
          AI 生成内容仅供参考，建议加入个人体验后发布
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGeneratorStore } from '../stores/generator';
import InputSection from '../components/InputSection.vue';
import OutputSection from '../components/OutputSection.vue';
import LmscanPanel from '../components/LmscanPanel.vue';

const store = useGeneratorStore();

/** 控制高级工具面板显隐 */
const showAdvanced = ref(false);
</script>
