<template>
  <div class="bg-white/60 ring-1 ring-gray-200/60 rounded-xl p-4">
    <div class="flex items-center justify-between mb-2">
      <label class="text-sm font-medium text-gray-600">自然度</label>
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

const scoreColor = computed(() =>
  props.score >= 80 ? 'text-primary' :
  props.score >= 50 ? 'text-amber-500' : 'text-red-500'
);

const barColor = computed(() =>
  props.score >= 80 ? 'bg-primary' :
  props.score >= 50 ? 'bg-amber-400' : 'bg-red-400'
);

const scoreTextColor = computed(() =>
  props.score >= 80 ? 'text-gray-500' :
  props.score >= 50 ? 'text-amber-500' : 'text-red-400'
);

const scoreHint = computed(() => {
  if (props.score >= 80) return '自然，可直接用';
  if (props.score >= 50) return '有点 AI 味，建议改改';
  return 'AI 痕迹明显，需要重写';
});
</script>
