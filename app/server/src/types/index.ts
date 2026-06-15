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
