<template>
  <div class="min-h-screen bg-accent flex flex-col">
    <!-- 顶部标题栏 -->
    <header class="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-sm">
      <div class="max-w-[768px] mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-2xl">📝</span>
          <h1 class="text-xl font-bold text-primary">笔记侠</h1>
          <span class="text-xs text-gray-400 hidden sm:inline">小红书爆款文案生成器</span>
        </div>
        <div class="text-xs text-gray-400">
          今日剩余 <span class="text-primary font-bold">{{ remainCount }}</span> 次
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="flex-1 max-w-[768px] w-full mx-auto px-4 py-6 space-y-6">
      <!-- 输入区域 -->
      <InputSection />

      <!-- 生成结果区域 -->
      <OutputSection v-if="store.hasResult" />

      <!-- Lmscan + Stop Slop 面板 -->
      <LmscanPanel v-if="store.hasResult" />

      <!-- Loading 骨架屏 -->
      <div v-if="store.isGenerating" class="space-y-4">
        <div class="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="space-y-2">
            <div class="h-3 bg-gray-200 rounded w-full"></div>
            <div class="h-3 bg-gray-200 rounded w-5/6"></div>
            <div class="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!store.hasResult && !store.isGenerating" class="text-center py-12">
        <span class="text-6xl mb-4 block">✨</span>
        <p class="text-gray-400 text-sm">输入主题，一键生成小红书爆款文案</p>
      </div>
    </main>

    <!-- 底部合规提示 -->
    <footer class="bg-white/80 border-t border-gray-100">
      <div class="max-w-[768px] mx-auto px-4 py-3">
        <p class="text-xs text-gray-400 text-center">
          ⚠️ 建议加入个人真实体验后再发布，AI 生成内容仅供参考
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGeneratorStore } from '../stores/generator';
import { useUsageStore } from '../stores/usage';
import InputSection from '../components/InputSection.vue';
import OutputSection from '../components/OutputSection.vue';
import LmscanPanel from '../components/LmscanPanel.vue';

const store = useGeneratorStore();
const usageStore = useUsageStore();

const remainCount = computed(() => usageStore.remainCount);
</script>
