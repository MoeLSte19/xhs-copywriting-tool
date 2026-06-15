/**
 * Lmscan + Stop Slop 控制器
 * 提供 AI 检测和降 AI 味的 API 接口
 * 统一调用 aiService 中的方法，复用 callDeepSeekAPI + extractJSON 健壮解析
 */

import type { Request, Response } from 'express';
import { lmscanDetect, stopSlopRewrite, detectAiScore } from '../services/aiService.js';

/**
 * POST /api/lmscan/detect
 * 使用 Lmscan 检测 AI 痕迹（增强版，含多维度分析）
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

    const result = await lmscanDetect(content.trim());

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

    const result = await stopSlopRewrite(content.trim(), aiScore);

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
 * 串行调用，复用 aiService 统一方法
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

    // 第一步：使用 lmscanDetect 检测
    const detectResult = await lmscanDetect(content.trim());

    // 如果 AI 味已经很低，不需要改写
    if (detectResult.aiScore >= 85) {
      res.json({
        code: 200,
        data: {
          original: detectResult,
          rewritten: {
            content: content.trim(),
            changes: ['文本已足够自然，无需改写'],
            newAiScore: detectResult.aiScore,
          },
          finalScore: detectResult.aiScore,
        },
        message: '',
      });
      return;
    }

    // 第二步：使用 stopSlopRewrite 改写
    const rewriteResult = await stopSlopRewrite(content.trim(), detectResult.aiScore);

    // 第三步：使用 detectAiScore 重新检测改写后的内容
    const finalDetect = await detectAiScore(rewriteResult.content);

    res.json({
      code: 200,
      data: {
        original: detectResult,
        rewritten: {
          content: rewriteResult.content,
          changes: rewriteResult.changes,
          newAiScore: finalDetect.aiScore,
        },
        finalScore: finalDetect.aiScore,
      },
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
    // 使用 DeepSeek 实现，直接返回可用状态
    const result = {
      lmscan: true,
      stopSlop: true,
      message: '使用 DeepSeek API 实现 Lmscan + Stop Slop 功能',
    };

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
