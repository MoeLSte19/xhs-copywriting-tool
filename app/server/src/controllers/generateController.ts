/** 生成控制器 — handleGenerate 和 handleDeAi */
import type { Request, Response } from 'express';
import { generateNote, detectAiScore, deAiRewrite } from '../services/aiService.js';

/**
 * POST /api/generate
 * 生成爆款文案 + AI味检测（串行调用）
 */
export async function handleGenerate(req: Request, res: Response): Promise<void> {
  try {
    const { input, category } = req.body;

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      res.status(400).json({ code: 400, data: null, message: '请输入笔记主题' });
      return;
    }

    if (!category || typeof category !== 'string') {
      res.status(400).json({ code: 400, data: null, message: '请选择笔记分类' });
      return;
    }

    // 第一步：生成文案
    const generateResult = await generateNote(input.trim(), category);

    // 第二步：AI味检测
    const detectResult = await detectAiScore(generateResult.content);

    res.json({
      code: 200,
      data: {
        titles: generateResult.titles,
        content: generateResult.content,
        aiScore: detectResult.aiScore,
        category,
      },
      message: '',
    });
  } catch (error: any) {
    console.error('[Generate Error]', error.message);
    res.status(500).json({
      code: 500,
      data: null,
      message: `生成失败: ${error.message || '服务器内部错误'}`,
    });
  }
}

/**
 * POST /api/deai
 * 降AI味改写 + 重新检测（串行调用）
 */
export async function handleDeAi(req: Request, res: Response): Promise<void> {
  try {
    const { content, aiScore } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ code: 400, data: null, message: '请提供文案内容' });
      return;
    }

    if (aiScore === undefined || typeof aiScore !== 'number') {
      res.status(400).json({ code: 400, data: null, message: '请提供 AI味评分' });
      return;
    }

    // 第一步：降AI味改写
    const deAiResult = await deAiRewrite(content, aiScore);

    // 第二步：重新检测 AI味
    const detectResult = await detectAiScore(deAiResult.content);

    res.json({
      code: 200,
      data: {
        content: deAiResult.content,
        aiScore: detectResult.aiScore,
      },
      message: '',
    });
  } catch (error: any) {
    console.error('[DeAi Error]', error.message);
    res.status(500).json({
      code: 500,
      data: null,
      message: `降AI味失败: ${error.message || '服务器内部错误'}`,
    });
  }
}
