/** generator store 单元测试 — 生成状态管理 */
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGeneratorStore } from '../stores/generator';

describe('useGeneratorStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('初始状态应为空', () => {
    const store = useGeneratorStore();
    expect(store.input).toBe('');
    expect(store.category).toBe('beauty');
    expect(store.titles).toEqual([]);
    expect(store.selectedTitleIndex).toBe(0);
    expect(store.content).toBe('');
    expect(store.aiScore).toBe(0);
    expect(store.isGenerating).toBe(false);
    expect(store.isDeAiing).toBe(false);
  });

  describe('selectedTitle', () => {
    it('titles 为空时返回空字符串', () => {
      const store = useGeneratorStore();
      expect(store.selectedTitle).toBe('');
    });

    it('应返回 selectedTitleIndex 对应的标题', () => {
      const store = useGeneratorStore();
      store.titles = ['标题1', '标题2', '标题3'];
      store.selectedTitleIndex = 1;
      expect(store.selectedTitle).toBe('标题2');
    });

    it('selectedTitleIndex 超出范围时返回第一个标题', () => {
      const store = useGeneratorStore();
      store.titles = ['标题1', '标题2'];
      store.selectedTitleIndex = 99;
      expect(store.selectedTitle).toBe('标题1');
    });
  });

  describe('hasResult', () => {
    it('content 为空时返回 false', () => {
      const store = useGeneratorStore();
      expect(store.hasResult).toBe(false);
    });

    it('content 非空时返回 true', () => {
      const store = useGeneratorStore();
      store.content = '有内容的文案';
      expect(store.hasResult).toBe(true);
    });
  });

  describe('resetResult', () => {
    it('应重置所有生成结果', () => {
      const store = useGeneratorStore();
      store.titles = ['标题1', '标题2'];
      store.content = '文案内容';
      store.aiScore = 75;
      store.selectedTitleIndex = 1;

      store.resetResult();

      expect(store.titles).toEqual([]);
      expect(store.selectedTitleIndex).toBe(0);
      expect(store.content).toBe('');
      expect(store.aiScore).toBe(0);
    });
  });

  describe('setResult', () => {
    it('应正确设置生成结果', () => {
      const store = useGeneratorStore();
      store.setResult({
        titles: ['标题1', '标题2', '标题3', '标题4', '标题5'],
        content: '文案内容',
        aiScore: 65,
        category: 'food',
      });

      expect(store.titles).toEqual(['标题1', '标题2', '标题3', '标题4', '标题5']);
      expect(store.content).toBe('文案内容');
      expect(store.aiScore).toBe(65);
      expect(store.category).toBe('food');
      expect(store.selectedTitleIndex).toBe(0);
    });

    it('设置结果时应重置 selectedTitleIndex 为 0', () => {
      const store = useGeneratorStore();
      store.selectedTitleIndex = 2;

      store.setResult({
        titles: ['新标题1', '新标题2'],
        content: '新内容',
        aiScore: 50,
        category: 'travel',
      });

      expect(store.selectedTitleIndex).toBe(0);
    });
  });

  describe('setDeAiResult', () => {
    it('应更新内容和新评分', () => {
      const store = useGeneratorStore();
      store.content = '原始文案';
      store.aiScore = 75;

      store.setDeAiResult({
        content: '降AI味后的文案',
        aiScore: 30,
      });

      expect(store.content).toBe('降AI味后的文案');
      expect(store.aiScore).toBe(30);
    });
  });

  describe('selectTitle', () => {
    it('合法索引应更新 selectedTitleIndex', () => {
      const store = useGeneratorStore();
      store.titles = ['标题1', '标题2', '标题3'];

      store.selectTitle(1);
      expect(store.selectedTitleIndex).toBe(1);
    });

    it('负索引应不更新', () => {
      const store = useGeneratorStore();
      store.titles = ['标题1', '标题2'];
      store.selectedTitleIndex = 0;

      store.selectTitle(-1);
      expect(store.selectedTitleIndex).toBe(0);
    });

    it('超出范围的索引应不更新', () => {
      const store = useGeneratorStore();
      store.titles = ['标题1', '标题2'];
      store.selectedTitleIndex = 0;

      store.selectTitle(5);
      expect(store.selectedTitleIndex).toBe(0);
    });

    it('索引为 0 应正常更新', () => {
      const store = useGeneratorStore();
      store.titles = ['标题1', '标题2'];
      store.selectedTitleIndex = 1;

      store.selectTitle(0);
      expect(store.selectedTitleIndex).toBe(0);
    });

    it('索引等于 titles.length - 1 应正常更新', () => {
      const store = useGeneratorStore();
      store.titles = ['标题1', '标题2', '标题3'];

      store.selectTitle(2);
      expect(store.selectedTitleIndex).toBe(2);
    });
  });
});
