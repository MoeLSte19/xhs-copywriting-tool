/** generateController 单元测试 — 控制器逻辑 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock aiService 模块
vi.mock('../services/aiService.js', () => ({
  generateNote: vi.fn(),
  detectAiScore: vi.fn(),
  deAiRewrite: vi.fn(),
}));

import { handleGenerate, handleDeAi } from '../controllers/generateController.js';
import { generateNote, detectAiScore, deAiRewrite } from '../services/aiService.js';
import type { Request, Response } from 'express';

function createMockReqRes(body: Record<string, any> = {}) {
  const req = { body } as Partial<Request>;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as Partial<Response>;
  return { req: req as Request, res: res as Response };
}

describe('handleGenerate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('合法请求应成功生成文案并返回 200', async () => {
    const { req, res } = createMockReqRes({
      input: '秋季护肤推荐',
      category: 'beauty',
    });

    vi.mocked(generateNote).mockResolvedValue({
      titles: ['标题1', '标题2', '标题3', '标题4', '标题5'],
      content: '这是生成的文案内容',
      aiScore: 0,
    });

    vi.mocked(detectAiScore).mockResolvedValue({
      aiScore: 65,
      summary: '存在一定AI痕迹',
    });

    await handleGenerate(req, res);

    expect(generateNote).toHaveBeenCalledWith('秋季护肤推荐', 'beauty');
    expect(detectAiScore).toHaveBeenCalledWith('这是生成的文案内容');
    expect(res.json).toHaveBeenCalledWith({
      code: 200,
      data: {
        titles: ['标题1', '标题2', '标题3', '标题4', '标题5'],
        content: '这是生成的文案内容',
        aiScore: 65,
        category: 'beauty',
      },
      message: '',
    });
  });

  it('缺少 input 应返回 400', async () => {
    const { req, res } = createMockReqRes({
      category: 'beauty',
    });

    await handleGenerate(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(generateNote).not.toHaveBeenCalled();
  });

  it('input 为空字符串应返回 400', async () => {
    const { req, res } = createMockReqRes({
      input: '',
      category: 'beauty',
    });

    await handleGenerate(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(generateNote).not.toHaveBeenCalled();
  });

  it('缺少 category 应返回 400', async () => {
    const { req, res } = createMockReqRes({
      input: '护肤推荐',
    });

    await handleGenerate(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(generateNote).not.toHaveBeenCalled();
  });

  it('AI 服务异常应返回 500', async () => {
    const { req, res } = createMockReqRes({
      input: '护肤推荐',
      category: 'beauty',
    });

    vi.mocked(generateNote).mockRejectedValue(new Error('API 调用失败'));

    await handleGenerate(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('input 应被 trim 处理', async () => {
    const { req, res } = createMockReqRes({
      input: '  护肤推荐  ',
      category: 'beauty',
    });

    vi.mocked(generateNote).mockResolvedValue({
      titles: ['标题1'],
      content: '文案',
      aiScore: 0,
    });

    vi.mocked(detectAiScore).mockResolvedValue({
      aiScore: 50,
      summary: '一般',
    });

    await handleGenerate(req, res);

    expect(generateNote).toHaveBeenCalledWith('护肤推荐', 'beauty');
  });
});

describe('handleDeAi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('合法请求应成功降AI味并返回 200', async () => {
    const { req, res } = createMockReqRes({
      content: '这是原始文案',
      aiScore: 75,
    });

    vi.mocked(deAiRewrite).mockResolvedValue({
      content: '这是降AI味后的文案',
      aiScore: 0,
    });

    vi.mocked(detectAiScore).mockResolvedValue({
      aiScore: 30,
      summary: 'AI痕迹明显降低',
    });

    await handleDeAi(req, res);

    expect(deAiRewrite).toHaveBeenCalledWith('这是原始文案', 75);
    expect(detectAiScore).toHaveBeenCalledWith('这是降AI味后的文案');
    expect(res.json).toHaveBeenCalledWith({
      code: 200,
      data: {
        content: '这是降AI味后的文案',
        aiScore: 30,
      },
      message: '',
    });
  });

  it('缺少 content 应返回 400', async () => {
    const { req, res } = createMockReqRes({
      aiScore: 75,
    });

    await handleDeAi(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(deAiRewrite).not.toHaveBeenCalled();
  });

  it('content 为空字符串应返回 400', async () => {
    const { req, res } = createMockReqRes({
      content: '',
      aiScore: 75,
    });

    await handleDeAi(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('缺少 aiScore 应返回 400', async () => {
    const { req, res } = createMockReqRes({
      content: '文案内容',
    });

    await handleDeAi(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('AI 服务异常应返回 500', async () => {
    const { req, res } = createMockReqRes({
      content: '文案内容',
      aiScore: 75,
    });

    vi.mocked(deAiRewrite).mockRejectedValue(new Error('API 调用失败'));

    await handleDeAi(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
