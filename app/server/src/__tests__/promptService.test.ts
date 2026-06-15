/** promptService 单元测试 — 模板加载与变量替换 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderTemplate, clearTemplateCache } from '../services/promptService.js';

describe('renderTemplate', () => {
  it('应正确替换单个变量', () => {
    const template = '主题是：{{input}}，分类：beauty';
    const result = renderTemplate(template, { input: '秋季护肤' });
    expect(result).toBe('主题是：秋季护肤，分类：beauty');
  });

  it('应正确替换多个变量', () => {
    const template = '主题：{{input}}，分类：{{category}}';
    const result = renderTemplate(template, { input: '平价好物', category: 'shopping' });
    expect(result).toBe('主题：平价好物，分类：shopping');
  });

  it('应替换同一变量多次出现', () => {
    const template = '{{input}} 是关于 {{input}} 的笔记';
    const result = renderTemplate(template, { input: '美妆' });
    expect(result).toBe('美妆 是关于 美妆 的笔记');
  });

  it('未提供的变量应保留占位符', () => {
    const template = '主题：{{input}}，分类：{{category}}';
    const result = renderTemplate(template, { input: '护肤' });
    expect(result).toBe('主题：护肤，分类：{{category}}');
  });

  it('空变量对象应保留所有占位符', () => {
    const template = '主题：{{input}}，分类：{{category}}';
    const result = renderTemplate(template, {});
    expect(result).toBe(template);
  });

  it('空模板应返回空字符串', () => {
    const result = renderTemplate('', { input: '测试' });
    expect(result).toBe('');
  });

  it('无占位符的模板应原样返回', () => {
    const template = '这是一段没有变量的文本';
    const result = renderTemplate(template, { input: '测试' });
    expect(result).toBe(template);
  });

  it('应正确处理变量值为空字符串', () => {
    const template = '主题：{{input}}';
    const result = renderTemplate(template, { input: '' });
    expect(result).toBe('主题：');
  });

  it('应正确处理包含特殊字符的变量值', () => {
    const template = '内容：{{content}}';
    const result = renderTemplate(template, { content: '<script>alert("xss")</script>' });
    expect(result).toBe('内容：<script>alert("xss")</script>');
  });

  it('应正确处理包含换行符的变量值', () => {
    const template = '内容：{{content}}';
    const result = renderTemplate(template, { content: '第一行\n第二行' });
    expect(result).toBe('内容：第一行\n第二行');
  });
});

describe('clearTemplateCache', () => {
  beforeEach(() => {
    clearTemplateCache();
  });

  it('清除缓存后应能重新加载模板', () => {
    // This test verifies the cache can be cleared without error
    expect(() => clearTemplateCache()).not.toThrow();
  });
});
