/** 后端 TypeScript 类型定义 */

/** 聊天消息 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Prompt 模板 */
export interface PromptTemplate {
  system: string;
  userTemplate: string;
  temperature: number;
  maxTokens: number;
}

/** DeepSeek API 响应 */
export interface DeepSeekResponse {
  id: string;
  choices: Array<{
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/** 生成结果 */
export interface GenerateResult {
  titles: string[];
  content: string;
  aiScore: number;
}

/** AI味检测结果 */
export interface AiDetectResult {
  aiScore: number;
  summary: string;
}

/** 降AI味结果 */
export interface DeAiResult {
  content: string;
  aiScore: number;
}

/** Lmscan 检测结果（增强版，含多维度分析） */
export interface LmscanDetectResult {
  aiScore: number;       // 0-100，0=完全AI，100=完全真人
  confidence: number;    // 置信度 0-100
  details: {
    perplexity: number;  // 困惑度
    burstiness: number;  // 突发性
    vocabulary: number;  // 词汇多样性
  };
  summary: string;
}

/** Stop Slop 改写结果 */
export interface StopSlopRewriteResult {
  content: string;       // 改写后的内容
  changes: string[];     // 修改说明列表
  newAiScore: number;    // 改写后的预估 AI 分数
}
