import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { rateLimiter } from './middleware/rateLimit.js';
import { generateRouter } from './routes/generate.js';
import { lmscanRouter } from './routes/lmscan.js';
import { validateConfig } from './config/index.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// 中间件
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// 限流
app.use('/api', rateLimiter);

// 路由
app.use('/api', generateRouter);
app.use('/api', lmscanRouter);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ code: 200, data: { status: 'ok' }, message: '' });
});

// 全局错误处理
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({
    code: 500,
    data: null,
    message: '服务器内部错误，请稍后再试',
  });
});

// 启动时校验配置
validateConfig();

// 启动服务
app.listen(PORT, () => {
  console.log(`🚀 笔记侠服务已启动: http://localhost:${PORT}`);
});

export default app;
