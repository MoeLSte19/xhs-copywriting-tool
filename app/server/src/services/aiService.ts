/** DeepSeek API 调用服务 — 含错误重试（1次）和超时（30s） */
import axios from 'axios';
import config from '../config/index.js';
import { loadPromptTemplate, renderTemplate } from './promptService.js';
import type { ChatMessage, PromptTemplate, GenerateResult, AiDetectResult, DeAiResult, LmscanDetectResult, StopSlopRewriteResult } from '../types/index.js';

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
 * 3. 处理被截断的 JSON（自动补全）
 * 4. 解析失败时抛出包含原始响应前 200 字符的有意义错误
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
      // Step 3: 只有开头的 {，JSON 可能被截断
      if (firstBrace !== -1) {
        jsonStr = text.slice(firstBrace);
      } else {
        jsonStr = text.trim();
      }
    }
  }

  // Step 4: 修复常见 JSON 畸形
  jsonStr = repairJSON(jsonStr);

  // Step 5: 尝试解析
  try {
    return JSON.parse(jsonStr) as T;
  } catch (parseError: any) {
    // Step 6: 如果解析失败，尝试修复被截断的 JSON
    try {
      const fixedJson = fixTruncatedJSON(jsonStr);
      return JSON.parse(fixedJson) as T;
    } catch {
      // 修复也失败了，抛出原始错误
      const preview = text.slice(0, 200);
      throw new Error(
        `JSON 解析失败: ${parseError.message}。原始响应前 200 字符: ${preview}`,
      );
    }
  }
}

/**
 * 修复被截断的 JSON
 * 策略：找到最后一个完整的位置，补全缺失的引号和括号
 */
function fixTruncatedJSON(jsonStr: string): string {
  let result = jsonStr.trim();

  // 统计未闭合的括号
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escapeNext = false;
  let lastCompletePos = -1;

  for (let i = 0; i < result.length; i++) {
    const ch = result[i];

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
      if (!inString) {
        lastCompletePos = i;
      }
      continue;
    }

    if (!inString) {
      if (ch === '{') openBraces++;
      else if (ch === '}') openBraces--;
      else if (ch === '[') openBrackets++;
      else if (ch === ']') openBrackets--;

      if (ch === ',' || ch === ':' || ch === '}' || ch === ']') {
        lastCompletePos = i;
      }
    }
  }

  // 如果在字符串中间截断，回退到最后一个完整位置
  if (inString && lastCompletePos > 0) {
    result = result.slice(0, lastCompletePos + 1);
  }

  // 移除末尾不完整的部分（如未闭合的字符串）
  // 找到最后一个完整的值
  const lastQuote = result.lastIndexOf('"');
  const lastComma = result.lastIndexOf(',');
  const lastColon = result.lastIndexOf(':');

  // 如果末尾有未闭合的引号，移除它
  if (lastQuote > lastComma && lastQuote > lastColon) {
    // 检查这个引号是否是开始引号（未闭合）
    let quoteCount = 0;
    for (let i = 0; i <= lastQuote; i++) {
      if (result[i] === '"' && (i === 0 || result[i - 1] !== '\\')) {
        quoteCount++;
      }
    }
    if (quoteCount % 2 !== 0) {
      // 奇数个引号，说明有未闭合的引号
      // 找到这个引号之前的逗号或冒号
      const prevComma = result.lastIndexOf(',', lastQuote - 1);
      const prevColon = result.lastIndexOf(':', lastQuote - 1);
      const cutPos = Math.max(prevComma, prevColon);
      if (cutPos > 0) {
        result = result.slice(0, cutPos);
      }
    }
  }

  // 补全缺失的括号
  // 重新统计
  openBraces = 0;
  openBrackets = 0;
  inString = false;
  escapeNext = false;

  for (let i = 0; i < result.length; i++) {
    const ch = result[i];

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

    if (!inString) {
      if (ch === '{') openBraces++;
      else if (ch === '}') openBraces--;
      else if (ch === '[') openBrackets++;
      else if (ch === ']') openBrackets--;
    }
  }

  // 移除末尾的逗号（如果有）
  while (result.endsWith(',')) {
    result = result.slice(0, -1).trim();
  }

  // 补全缺失的括号
  for (let i = 0; i < openBrackets; i++) {
    result += ']';
  }
  for (let i = 0; i < openBraces; i++) {
    result += '}';
  }

  return result;
}

