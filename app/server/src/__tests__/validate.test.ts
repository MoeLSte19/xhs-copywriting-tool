/** validate 中间件单元测试 — 参数校验 */
import { describe, it, expect, vi } from 'vitest';
import { validateGenerate, validateDeAi } from '../middleware/validate.js';
import type { Request, Response, NextFunction } from 'express';

/** 创建 mock 的 req/res/next */
function createMockReqRes(body: Record<string, any> = {}) {
  const req = {
    body,
  } as Partial<Request>;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as Partial<Response>;
  const next = vi.fn() as NextFunction;
  return { req: req as Request, res: res as Response, next };
}

describe('validateGenerate', () => {
  it('合法参数应通过校验并调用 next()', () => {
    const { req, res, next } = createMockReqRes({
      input: '秋季护肤推荐',
      category: 'beauty',
    });
    validateGenerate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('缺少 input 应返回 400', () => {
    const { req, res, next } = createMockReqRes({
      category: 'beauty',
    });
    validateGenerate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('input 为空字符串应返回 400', () => {
    const { req, res, next } = createMockReqRes({
      input: '',
      category: 'beauty',
    });
    validateGenerate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('input 为纯空格应返回 400', () => {
    const { req, res, next } = createMockReqRes({
      input: '   ',
      category: 'beauty',
    });
    validateGenerate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('input 为非字符串类型应返回 400', () => {
    const { req, res, next } = createMockReqRes({
      input: 123,
      category: 'beauty',
    });
    validateGenerate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('input 超过 500 字应返回 400', () => {
    const { req, res, next } = createMockReqRes({
      input: 'a'.repeat(501),
      category: 'beauty',
    });
    validateGenerate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('input 恰好 500 字应通过校验', () => {
    const { req, res, next } = createMockReqRes({
      input: 'a'.repeat(500),
      category: 'beauty',
    });
    validateGenerate(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('缺少 category 应返回 400', () => {
    const { req, res, next } = createMockReqRes({
      input: '护肤推荐',
    });
    validateGenerate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('category 为非字符串类型应返回 400', () => {
    const { req, res, next } = createMockReqRes({
      input: '护肤推荐',
      category: 123,
    });
    validateGenerate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('无效的 category 值应返回 400', () => {
    const { req, res, next } = createMockReqRes({
      input: '护肤推荐',
      category: 'invalid',
    });
    validateGenerate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('所有合法分类都应通过校验', () => {
    const validCategories = ['beauty', 'food', 'fashion', 'travel', 'shopping', 'store'];
    for (const category of validCategories) {
      const { req, res, next } = createMockReqRes({
        input: '测试主题',
        category,
      });
      validateGenerate(req, res, next);
      expect(next).toHaveBeenCalled();
    }
  });
});

describe('validateDeAi', () => {
  it('合法参数应通过校验并调用 next()', () => {
    const { req, res, next } = createMockReqRes({
      content: '这是一段文案内容',
      aiScore: 75,
    });
    validateDeAi(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('缺少 content 应返回 400', () => {
    const { req, res, next } = createMockReqRes({
      aiScore: 75,
    });
    validateDeAi(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('content 为空字符串应返回 400', () => {
    const { req, res, next } = createMockReqRes({
      content: '',
      aiScore: 75,
    });
    validateDeAi(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('content 为非字符串类型应返回 400', () => {
    const { req, res, next } = createMockReqRes({
      content: 123,
      aiScore: 75,
    });
    validateDeAi(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('缺少 aiScore 应返回 400', () => {
    const { req, res, next } = createMockReqRes({
      content: '文案内容',
    });
    validateDeAi(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('aiScore 为非数字类型应返回 400', () => {
    const { req, res, next } = createMockReqRes({
      content: '文案内容',
      aiScore: '75',
    });
    validateDeAi(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('aiScore 小于 0 应返回 400', () => {
    const { req, res, next } = createMockReqRes({
      content: '文案内容',
      aiScore: -1,
    });
    validateDeAi(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('aiScore 大于 100 应返回 400', () => {
    const { req, res, next } = createMockReqRes({
      content: '文案内容',
      aiScore: 101,
    });
    validateDeAi(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('aiScore 为 0 应通过校验', () => {
    const { req, res, next } = createMockReqRes({
      content: '文案内容',
      aiScore: 0,
    });
    validateDeAi(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('aiScore 为 100 应通过校验', () => {
    const { req, res, next } = createMockReqRes({
      content: '文案内容',
      aiScore: 100,
    });
    validateDeAi(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
