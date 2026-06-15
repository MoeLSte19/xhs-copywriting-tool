/** Pinia Store — 生成状态管理 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useGeneratorStore = defineStore('generator', () => {
  // 用户输入
  const input = ref<string>('');
  const category = ref<string>('beauty');

  // 生成结果
  const titles = ref<string[]>([]);
  const selectedTitleIndex = ref<number>(0);
  const content = ref<string>('');
  const aiScore = ref<number>(0);

  // 加载状态
  const isGenerating = ref<boolean>(false);
  const isDeAiing = ref<boolean>(false);

  // 计算属性：当前选中的标题
  const selectedTitle = computed(() => {
    if (titles.value.length === 0) return '';
    return titles.value[selectedTitleIndex.value] || titles.value[0];
  });

  // 计算属性：是否有结果
  const hasResult = computed(() => {
    return content.value.length > 0;
  });

  // 重置结果
  function resetResult(): void {
    titles.value = [];
    selectedTitleIndex.value = 0;
    content.value = '';
    aiScore.value = 0;
  }

  // 设置生成结果
  function setResult(data: { titles: string[]; content: string; aiScore: number; category: string }): void {
    titles.value = data.titles;
    content.value = data.content;
    aiScore.value = data.aiScore;
    category.value = data.category;
    selectedTitleIndex.value = 0;
  }

  // 更新降AI味结果
  function setDeAiResult(data: { content: string; aiScore: number }): void {
    content.value = data.content;
    aiScore.value = data.aiScore;
  }

  // 选择标题
  function selectTitle(index: number): void {
    if (index >= 0 && index < titles.value.length) {
      selectedTitleIndex.value = index;
    }
  }

  return {
    input,
    category,
    titles,
    selectedTitleIndex,
    content,
    aiScore,
    isGenerating,
    isDeAiing,
    selectedTitle,
    hasResult,
    resetResult,
    setResult,
    setDeAiResult,
    selectTitle,
  };
});
