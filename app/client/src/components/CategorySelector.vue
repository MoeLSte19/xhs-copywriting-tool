<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm">
    <label class="text-sm font-medium text-gray-600 mb-3 block">🏷️ 选择分类</label>
    <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      <button
        v-for="cat in CATEGORIES"
        :key="cat.id"
        class="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all active:scale-95"
        :class="{
          'border-primary bg-accent text-primary': store.category === cat.id,
          'border-gray-200 bg-white text-gray-500 hover:border-gray-300': store.category !== cat.id,
        }"
        @click="store.category = cat.id"
      >
        <span class="text-2xl">{{ cat.icon }}</span>
        <span class="text-xs font-medium">{{ cat.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGeneratorStore } from '../stores/generator';
import { CATEGORIES } from '../constants/categories';

const store = useGeneratorStore();
</script>
