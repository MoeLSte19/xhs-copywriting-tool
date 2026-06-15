/** 环境变量配置加载 */
import dotenv from 'dotenv';

dotenv.config();

interface Config {
  deepseekApiKey: string;
  deepseekBaseUrl: string;
  deepseekModel: string;
  port: number;
}

const config: Config = {
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
  deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  deepseekModel: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  port: parseInt(process.env.PORT || '3000', 10),
};

/** 启动时校验必要配置 */
export function validateConfig(): void {
  if (!config.deepseekApiKey) {
    console.warn('⚠️  DEEPSEEK_API_KEY 未设置，AI 生成功能将不可用');
  }
}

export default config;
