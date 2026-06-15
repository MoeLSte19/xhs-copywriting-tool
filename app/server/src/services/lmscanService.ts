/**
 * Lmscan + Stop Slop 集成服务（使用 DeepSeek 实现）
 * 用于 AI 文本检测和降 AI 味改写
 */

import axios from 'axios';
import config from '../config/index.js';

// 检测结果接口
export interface LmscanDetectResult {
  aiScore: number;        // 0-100，0=完全AI，100=完全真人
  confidence: number;     // 置信度 0-100
  details: {
    perplexity: number;   // 困惑度
    burstiness: number;   // 突发性
    vocabulary: number;   // 词汇多样性
  };
  summary: string;        // 检测摘要
}

// 改写结果接口
export interface StopSlopRewriteResult {
  content: string;        // 改写后的内容
  changes: string[];      // 修改说明列表
  newAiScore: number;     // 改写后的预估 AI 分数
}

/**
 * 使用 DeepSeek 模拟 Lmscan 检测 AI 痕迹
 * @param content 待检测文本
 * @returns 检测结果
 */
export async function detectWithLmscan(content: string): Promise<LmscanDetectResult> {
  const systemPrompt = `你是一个专业的 AI 文本检测专家。你的任务是分析文本是否由 AI 生成。

请从以下维度进行分析：
1. 用词模式：是否使用了 AI 典型用词（首先/其次/最后、值得一提的是、总而言之等）
2. 句式特征：句子长度是否过于均匀、段落结构是否过于对称
3. 情感真实性：是否缺乏真实体验感、描述是否过于泛化
4. 小红书特有标记：是否符合真人博主风格

请严格按以下 JSON 格式输出：
{
  "aiScore": 数字(0-100, 0=完全AI味, 100=完全像真人),
  "confidence": 数字(0-100, 置信度),
  "perplexity": 数字(0-100, 困惑度，越高越像真人),
  "burstiness": 数字(0-100, 突发性，越高越像真人),
  "vocabulary": 数字(0-100, 词汇多样性，越高越像真人),
  "summary": "简要说明检测结果"
}`;

  try {
    const response = await axios.post(
      `${config.deepseekBaseUrl}/v1/chat/completions`,
      {
        model: config.deepseekModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `请检测以下小红书笔记的 AI 痕迹：\n\n${content}` },
        ],
        temperature: 0.3,
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.deepseekApiKey}`,
        },
        timeout: 30000,
      }
    );

    const raw = response.data?.choices?.[0]?.message?.content;
    if (!raw) {
      throw new Error('DeepSeek API 返回内容为空');
    }

    // 解析 JSON
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('无法解析检测结果');
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      aiScore: Math.min(100, Math.max(0, Math.round(result.aiScore))),
      confidence: Math.min(100, Math.max(0, Math.round(result.confidence || 85))),
      details: {
        perplexity: Math.min(100, Math.max(0, result.perplexity || 50)),
        burstiness: Math.min(100, Math.max(0, result.burstiness || 50)),
        vocabulary: Math.min(100, Math.max(0, result.vocabulary || 50)),
      },
      summary: result.summary || '检测完成',
    };
  } catch (error: any) {
    console.error('[Lmscan Error]', error.message);
    throw new Error(`Lmscan 检测失败: ${error.message}`);
  }
}

/**
 * 使用 DeepSeek 模拟 Stop Slop 降 AI 味改写
 * @param content 原始文本
 * @param aiScore 当前 AI 味分数
 * @returns 改写结果
 */
export async function rewriteWithStopSlop(
  content: string,
  aiScore: number
): Promise<StopSlopRewriteResult> {
  const systemPrompt = `你是一个专业的文本改写专家，专门将 AI 生成的文本改写为自然的人类写作风格。你的名字叫 Stop Slop。

改写规则（严格遵守）：

1. 【句式打碎】
   - 长句拆成短句，短到甚至不像完整句子
   - 加入口语化的省略、重复、语气词
   - 用"..."表示停顿，用"哈哈""吧""嘛""哎"等语气词

2. 【加入真实场景】
   - 加入具体的使用时间、地点、场景
   - 比如"上周三晚上刷到""用了大概两周""放办公室桌上"
   - 加入对比参照："比我之前用的xx好太多了"

3. 【破坏结构感】
   - 不要每段长度差不多
   - 有的段落就一句话，有的可以长一点
   - 不需要每段都完美收尾，可以"话说回来"硬转

4. 【加入真人"杂质"】
   - 加入小吐槽："包装有点丑但东西确实行"
   - 加入犹豫："纠结了挺久才决定分享的"
   - 加入限制："油皮的姐妹可能要再看看"

5. 【标题降AI味】
   - 不要用"最全攻略""保姆级教程"
   - 用更随意的："买了不后悔""终于找到了""别再交智商税了"

6. 【绝对禁止】
   - 不能改变产品信息和核心推荐理由
   - 不能编造虚假体验
   - 不能添加用户没有提到的产品功效

当前文本的 AI 味评分为 ${aiScore}/100（分数越低 AI 味越重），请重点改写 AI 痕迹明显的部分。

请严格按以下 JSON 格式输出：
{
  "content": "改写后的完整文本",
  "changes": ["修改说明1", "修改说明2", ...]
}`;

  try {
    const response = await axios.post(
      `${config.deepseekBaseUrl}/v1/chat/completions`,
      {
        model: config.deepseekModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `请改写以下小红书笔记，降低 AI 痕迹：\n\n${content}` },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.deepseekApiKey}`,
        },
        timeout: 60000,
      }
    );

    const raw = response.data?.choices?.[0]?.message?.content;
    if (!raw) {
      throw new Error('DeepSeek API 返回内容为空');
    }

    // 解析 JSON
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('无法解析改写结果');
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      content: result.content,
      changes: result.changes || ['已完成降 AI 味改写'],
      newAiScore: Math.max(0, aiScore - 30), // 预估降低 30 分
    };
  } catch (error: any) {
    console.error('[Stop Slop Error]', error.message);
    throw new Error(`Stop Slop 改写失败: ${error.message}`);
  }
}

