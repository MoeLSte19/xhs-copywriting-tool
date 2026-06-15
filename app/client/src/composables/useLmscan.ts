/**
 * Lmscan + Stop Slop 组合式函数
 * 提供 AI 检测和降 AI 味的功能
 */

import { ref } from 'vue';
import { useGeneratorStore } from '../stores/generator';
import {
  lmscanDetect,
  stopSlopRewrite,
  fullDeAiProcess,
  checkServicesHealth,
} from '../services/api';
import type { LmscanDetectResult, StopSlopRewriteResult, FullDeAiResult, ServicesHealth } from '../types';

export function useLmscan() {
  const store = useGeneratorStore();

  // 状态
  const isDetecting = ref(false);
  const isRewriting = ref(false);
  const isProcessing = ref(false);

  // 检测结果
  const detectResult = ref<LmscanDetectResult | null>(null);

  // 改写结果
  const rewriteResult = ref<StopSlopRewriteResult | null>(null);

  // 完整流程结果
  const fullResult = ref<FullDeAiResult | null>(null);

  // 服务状态
  const servicesHealth = ref<ServicesHealth | null>(null);

  /**
   * 使用 Lmscan 检测 AI 痕迹
   * @returns 是否检测成功
   */
  async function doLmscanDetect(): Promise<boolean> {
    if (!store.content) {
      alert('没有可检测的内容');
      return false;
    }

    isDetecting.value = true;
    detectResult.value = null;

    try {
      const res = await lmscanDetect(store.content);

      if (res.code === 200 && res.data) {
        detectResult.value = res.data;
        // 更新 store 中的 AI 分数
        store.aiScore = res.data.aiScore;
        return true;
      } else {
        alert(res.message || '检测失败，请重试');
        return false;
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || '网络错误，请稍后重试';
      alert(msg);
      return false;
    } finally {
      isDetecting.value = false;
    }
  }

  /**
   * 使用 Stop Slop 降 AI 味改写
   * @returns 是否改写成功
   */
  async function doStopSlopRewrite(): Promise<boolean> {
    if (!store.content) {
      alert('没有可改写的内容');
      return false;
    }

    isRewriting.value = true;
    rewriteResult.value = null;

    try {
      const res = await stopSlopRewrite(store.content, store.aiScore);

      if (res.code === 200 && res.data) {
        rewriteResult.value = res.data;
        // 更新 store 中的内容和分数
        store.content = res.data.content;
        store.aiScore = res.data.newAiScore;
        return true;
      } else {
        alert(res.message || '改写失败，请重试');
        return false;
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || '网络错误，请稍后重试';
      alert(msg);
      return false;
    } finally {
      isRewriting.value = false;
    }
  }

  /**
   * 执行完整的降 AI 味流程（Lmscan + Stop Slop）
   * @returns 是否处理成功
   */
  async function doFullDeAiProcess(): Promise<boolean> {
    if (!store.content) {
      alert('没有可处理的内容');
      return false;
    }

    isProcessing.value = true;
    fullResult.value = null;

    try {
      const res = await fullDeAiProcess(store.content);

      if (res.code === 200 && res.data) {
        fullResult.value = res.data;
        // 更新 store 中的内容和分数
        store.content = res.data.rewritten.content;
        store.aiScore = res.data.finalScore;
        return true;
      } else {
        alert(res.message || '处理失败，请重试');
        return false;
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || '网络错误，请稍后重试';
      alert(msg);
      return false;
    } finally {
      isProcessing.value = false;
    }
  }

  /**
   * 检查 Lmscan 和 Stop Slop 服务状态
   * @returns 是否检查成功
   */
  async function doCheckServicesHealth(): Promise<boolean> {
    try {
      const res = await checkServicesHealth();

      if (res.code === 200 && res.data) {
        servicesHealth.value = res.data;
        return true;
      } else {
        console.error('服务状态检查失败:', res.message);
        return false;
      }
    } catch (error: any) {
      console.error('服务状态检查失败:', error.message);
      return false;
    }
  }

  /**
   * 重置所有结果
   */
  function resetResults(): void {
    detectResult.value = null;
    rewriteResult.value = null;
    fullResult.value = null;
  }

  return {
    // 状态
    isDetecting,
    isRewriting,
    isProcessing,

    // 结果
    detectResult,
    rewriteResult,
    fullResult,
    servicesHealth,

    // 方法
    doLmscanDetect,
    doStopSlopRewrite,
    doFullDeAiProcess,
    doCheckServicesHealth,
    resetResults,
  };
}
