/** 请求参数校验中间件 */
import type { Request, Response, NextFunction } from 'express';

/**
 * POST /api/generate 参数校验
 */
export function validateGenerate(req: Request, res: Response, next: NextFunction): void {
  const { input, category } = req.body;

  if (!input || typeof input !== 'string' || input.trim().length === 0) {
    res.status(400).json({ code: 400, data: null, message: '请输入笔记主题' });
    return;
  }

  if (input.trim().length > 500) {
    res.status(400).json({ code: 400, data: null, message: '主题描述不超过500字' });
    return;
  }

  if (!category || typeof category !== 'string') {
    res.status(400).json({ code: 400, data: null, message: '请选择笔记分类' });
    return;
  }

  const validCategories = ['beauty', 'food', 'fashion', 'travel', 'shopping', 'store'];
  if (!validCategories.includes(category)) {
    res.status(400).json({ code: 400, data: null, message: '无效的分类' });
    return;
  }

  next();
}

/**
 * POST /api/deai 参数校验
 */
export function validateDeAi(req: Request, res: Response, next: NextFunction): void {
  const { content, aiScore } = req.body;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    res.status(400).json({ code: 400, data: null, message: '请提供文案内容' });
    return;
  }

  if (aiScore === undefined || typeof aiScore !== 'number') {
    res.status(400).json({ code: 400, data: null, message: '请提供 AI味评分' });
    return;
  }

  if (aiScore < 0 || aiScore > 100) {
    res.status(400).json({ code: 400, data: null, message: 'AI味评分应在 0-100 之间' });
    return;
  }

  next();
}
