/** 剪贴板复制逻辑 Composable */
import { ref } from 'vue';

export function useCopy() {
  const isCopied = ref<boolean>(false);
  const isCopying = ref<boolean>(false);

  /**
   * 复制文本到剪贴板
   * @param text 要复制的文本
   * @returns 是否复制成功
   */
  async function copyToClipboard(text: string): Promise<boolean> {
    if (!text) return false;

    isCopying.value = true;

    try {
      // 优先使用现代 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        isCopied.value = true;
        setTimeout(() => {
          isCopied.value = false;
        }, 2000);
        return true;
      }

      // Fallback: 使用 textarea + execCommand
      return fallbackCopy(text);
    } catch {
      // Clipboard API 失败，降级到 fallback
      return fallbackCopy(text);
    } finally {
      isCopying.value = false;
    }
  }

  /** 降级复制方案 */
  function fallbackCopy(text: string): boolean {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (success) {
        isCopied.value = true;
        setTimeout(() => {
          isCopied.value = false;
        }, 2000);
      }
      return success;
    } catch {
      return false;
    }
  }

  return {
    isCopied,
    isCopying,
    copyToClipboard,
  };
}
