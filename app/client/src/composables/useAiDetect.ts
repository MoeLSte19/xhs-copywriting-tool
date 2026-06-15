/** AI味检测逻辑 Composable */
import { useGeneratorStore } from '../stores/generator';
import { deAiRewrite } from '../services/api';

export function useAiDetect() {
  const store = useGeneratorStore();

  /**
   * 执行降AI味改写
   * @returns 是否改写成功
   */
  async function doDeAi(): Promise<boolean> {
    if (!store.content) {
      alert('没有可改写的内容');
      return false;
    }

    store.isDeAiing = true;

    try {
      const res = await deAiRewrite({
        content: store.content,
        aiScore: store.aiScore,
      });

      if (res.code === 200 && res.data) {
        store.setDeAiResult(res.data);
        return true;
      } else {
        alert(res.message || '降AI味失败，请重试');
        return false;
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || '网络错误，请稍后重试';
      alert(msg);
      return false;
    } finally {
      store.isDeAiing = false;
    }
  }

  return {
    doDeAi,
  };
}
