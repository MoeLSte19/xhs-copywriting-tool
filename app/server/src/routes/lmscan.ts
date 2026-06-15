/**
 * Lmscan + Stop Slop 路由
 */

import { Router } from 'express';
import {
  handleLmscanDetect,
  handleStopSlopRewrite,
  handleFullDeAiProcess,
  handleServicesHealth,
} from '../controllers/lmscanController.js';
import {
  validateLmscanDetect,
  validateStopSlopRewrite,
  validateFullDeAiProcess,
} from '../middleware/validate.js';

const router = Router();

// Lmscan AI 检测
router.post('/lmscan/detect', validateLmscanDetect, handleLmscanDetect);

// Stop Slop 降 AI 味改写
router.post('/lmscan/rewrite', validateStopSlopRewrite, handleStopSlopRewrite);

// 完整的降 AI 味流程
router.post('/lmscan/full-process', validateFullDeAiProcess, handleFullDeAiProcess);

// 服务健康检查
router.get('/lmscan/health', handleServicesHealth);

export { router as lmscanRouter };
