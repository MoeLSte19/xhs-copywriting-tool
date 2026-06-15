/** Prompt 模板加载服务 — 从 JSON 文件加载并支持变量替换 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { PromptTemplate } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Prompt JSON 文件目录（项目根目录下 prompts/） */
const PROMPTS_DIR = path.resolve(__dirname, '../../prompts');

/** 缓存已加载的模板 */
const templateCache = new Map<string, PromptTemplate>();

/**
 * 加载 Prompt 模板 JSON 文件
 * @param name 模板名称（不含 .json 后缀）
 * @returns PromptTemplate 对象
 */
export function loadPromptTemplate(name: string): PromptTemplate {
  // 优先读缓存
  if (templateCache.has(name)) {
    return templateCache.get(name)!;
  }

  const filePath = path.join(PROMPTS_DIR, `${name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Prompt 模板文件不存在: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const template: PromptTemplate = JSON.parse(raw);
  templateCache.set(name, template);
  return template;
}

/**
 * 将模板中的 {{variable}} 占位符替换为实际值
 * @param template 模板字符串
 * @param vars 变量键值对
 * @returns 替换后的字符串
 */
export function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const placeholder = `{{${key}}}`;
    result = result.replaceAll(placeholder, value);
  }
  return result;
}

/** 清除模板缓存（方便开发时热更新） */
export function clearTemplateCache(): void {
  templateCache.clear();
}
