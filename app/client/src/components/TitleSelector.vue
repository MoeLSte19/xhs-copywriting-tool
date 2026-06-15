<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm">
    <label class="text-sm font-medium text-gray-600 mb-3 block">📌 选择标题（5选1）</label>
    <div class="space-y-2">
      <button
        v-for="(title, index) in store.titles"
        :key="index"
        class="w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm active:scale-[0.99]"
        :class="{
          'border-primary bg-accent text-primary font-medium': store.selectedTitleIndex === index,
          'border-gray-200 bg-white text-gray-700 hover:border-gray-300': store.selectedTitleIndex !== index,
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