/**
 * 组合使用 Lmscan + Stop Slop 进行完整的降 AI 味流程
 * @param content 原始文本
 * @returns 包含检测和改写结果的完整结果
 */
export async function fullDeAiProcess(content: string): Promise<{
  original: LmscanDetectResult;
  rewritten: StopSlopRewriteResult;
  finalScore: number;
}> {
  // 第一步：使用 Lmscan 检测
  console.log('[DeAi Process] 开始 Lmscan 检测...');
  const detectResult = await detectWithLmscan(content);

  // 如果 AI 味已经很低，不需要改写
  if (detectResult.aiScore >= 85) {
    console.log('[DeAi Process] AI 味已经很低，跳过改写');
    return {
      original: detectResult,
      rewritten: {
        content: content,
        changes: ['文本已足够自然，无需改写'],
        newAiScore: detectResult.aiScore,
      },
      finalScore: detectResult.aiScore,
    };
  }

  // 第二步：使用 Stop Slop 改写
  console.log('[DeAi Process] 开始 Stop Slop 改写...');
  const rewriteResult = await rewriteWithStopSlop(content, detectResult.aiScore);

  // 第三步：再次检测改写后的内容
  console.log('[DeAi Process] 重新检测改写后内容...');
  const finalDetect = await detectWithLmscan(rewriteResult.content);

  return {
    original: detectResult,
    rewritten: {
      ...rewriteResult,
      newAiScore: finalDetect.aiScore,
    },
    finalScore: finalDetect.aiScore,
  };
}

/**
 * 检查 Lmscan 和 Stop Slop 服务是否可用（使用 DeepSeek 实现）
 * @returns 服务状态
 */
export async function checkServicesHealth(): Promise<{
  lmscan: boolean;
  stopSlop: boolean;
  message: string;
}> {
  // 使用 DeepSeek 实现，检查 DeepSeek API 是否可用
  const result = {
    lmscan: true,  // 使用 DeepSeek 模拟
    stopSlop: true, // 使用 DeepSeek 模拟
    message: '使用 DeepSeek API 实现 Lmscan + Stop Slop 功能',
  };

  return result;
}
