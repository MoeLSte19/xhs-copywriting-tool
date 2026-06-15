/** 生成逻辑 Composable */
import { useGeneratorStore } from '../stores/generator';
import { useUsageStore } from '../stores/usage';
import { generateNote } from '../services/api';

export function useGenerate() {
  const store = useGeneratorStore();
  const usageStore = useUsageStore();

  /**
   * 执行生成
   * @returns 是否生成成功
   */
  async function doGenerate(): Promise<boolean> {
    // 校验输入
    if (!store.input.trim()) {
      alert('请先输入笔记主题哦～');
      return false;
    }

    // 校验次数
    usageStore.refresh();
    if (usageStore.isLimitReached) {
      alert('今日免费次数已用完，明天再来吧～');
      return false;
    }

    // 开始生成
    store.isGenerating = true;
    store.resetResult();

    try {
      const res = await generateNote({
        input: store.input.trim(),
        category: store.category,
      });

      if (res.code === 200 && res.data) {
        store.setResult(res.data);
        usageStore.incrementUsage();
        return true;
      } else {
        alert(res.message || '生成失败，请重试');
        return false;
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || '网络错误，请稍后重试';
      alert(msg);
      return false;
    } finally {
      store.isGenerating = false;
    }
  }

  return {
    doGenerate,
  };
}
