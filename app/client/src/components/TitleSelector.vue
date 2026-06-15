<template>
  <div class="bg-white/60 ring-1 ring-gray-200/60 rounded-xl p-4">
    <label class="text-sm font-medium text-gray-600 mb-3 block">选一个标题</label>
    <div class="space-y-2">
      <button
        v-for="(title, index) in store.titles"
        :key="index"
        class="w-full text-left px-4 py-3 rounded-lg border transition-all text-sm active:scale-[0.99]"
        :class="{
          'border-primary bg-blue-50 text-primary font-medium': store.selectedTitleIndex === index,
          'border-gray-200 bg-white/60 text-gray-700 hover:border-gray-300': store.selectedTitleIndex !== index,
        }"
        @click="store.selectTitle(index)"
      >
        <span class="text-xs text-gray-400 mr-2">{{ index + 1 }}.</span>
        {{ title }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGeneratorStore } from '../stores/generator';

const store = useGeneratorStore();
</script>
