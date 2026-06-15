/** 后端 API 调用封装 */
import axios from 'axios';
import type {
  GenerateRequest,
  GenerateResponse,
  DeAiRequest,
  DeAiResponse,
  ApiResponse,
  LmscanDetectResult,
  StopSlopRewriteResult,
  FullDeAiResult,
  ServicesHealth,
} from '../types/index';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60000, // 60s 超时（后端需要串行调用多次 AI）
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 生成小红书爆款文案
 * @param data 生成请求参数
 * @returns 生成响应（标题 + 文案 + AI味评分）
 */
export async function generateNote(data: GenerateRequest): Promise<ApiResponse<GenerateResponse>> {
  const response = await apiClient.post<ApiResponse<GenerateResponse>>('/generate', data);
  return response.data;
}

/**
 * 降AI味改写（使用 DeepSeek）
 * @param data 降AI味请求参数
 * @returns 改写响应（新文案 + 新评分）
 */
export async function deAiRewrite(data: DeAiRequest): Promise<ApiResponse<DeAiResponse>> {
  const response = await apiClient.post<ApiResponse<DeAiResponse>>('/deai', data);
  return response.data;
}

/**
 * 使用 Lmscan 检测 AI 痕迹
 * @param content 待检测文本
 * @returns 检测结果
 */
export async function lmscanDetect(content: string): Promise<ApiResponse<LmscanDetectResult>> {
  const response = await apiClient.post<ApiResponse<LmscanDetectResult>>('/lmscan/detect', { content });
  return response.data;
}

/**
 * 使用 Stop Slop（Claude）降 AI 味改写
 * @param content 原始文本
 * @param aiScore 当前 AI 味分数
 * @returns 改写结果
 */
export async function stopSlopRewrite(
  content: string,
  aiScore: number
): Promise<ApiResponse<StopSlopRewriteResult>> {
  const response = await apiClient.post<ApiResponse<StopSlopRewriteResult>>('/lmscan/rewrite', {
    content,
    aiScore,
  });
  return response.data;
}

/**
 * 完整的降 AI 味流程（Lmscan 检测 + Stop Slop 改写 + 再检测）
 * @param content 原始文本
 * @returns 完整处理结果
 */
export async function fullDeAiProcess(content: string): Promise<ApiResponse<FullDeAiResult>> {
  const response = await apiClient.post<ApiResponse<FullDeAiResult>>('/lmscan/full-process', { content });
  return response.data;
}

/**
 * 检查 Lmscan 和 Stop Slop 服务状态
 * @returns 服务健康状态
 */
export async function checkServicesHealth(): Promise<ApiResponse<ServicesHealth>> {
  const response = await apiClient.get<ApiResponse<ServicesHealth>>('/lmscan/health');
  return response.data;
}
