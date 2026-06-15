/** 前端 TypeScript 类型定义 */

/** 分类模板 */
export interface CategoryTemplate {
  id: string;            // 'beauty' | 'food' | 'fashion' | 'travel' | 'shopping' | 'store'
  name: string;          // '美妆' | '美食' | ...
  icon: string;          // emoji 图标
  description: string;   // 简短描述
  promptSuffix: string;  // 分类专属 Prompt 追加内容
}

/** 生成请求 */
export interface GenerateRequest {
  input: string;
  category: string;
}

/** 生成响应 */
export interface GenerateResponse {
  titles: string[];      // 5个爆款标题
  content: string;       // 完整排版文案
  aiScore: number;       // AI味评分 0-100
  category: string;
}

/** 降AI味请求 */
export interface DeAiRequest {
  content: string;
  aiScore: number;
}

/** 降AI味响应 */
export interface DeAiResponse {
  content: string;
  aiScore: number;
}

/** Lmscan 检测结果 */
export interface LmscanDetectResult {
  aiScore: number;       // 0-100，100=完全真人
  confidence: number;    // 置信度 0-100
  details: {
    perplexity: number;  // 困惑度
    burstiness: number;  // 突发性
    vocabulary: number;  // 词汇多样性
  };
  summary: string;       // 检测摘要
}

/** Stop Slop 改写结果 */
export interface StopSlopRewriteResult {
  content: string;       // 改写后的内容
  changes: string[];     // 修改说明列表
  newAiScore: number;    // 改写后的预估 AI 分数
}

/** 完整降 AI 味流程结果 */
export interface FullDeAiResult {
  original: LmscanDetectResult;
  rewritten: StopSlopRewriteResult;
  finalScore: number;
}

/** 服务健康状态 */
export interface ServicesHealth {
  lmscan: boolean;
  stopSlop: boolean;
  message: string;
}

/** 通用 API 响应 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

/** 使用记录 */
export interface UsageRecord {
  date: string;          // YYYY-MM-DD
  count: number;
}
