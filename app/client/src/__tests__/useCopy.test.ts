/** useCopy composable 单元测试 — 剪贴板复制逻辑 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCopy } from '../composables/useCopy';

describe('useCopy', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('初始状态：isCopied 为 false，isCopying 为 false', () => {
    const { isCopied, isCopying } = useCopy();
    expect(isCopied.value).toBe(false);
    expect(isCopying.value).toBe(false);
  });

  it('复制空字符串应返回 false', async () => {
    const { copyToClipboard } = useCopy();
    const result = await copyToClipboard('');
    expect(result).toBe(false);
  });

  it('使用 Clipboard API 成功复制应返回 true', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const { copyToClipboard, isCopied } = useCopy();
    const result = await copyToClipboard('测试文本');

    expect(result).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith('测试文本');
    expect(isCopied.value).toBe(true);
  });

  it('Clipboard API 不可用时应使用 fallback', async () => {
    // 移除 clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    // Mock document.execCommand
    const execCommandMock = vi.fn().mockReturnValue(true);
    document.execCommand = execCommandMock;

    const { copyToClipboard } = useCopy();
    const result = await copyToClipboard('测试文本');

    expect(result).toBe(true);
    expect(execCommandMock).toHaveBeenCalledWith('copy');
  });

  it('Clipboard API 抛出异常时应降级到 fallback', async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error('Not allowed'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const execCommandMock = vi.fn().mockReturnValue(true);
    document.execCommand = execCommandMock;

    const { copyToClipboard } = useCopy();
    const result = await copyToClipboard('测试文本');

    expect(result).toBe(true);
    expect(execCommandMock).toHaveBeenCalledWith('copy');
  });

  it('两种方式都失败应返回 false', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const execCommandMock = vi.fn().mockReturnValue(false);
    document.execCommand = execCommandMock;

    const { copyToClipboard } = useCopy();
    const result = await copyToClipboard('测试文本');

    expect(result).toBe(false);
  });

  it('复制过程中 isCopying 应为 true', async () => {
    let resolveClipboard: () => void;
    const writeTextMock = vi.fn().mockImplementation(() => {
      return new Promise<void>((resolve) => {
        resolveClipboard = resolve;
      });
    });

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const { copyToClipboard, isCopying } = useCopy();

    const promise = copyToClipboard('测试文本');
    // 此时应该正在复制
    expect(isCopying.value).toBe(true);

    resolveClipboard!();
    await promise;

    // 复制完成后 isCopying 应为 false
    expect(isCopying.value).toBe(false);
  });
});
