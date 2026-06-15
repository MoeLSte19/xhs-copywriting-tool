/** 免费次数限制逻辑 Composable */
import { useUsageStore } from '../stores/usage';

export function useUsageLimit() {
  const usageStore = useUsageStore();

  /** 今日已用次数 */
  const usedCount = () => usageStore.usedCount;

  /** 今日剩余次数 */
  const remainCount = () => usageStore.remainCount;

  /** 是否已达限制 */
  const isLimitReached = () => usageStore.isLimitReached;

  /** 检查并提示 */
  function checkAndAlert(): boolean {
    usageStore.refresh();
    if (usageStore.isLimitReached) {
      alert('今日免费次数已用完，明天再来吧～');
      return false;
    }
    return true;
  }

  return {
    usedCount,
    remainCount,
    isLimitReached,
    checkAndAlert,
  };
}
