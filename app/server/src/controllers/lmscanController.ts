/**
 * Lmscan + Stop Slop 控制器
 * 提供 AI 检测和降 AI 味的 API 接口
 */

import type { Request, Response } from 'express';
import {
  detectWithLmscan,
  rewriteWithStopSlop,
  fullDeAiProcess,
  checkServicesHealth,
} from '../services/lmscanService.js';

/**
 * POST /api/lmscan/detect
 * 使用 Lmscan 检测 AI 痕迹
 */
export async function handleLmscanDetect(req: Request, res: Response): Promise<void> {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({
        code: 400,
        data: null,
        message: '请提供待检测的文本内容',
      });
      return;
    }

    const result = await detectWithLmscan(content.trim());

    res.json({
      code: 200,
      data: result,
      message: '',
    });
  } catch (error: any) {
    console.error('[Lmscan Detect Error]', error.message);
    res.status(500).json({
      code: 500,
      data: null,
      message: `检测失败: ${error.message}`,
    });
  }
}

/**
 * POST /api/lmscan/rewrite
 * 使用 Stop Slop 降 AI 味改写
 */
export async function handleStopSlopRewrite(req: Request, res: Response): Promise<void> {
  try {
    const { content, aiScore } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({
        code: 400,
        data: null,
        message: '请提供待改写的文本内容',
      });
      return;
    }

    if (aiScore === undefined || typeof aiScore !== 'number') {
      res.status(400).json({
        code: 400,
        data: null,
        message: '请提供当前的 AI 味评分',
      });
      return;
    }

    const result = await rewriteWithStopSlop(content.trim(), aiScore);

    res.json({
      code: 200,
      data: result,
      message: '',
    });
  } catch (error: any) {
    console.error('[Stop Slop Rewrite Error]', error.message);
    res.status(500).json({
      code: 500,
      data: null,
      message: `改写失败: ${error.message}`,
    });
  }
}

/**
 * POST /api/lmscan/full-process
 * 完整的降 AI 味流程：检测 + 改写 + 再检测
 */
export async function handleFullDeAiProcess(req: Request, res: Response): Promise<void> {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({
        code: 400,
        data: null,
        message: '请提供待处理的文本内容',
      });
      return;
    }

    const result = await fullDeAiProcess(content.trim());

    res.json({
      code: 200,
      data: result,
      message: '',
    });
  } catch (error: any) {
    console.error('[Full DeAi Process Error]', error.message);
    res.status(500).json({
      code: 500,
      data: null,
      message: `处理失败: ${error.message}`,
    });
  }
}

/**
 * GET /api/lmscan/health
 * 检查 Lmscan 和 Stop Slop 服务状态
 */
export async function handleServicesHealth(_req: Request, res: Response): Promise<void> {
  try {
    const result = await checkServicesHealth();

    res.json({
      code: 200,
      data: result,
      message: '',
    });
  } catch (error: any) {
    console.error('[Health Check Error]', error.message);
    res.status(500).json({
      code: 500,
      data: null,
      message: `健康检查失败: ${error.message}`,
    });
  }
}
