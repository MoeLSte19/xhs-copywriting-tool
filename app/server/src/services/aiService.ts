/** DeepSeek API 调用服务 — 含错误重试（1次）和超时（30s） */
import axios from 'axios';
import config from '../config/index.js';
import { loadPromptTemplate, renderTemplate } from './promptService.js';
import type { ChatMessage, PromptTemplate, GenerateResult, AiDetectResult, DeAiResult } from '../types/index.js';

const API_TIMEOUT = 30000; // 30 秒超时
const MAX_RETRIES = 1;     // 最多重试 1 次

/**
 * 调用 DeepSeek Chat Completions API
 * @param messages 消息列表
 * @param temperature 温度参数
 * @param maxTokens 最大 token 数
 * @returns API 返回的文本内容
 */
async function callDeepSeekAPI(
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number,
): Promise<string> {
  const url = `${config.deepseekBaseUrl}/v1/chat/completions`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.deepseekApiKey}`,
  };
  const body = {
    model: config.deepseekModel,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(url, body, {
        headers,
        timeout: API_TIMEOUT,
      });
      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('DeepSeek API 返回内容为空');
      }
      return content;
    } catch (error: any) {
      lastError = error;
      const status = error?.response?.status;
      // 4xx 错误不重试（除了 429）
      if (status && status >= 400 && status < 500 && status !== 429) {
        throw new Error(`DeepSeek API 错误 (${status}): ${error?.response?.data?.error?.message || error.message}`);
      }
      console.warn(`[DeepSeek API] 第 ${attempt + 1} 次调用失败，${attempt < MAX_RETRIES ? '准备重试...' : '已达最大重试次数'}`, error.message);
    }
  }

  throw new Error(`DeepSeek API 调用失败: ${lastError?.message || '未知错误'}`);
}

/**
 * 从 AI 响应文本中解析 JSON
 * 1. 智能提取：先尝试 ```json...``` 代码块，再尝试 {...} 对象，最后尝试全文
 * 2. 修复常见 JSON 畸形：未转义换行符、尾随逗号等
 * 3. 解析失败时抛出包含原始响应前 200 字符的有意义错误
 */
function extractJSON<T>(text: string): T {
  let jsonStr = '';

  // Step 1: 尝试提取 ```json ... ``` 代码块
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  } else {
    // Step 2: 尝试查找第一个 { 到最后一个 } 之间的内容
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = text.slice(firstBrace, lastBrace + 1);
    } else {
      // Step 3: 都找不到，尝试全文解析
      jsonStr = text.trim();
    }
  }

  // Step 4: 修复常见 JSON 畸形
  jsonStr = repairJSON(jsonStr);

  // Step 5: 尝试解析，失败时抛出有意义的错误
  try {
    return JSON.parse(jsonStr) as T;
  } catch (parseError: any) {
    const preview = text.slice(0, 200);
    throw new Error(
      `JSON 解析失败: ${parseError.message}。原始响应前 200 字符: ${preview}`,
    );
  }
}

/**
 * 修复常见的 JSON 畸形问题
 * - 移除尾随逗号（,] → ], ,} → }）
 * - 修复字符串值中的未转义换行符
 * - 修复字符串值中的未转义引号（智能判断）
 */
function repairJSON(jsonStr: string): string {
  let result = jsonStr;

  // 1. 移除尾随逗号：匹配 ,] 或 ,}（允许中间有空白）
  result = result.replace(/,\s*([}\]])/g, '$1');

  // 2. 修复字符串值中的未转义换行符
  //    遍历字符串，跟踪是否在 JSON 字符串内部，将字符串内的裸换行替换为 \n
  result = fixUnescapedNewlines(result);

  // 3. 修复字符串值中的未转义引号（保守策略：仅在明显是误用时修复）
  //    此步骤较复杂且风险较高，先不做激进替换，依赖 prompt 约束

  return result;
}

/**
 * 修复 JSON 字符串值中的未转义换行符
 * 遍历字符串，跟踪引号状态，将字符串内部的裸换行符替换为 \\n
 */
function fixUnescapedNewlines(str: string): string {
  const chars = [...str];
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (ch === '\\') {
      escapeNext = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    // 字符串内部遇到裸换行符 → 替换为转义的 \n
    if (inString && (ch === '\n' || ch === '\r')) {
      chars[i] = ch === '\r' ? '\\r' : '\\n';
    }
  }

  return chars.join('');
}

/**
 * 生成小红书爆款文案
 * @param input 用户输入主题
 * @param category 分类标识
 * @returns 生成结果（标题 + 正文）
 */
export async function generateNote(input: string, category: string): Promise<GenerateResult> {
  const template: PromptTemplate = loadPromptTemplate('generate');
  const userContent = renderTemplate(template.userTemplate, { input, category });

  const messages: ChatMessage[] = [
    { role: 'system', content: template.system },
    { role: 'user', content: userContent },
  ];

  const raw = await callDeepSeekAPI(messages, template.temperature, template.maxTokens);
  const parsed = extractJSON<{ titles: string[]; content: string }>(raw);

  return {
    titles: parsed.titles,
    content: parsed.content,
    aiScore: 0, // 初始值，后续由 detect 填充
  };
}

/**
 * AI味检测评分
 * @param content 笔记内容
 * @returns 检测结果（评分 + 摘要）
 */
export async function detectAiScore(content: string): Promise<AiDetectResult> {
  const template: PromptTemplate = loadPromptTemplate('detect');
  const userContent = renderTemplate(template.userTemplate, { content });

  const messages: ChatMessage[] = [
    { role: 'system', content: template.system },
    { role: 'user', content: userContent },
  ];

  const raw = await callDeepSeekAPI(messages, template.temperature, template.maxTokens);
  const parsed = extractJSON<{ aiScore: number; summary: string }>(raw);

  return {
    aiScore: Math.min(100, Math.max(0, Math.round(parsed.aiScore))),
    summary: parsed.summary,
  };
}

/**
 * 降AI味改写
 * @param content 原始文案
 * @param aiScore 当前 AI味评分
 * @returns 改写结果
 */
export async function deAiRewrite(content: string, aiScore: number): Promise<DeAiResult> {
  const template: PromptTemplate = loadPromptTemplate('deai');
  const userContent = renderTemplate(template.userTemplate, { content, aiScore: String(aiScore) });

  const messages: ChatMessage[] = [
    { role: 'system', content: template.system },
    { role: 'user', content: userContent },
  ];

  const raw = await callDeepSeekAPI(messages, template.temperature, template.maxTokens);
  const parsed = extractJSON<{ content: string }>(raw);

  return {
    content: parsed.content,
    aiScore: 0, // 初始值，后续由 detect 重新填充
  };
}
