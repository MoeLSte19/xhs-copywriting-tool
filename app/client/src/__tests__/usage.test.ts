/** usage store 单元测试 — 使用次数管理 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUsageStore } from '../stores/usage';

describe('useUsageStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初始状态：已用 0 次，剩余 3 次，未达限制', () => {
    const store = useUsageStore();
    expect(store.usedCount).toBe(0);
    expect(store.remainCount).toBe(3);
    expect(store.isLimitReached).toBe(false);
  });

  it('incrementUsage 应增加一次使用次数', () => {
    const store = useUsageStore();
    const result = store.incrementUsage();
    expect(result).toBe(true);
    expect(store.usedCount).toBe(1);
    expect(store.remainCount).toBe(2);
  });

  it('连续增加3次后应达到限制', () => {
    const store = useUsageStore();
    store.incrementUsage();
    store.incrementUsage();
    store.incrementUsage();

    expect(store.usedCount).toBe(3);
    expect(store.remainCount).toBe(0);
    expect(store.isLimitReached).toBe(true);
  });

  it('达到限制后 incrementUsage 应返回 false', () => {
    const store = useUsageStore();
    store.incrementUsage();
    store.incrementUsage();
    store.incrementUsage();

    const result = store.incrementUsage();
    expect(result).toBe(false);
    expect(store.usedCount).toBe(3);
  });

  it('remainCount 不应为负数', () => {
    const store = useUsageStore();
    store.incrementUsage();
    store.incrementUsage();
    store.incrementUsage();
    store.incrementUsage(); // 第4次，应该被拒绝

    expect(store.remainCount).toBe(0);
  });

  it('使用记录应持久化到 localStorage', () => {
    const store = useUsageStore();
    store.incrementUsage();

    const stored = localStorage.getItem('xhs_copywriting_usage');
    expect(stored).not.toBeNull();
    const record = JSON.parse(stored!);
    expect(record.count).toBe(1);
    expect(record.date).toBe('2024-06-15');
  });

  it('日期变更后应自动重置次数', () => {
    const store = useUsageStore();
    store.incrementUsage();
    store.incrementUsage();
    expect(store.usedCount).toBe(2);

    // 模拟日期变更到第二天
    vi.setSystemTime(new Date('2024-06-16'));
    store.refresh();
    expect(store.usedCount).toBe(0);
    expect(store.remainCount).toBe(3);
  });

  it('localStorage 数据损坏时应重置为初始值', () => {
    localStorage.setItem('xhs_copywriting_usage', 'invalid-json');

    const store = useUsageStore();
    expect(store.usedCount).toBe(0);
    expect(store.remainCount).toBe(3);
  });
});
