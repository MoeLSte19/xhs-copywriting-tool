<template>
  <div class="bg-white/60 ring-1 ring-gray-200/60 rounded-xl p-3">
    <label class="text-sm font-medium text-gray-600 mb-3 block">分类</label>
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="cat in CATEGORIES"
        :key="cat.id"
        class="flex flex-col items-center gap-0.5 px-2 py-2.5 rounded-lg border transition-all active:scale-95"
        :class="{
          'border-primary bg-blue-50 text-primary': store.category === cat.id,
          'border-gray-200 bg-white/60 text-gray-500 hover:border-gray-300': store.category !== cat.id,
        }"
        @click="store.category = cat.id"
      >
        <span class="text-lg">{{ cat.icon }}</span>
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
