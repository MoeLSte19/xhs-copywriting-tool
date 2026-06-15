<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm">
    <div class="flex items-center justify-between mb-2">
      <label class="text-sm font-medium text-gray-600">🤖 AI味评分</label>
      <span
        class="text-sm font-bold"
        :class="scoreColor"
      >
        {{ score }}/100
      </span>
    </div>
    <!-- 进度条 -->
    <div class="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-700 ease-out"
        :class="barColor"
        :style="{ width: `${score}%` }"
      ></div>
    </div>
    <p class="text-xs mt-2" :class="scoreTextColor">
      {{ scoreHint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  score: number;
}>();

const isLow = computed(() => props.score < 80);

const scoreColor = computed(() => isLow.value ? 'text-red-500' : 'text-green-500');
const barColor = computed(() => isLow.value ? 'bg-red-400' : 'bg-green-400');
const scoreTextColor = computed(() => isLow.value ? 'text-red-400' : 'text-green-400');

const scoreHint = computed(() => {
  if (props.score >= 90) return '✅ 非常自然，几乎无AI痕迹';
  if (props.score >= 80) return '✅ 较为自然，可以发布';
  if (props.score >= 60) return '⚠️ 有一定AI味，建议降AI味改写';
  if (props.score >= 40) return '🔴 AI味较重，强烈建议改写';
  return '🔴 AI味很重，必须改写后再发布';
});
</script>