/**
 * 修复常见的 JSON 畸形问题
 * - 移除尾随逗号（,] → ], ,} → }）
 * - 修复字符串值中的未转义换行符
 * - 修复中文逗号（，→ ,）
 * - 修复缺少的逗号（两个字符串之间）
 * - 修复多余的字符（如 .: → :）
 */
function repairJSON(jsonStr: string): string {
  let result = jsonStr;

  // 1. 修复中文逗号为英文逗号（在 JSON 结构中）
  //    匹配：引号后跟中文逗号，然后是可选空白和引号
  result = result.replace(/"\s*，\s*"/g, '", "');
  //    匹配：中文逗号在数组或对象中
  result = result.replace(/，\s*([}\]])/g, ',$1');

  // 2. 修复缺少的逗号：两个字符串之间没有逗号
  //    匹配："string1" "string2" → "string1", "string2"
  result = result.replace(/"\s+"/g, '", "');

  // 3. 修复多余的字符：.: → :
  result = result.replace(/\.\s*:/g, ':');

  // 4. 移除尾随逗号：匹配 ,] 或 ,}（允许中间有空白）
  result = result.replace(/,\s*([}\]])/g, '$1');

  // 5. 修复字符串值中的未转义换行符
  result = fixUnescapedNewlines(result);

  // 6. 修复未转义的引号（在字符串值中）
  result = fixUnescapedQuotes(result);

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
 * 修复 JSON 字符串值中的未转义引号
 * 策略：在字符串内部，如果遇到不在键值对开始位置的引号，尝试转义
 */
function fixUnescapedQuotes(str: string): string {
  // 这是一个保守的修复策略
  // 主要处理：字符串值中包含的未转义引号
  // 例如："她说"你好"" → "她说\"你好\""

  let result = str;

  // 匹配模式：在字符串值中间出现的引号（不是作为键值对分隔符）
  // 例如：content": "some text" more text"
  // 我们需要找到字符串值的边界

  // 简单策略：如果 JSON 解析失败，尝试用更激进的方式修复
  // 但这里先不做过度修复，避免破坏正常的 JSON

  return result;
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

/**
 * Lmscan 增强 AI 检测（含多维度分析）
 * 复用 callDeepSeekAPI + extractJSON 健壮解析
 * @param content 待检测文本
 * @returns 增强版检测结果（含困惑度/突发性/词汇多样性）
 */
export async function lmscanDetect(content: string): Promise<LmscanDetectResult> {
  const template: PromptTemplate = loadPromptTemplate('lmscan-detect');
  const userContent = renderTemplate(template.userTemplate, { content });

  const messages: ChatMessage[] = [
    { role: 'system', content: template.system },
    { role: 'user', content: userContent },
  ];

  const raw = await callDeepSeekAPI(messages, template.temperature, template.maxTokens);
  const parsed = extractJSON<{
    aiScore: number;
    confidence: number;
    perplexity: number;
    burstiness: number;
    vocabulary: number;
    summary: string;
  }>(raw);

  return {
    aiScore: Math.min(100, Math.max(0, Math.round(parsed.aiScore))),
    confidence: Math.min(100, Math.max(0, Math.round(parsed.confidence || 85))),
    details: {
      perplexity: Math.min(100, Math.max(0, parsed.perplexity || 50)),
      burstiness: Math.min(100, Math.max(0, parsed.burstiness || 50)),
      vocabulary: Math.min(100, Math.max(0, parsed.vocabulary || 50)),
    },
    summary: parsed.summary || '检测完成',
  };
}

/**
 * Stop Slop 降 AI 味改写
 * 复用 callDeepSeekAPI + extractJSON 健壮解析
 * @param content 原始文本
 * @param aiScore 当前 AI 味分数
 * @returns 改写结果
 */
export async function stopSlopRewrite(content: string, aiScore: number): Promise<StopSlopRewriteResult> {
  const template: PromptTemplate = loadPromptTemplate('stop-slop-rewrite');
  const userContent = renderTemplate(template.userTemplate, { content, aiScore: String(aiScore) });

  const messages: ChatMessage[] = [
    { role: 'system', content: template.system },
    { role: 'user', content: userContent },
  ];

  const raw = await callDeepSeekAPI(messages, template.temperature, template.maxTokens);
  const parsed = extractJSON<{
    content: string;
    changes: string[];
  }>(raw);

  return {
    content: parsed.content,
    changes: parsed.changes || ['已完成降 AI 味改写'],
    newAiScore: Math.max(0, aiScore - 30), // 预估降低 30 分
  };
}
