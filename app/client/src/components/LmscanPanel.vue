<template>
  <div class="space-y-4 border-t border-gray-100 pt-4">
    <div class="bg-white/60 ring-1 ring-gray-200/60 rounded-xl">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-sm font-medium text-gray-600">服务检测</h3>
        <div v-if="servicesHealth" class="flex items-center gap-2">
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
        <button
          class="text-xs text-primary hover:text-primary-hover transition-colors"
          @click="checkHealth"
          :disabled="isCheckingHealth"
        >
          {{ isCheckingHealth ? '检查中...' : '检查状态' }}
        </button>
      </div>

      <div class="p-4 space-y-3">
        <!-- 操作按钮 -->
        <div class="flex gap-2">
          <button
            class="flex-1 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-[0.98]"
            :class="{ 'bg-gray-50 text-gray-400 cursor-not-allowed': isDetecting || !store.content }"
            :disabled="isDetecting || !store.content"
            @click="handleDetect"
          >
            <span v-if="isDetecting" class="flex items-center justify-center gap-1.5">
              <svg class="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              检测中...
            </span>
            <span v-else>检测 AI 痕迹</span>
          </button>

          <button
            class="flex-1 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-[0.98]"
            :class="{ 'bg-gray-50 text-gray-400 cursor-not-allowed': isProcessing || !store.content }"
            :disabled="isProcessing || !store.content"
            @click="handleFullProcess"
          >
            <span v-if="isProcessing" class="flex items-center justify-center gap-1.5">
              <svg class="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              处理中...
            </span>
            <span v-else>完整处理</span>
          </button>
        </div>

        <!-- 检测结果 -->
        <div v-if="detectResult" class="p-3 bg-gray-50 rounded-lg">
          <h4 class="text-xs font-medium text-gray-700 mb-2">检测结果</h4>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-gray-500">AI 痕迹分数：</span>
              <span class="font-bold" :class="scoreColor">{{ detectResult.aiScore }}/100</span>
            </div>
            <div>
              <span class="text-gray-500">置信度：</span>
              <span class="font-bold">{{ detectResult.confidence }}%</span>
            </div>
          </div>
          <div class="mt-2 text-xs text-gray-400">
            <p>困惑度：{{ detectResult.details.perplexity.toFixed(2) }}</p>
            <p>突发性：{{ detectResult.details.burstiness.toFixed(2) }}</p>
            <p>词汇多样性：{{ detectResult.details.vocabulary.toFixed(2) }}</p>
          </div>
          <p class="mt-2 text-xs text-gray-500">{{ detectResult.summary }}</p>
        </div>

        <!-- 完整流程结果 -->
        <div v-if="fullResult" class="space-y-3">
          <div class="p-3 bg-gray-50 rounded-lg">
            <h4 class="text-xs font-medium text-gray-700 mb-1">原始结果</h4>
            <p class="text-xs text-gray-500">
              AI 痕迹分数：
              <span class="font-bold">{{ fullResult.original.aiScore }}/100</span>
            </p>
            <p class="text-xs text-gray-400 mt-0.5">{{ fullResult.original.summary }}</p>
          </div>

          <div class="p-3 bg-gray-50 rounded-lg">
            <h4 class="text-xs font-medium text-gray-700 mb-1">改写结果</h4>
            <p class="text-xs text-gray-500">
              改写后 AI 痕迹分数：
              <span class="font-bold" :class="fullResult.finalScore >= 80 ? 'text-green-600' : 'text-red-600'">
                {{ fullResult.finalScore }}/100
              </span>
            </p>
            <div v-if="fullResult.rewritten.changes.length > 0" class="mt-1.5">
              <p class="text-xs text-gray-400 font-medium mb-0.5">修改说明：</p>
              <ul class="text-xs text-gray-400 space-y-0.5">
                <li v-for="(change, index) in fullResult.rewritten.changes" :key="index" class="flex items-start gap-1">
                  <span>&middot;</span>
                  <span>{{ change }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
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
