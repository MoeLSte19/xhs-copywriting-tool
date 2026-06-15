<template>
  <div class="bg-white rounded-2xl p-5 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-gray-800">🔬 Lmscan + Stop Slop</h3>
      <button
        class="text-sm text-primary hover:text-primary-dark transition-colors"
        @click="checkHealth"
        :disabled="isCheckingHealth"
      >
        {{ isCheckingHealth ? '检查中...' : '检查服务状态' }}
      </button>
    </div>

    <!-- 服务状态显示 -->
    <div v-if="servicesHealth" class="mb-4 p-3 rounded-xl" :class="statusClass">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-sm font-medium">服务状态：</span>
        <span
          class="px-2 py-0.5 rounded-full text-xs font-medium"
          :class="servicesHealth.lmscan ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
        >
          Lmscan: {{ servicesHealth.lmscan ? '正常' : '异常' }}
        </span>
        <span
          class="px-2 py-0.5 rounded-full text-xs font-medium"
          :class="servicesHealth.stopSlop ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
        >
          Stop Slop: {{ servicesHealth.stopSlop ? '正常' : '异常' }}
        </span>
      </div>
      <p v-if="servicesHealth.message !== '所有服务正常'" class="text-xs text-gray-500">
        {{ servicesHealth.message }}
      </p>
    </div>

    <!-- 操作按钮 -->
    <div class="space-y-3 mb-4">
      <button
        class="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
        :class="{
          'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30': !isDetecting && store.content,
          'bg-gray-100 text-gray-400 cursor-not-allowed': isDetecting || !store.content,
        }"
        :disabled="isDetecting || !store.content"
        @click="handleDetect"
      >
        <span v-if="isDetecting" class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          Lmscan 检测中...
        </span>
        <span v-else>🔍 使用 Lmscan 检测 AI 味</span>
      </button>

      <button
        class="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
        :class="{
          'bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/30': !isProcessing && store.content,
          'bg-gray-100 text-gray-400 cursor-not-allowed': isProcessing || !store.content,
        }"
        :disabled="isProcessing || !store.content"
        @click="handleFullProcess"
      >
        <span v-if="isProcessing" class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          完整处理中...
        </span>
        <span v-else>🚀 一键降 AI 味（Lmscan + Stop Slop）</span>
      </button>
    </div>

    <!-- 检测结果 -->
    <div v-if="detectResult" class="mb-4 p-4 bg-gray-50 rounded-xl">
      <h4 class="text-sm font-medium text-gray-700 mb-2">📊 Lmscan 检测结果</h4>
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span class="text-gray-500">AI 味分数：</span>
          <span class="font-bold" :class="scoreColor">{{ detectResult.aiScore }}/100</span>
        </div>
        <div>
          <span class="text-gray-500">置信度：</span>
          <span class="font-bold">{{ detectResult.confidence }}%</span>
        </div>
      </div>
      <div class="mt-3 text-xs text-gray-500">
        <p>困惑度：{{ detectResult.details.perplexity.toFixed(2) }}</p>
        <p>突发性：{{ detectResult.details.burstiness.toFixed(2) }}</p>
        <p>词汇多样性：{{ detectResult.details.vocabulary.toFixed(2) }}</p>
      </div>
      <p class="mt-2 text-sm text-gray-600">{{ detectResult.summary }}</p>
    </div>

    <!-- 完整流程结果 -->
    <div v-if="fullResult" class="space-y-4">
      <div class="p-4 bg-blue-50 rounded-xl">
        <h4 class="text-sm font-medium text-blue-700 mb-2">📈 检测结果</h4>
        <p class="text-sm text-blue-600">
          原始 AI 味分数：
          <span class="font-bold">{{ fullResult.original.aiScore }}/100</span>
        </p>
        <p class="text-xs text-blue-500 mt-1">{{ fullResult.original.summary }}</p>
      </div>

      <div class="p-4 bg-purple-50 rounded-xl">
        <h4 class="text-sm font-medium text-purple-700 mb-2">✏️ 改写结果</h4>
        <p class="text-sm text-purple-600">
          改写后 AI 味分数：
          <span class="font-bold" :class="fullResult.finalScore >= 80 ? 'text-green-600' : 'text-red-600'">
            {{ fullResult.finalScore }}/100
          </span>
        </p>
        <div v-if="fullResult.rewritten.changes.length > 0" class="mt-2">
          <p class="text-xs text-purple-500 font-medium mb-1">修改说明：</p>
          <ul class="text-xs text-purple-500 space-y-1">
            <li v-for="(change, index) in fullResult.rewritten.changes" :key="index" class="flex items-start gap-1">
              <span>•</span>
              <span>{{ change }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="fullResult.finalScore >= 80" class="p-4 bg-green-50 border border-green-200 rounded-xl">
        <span class="text-lg">🎉</span>
        <p class="text-sm text-green-600 font-medium mt-1">
          AI 味评分已达 {{ fullResult.finalScore }} 分，文案很自然！
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGeneratorStore } from '../stores/generator';
import { useLmscan } from '../composables/useLmscan';

const store = useGeneratorStore();
const {
  isDetecting,
  isProcessing,
  detectResult,
  fullResult,
  servicesHealth,
  doLmscanDetect,
  doFullDeAiProcess,
  doCheckServicesHealth,
} = useLmscan();

const isCheckingHealth = ref(false);

const statusClass = computed(() => {
  if (!servicesHealth.value) return 'bg-gray-50';
  return servicesHealth.value.lmscan && servicesHealth.value.stopSlop
    ? 'bg-green-50 border border-green-200'
    : 'bg-yellow-50 border border-yellow-200';
});

const scoreColor = computed(() => {
  if (!detectResult.value) return '';
  return detectResult.value.aiScore >= 80 ? 'text-green-600' : 'text-red-600';
});

async function checkHealth(): Promise<void> {
  isCheckingHealth.value = true;
  await doCheckServicesHealth();
  isCheckingHealth.value = false;
}

async function handleDetect(): Promise<void> {
  await doLmscanDetect();
}

async function handleFullProcess(): Promise<void> {
  await doFullDeAiProcess();
}
</script>
