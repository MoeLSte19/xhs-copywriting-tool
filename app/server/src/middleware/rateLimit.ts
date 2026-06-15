/** IP 限流中间件 — 每个 IP 每天 30 次 */
import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 小时
  max: 30,                         // 每个 IP 最多 30 次/天
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    data: null,
    message: '今日使用次数已达上限，请明天再来',
  },
  keyGenerator: (req) => {
    // 优先使用 X-Forwarded-For 头（反向代理场景）
    return req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.ip || 'unknown';
  },
});
