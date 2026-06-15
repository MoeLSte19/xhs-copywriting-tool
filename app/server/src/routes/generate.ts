/** 生成相关路由 */
import { Router } from 'express';
import { handleGenerate, handleDeAi } from '../controllers/generateController.js';
import { validateGenerate, validateDeAi } from '../middleware/validate.js';

export const generateRouter = Router();

generateRouter.post('/generate', validateGenerate, handleGenerate);
generateRouter.post('/deai', validateDeAi, handleDeAi);
