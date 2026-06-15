/** Pinia Store — 使用次数管理（localStorage，每日 3 次免费） */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UsageRecord } from '../types/index';

const STORAGE_KEY = 'xhs_copywriting_usage';
const DAILY_LIMIT = 3;

/** 获取今天的日期字符串 YYYY-MM-DD */
function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 从 localStorage 读取使用记录 */
function loadUsageRecord(): UsageRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const record: UsageRecord = JSON.parse(raw);
      // 如果日期不是今天，则重置
      if (record.date !== getTodayStr()) {
        return { date: getTodayStr(), count: 0 };
      }
      return record;
    }
  } catch {
    // 解析失败，重置
  }
  return { date: getTodayStr(), count: 0 };
}

/** 保存使用记录到 localStorage */
function saveUsageRecord(record: UsageRecord): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export const useUsageStore = defineStore('usage', () => {
  const record = ref<UsageRecord>(loadUsageRecord());

  /** 今日已用次数 */
  const usedCount = computed(() => record.value.count);

  /** 今日剩余次数 */
  const remainCount = computed(() => Math.max(0, DAILY_LIMIT - record.value.count));

  /** 是否已超出限制 */
  const isLimitReached = computed(() => record.value.count >= DAILY_LIMIT);

  /** 增加一次使用次数 */
  function incrementUsage(): boolean {
    if (isLimitReached.value) return false;
    record.value = { date: getTodayStr(), count: record.value.count + 1 };
    saveUsageRecord(record.value);
    return true;
  }

  /** 刷新（日期切换后调用） */
  function refresh(): void {
    record.value = loadUsageRecord();
  }

  return {
    usedCount,
    remainCount,
    isLimitReached,
    incrementUsage,
    refresh,
  };
});
