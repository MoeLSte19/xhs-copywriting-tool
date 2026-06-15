// 笔记侠 - Prompt 效果验证测试
// 用法：DEEPSEEK_API_KEY=你的key node test-prompt.js

import https from 'https';

const API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL = 'https://api.deepseek.com/chat/completions';

if (!API_KEY) {
  console.error('❌ 请设置 DEEPSEEK_API_KEY 环境变量');
  console.error('   例：DEEPSEEK_API_KEY=sk-xxx node test-prompt.js');
  process.exit(1);
}

// ============================================
// 三套核心 Prompt
// ============================================

// 【Prompt 1：生成小红书爆款笔记】
const GENERATE_PROMPT = `你是一个小红书爆款文案专家，擅长写出高互动率的小红书笔记。

你必须遵循以下规则：

1. 【风格】使用小红书真实博主的语气，避免AI味：
   - 口语化、像在跟闺蜜聊天
   - 适当使用"真的绝了""姐妹们""冲""按头安利"等高频词
   - 但不要过度堆砌，保持自然

2. 【结构】每篇笔记必须包含：
   - 标题：8-15字，带数字/感叹号/悬念
   - 正文：3-5个短段落，每段2-3句
   - emoji：每个段落1-2个，放在句末
   - 话题标签：3-5个，放在文末

3. 【禁忌】
   - 不使用"作为一名AI"等元描述
   - 不使用过于书面/官方的措辞
   - 不超过500字（小红书最佳阅读长度）
   - 不编造具体数据/价格（除非用户提供了）

4. 【输出格式】
   直接输出可复制的纯文本，不需要markdown格式标记。`;

// 【Prompt 2：AI味检测评分】
const DETECT_PROMPT = `你是一个小红书平台的内容审核AI检测系统，专门识别AI生成的笔记内容。

请从以下维度对用户提交的笔记进行AI痕迹检测评分：

1. 【用词模式】是否使用了AI典型用词：
   - "首先/其次/最后"、"值得一提的是"、"总而言之"
   - "不仅...而且..."、"一方面...另一方面"
   - 过于整齐的排比句式
   - 每段开头的模式化（"说到""关于"）

2. 【句式特征】是否具有AI写作特征：
   - 句子长度过于均匀
   - 段落结构过于对称
   - 缺乏口语化的断句、省略、重复
   - 没有网络用语或缩写

3. 【情感真实性】是否缺乏真实体验感：
   - 描述过于泛化，缺乏具体场景和细节
   - 感情表达模式化
   - 没有个人化的吐槽或意外感
   - 过度使用感叹号和正面情绪

4. 【小红书特有标记】是否符合真人博主风格：
   - 真人会有"废话"和跑题
   - 真人会有不完美的表达
   - 真人会有具体的使用场景和时间线
   - 真人不会每段都完美收尾

请给出：
- AI味评分：0-100分（0=完全AI味，100=完全像真人）
- 如果低于80分，列出具体问题点
- 给出修改建议

输出格式：
AI味评分：XX/100
问题点：
1. xxx
2. xxx
修改建议：
- xxx`;

// 【Prompt 3：降AI味改写】
const REDUCE_AI_PROMPT = `你是一个小红书爆款文案的"去AI味"专家。你的任务是将一篇AI生成的小红书笔记改写为完全像真人博主写的风格。

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

直接输出改写后的完整笔记文本，不要输出任何解释。`;

// ============================================
// 测试用例
// ============================================

const TEST_CASES = [
  { category: '美妆', input: '一款超好用的补水面膜，敷完皮肤水润一整天' },
  { category: '美食', input: '发现一家隐藏的泰式小店，冬阴功超正宗' },
  { category: '好物种草', input: '一个便携式榨汁杯，办公室做果汁超方便' },
];

// ============================================
// API 调用函数
// ============================================

function callDeepSeek(systemPrompt, userMessage) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const options = {
      hostname: 'api.deepseek.com',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.choices && json.choices[0]) {
            resolve(json.choices[0].message.content);
          } else if (json.error) {
            reject(new Error(`API错误: ${json.error.message}`));
          } else {
            reject(new Error(`未知响应: ${body}`));
          }
        } catch (e) {
          reject(new Error(`解析失败: ${body.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ============================================
// 测试流程
// ============================================

async function runTest() {
  console.log('🧪 笔记侠 Prompt 效果验证测试');
  console.log('='.repeat(50));
  console.log();

  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i];
    console.log(`📝 测试用例 ${i + 1}：[${tc.category}] ${tc.input}`);
    console.log('-'.repeat(50));

    // Step 1: 生成笔记
    console.log('  ⏳ Step 1: 生成笔记...');
    let generated;
    try {
      generated = await callDeepSeek(GENERATE_PROMPT, `请写一篇小红书笔记，主题是：${tc.input}。分类：${tc.category}`);
      console.log('  ✅ 生成完成');
      console.log('  --- 生成内容 ---');
      console.log('  ' + generated.split('\n').join('\n  '));
      console.log('  ---');
    } catch (e) {
      console.error(`  ❌ 生成失败: ${e.message}`);
      continue;
    }

    // Step 2: AI味检测
    console.log('  ⏳ Step 2: AI味检测...');
    let detection;
    try {
      detection = await callDeepSeek(DETECT_PROMPT, `请检测以下小红书笔记的AI痕迹：\n\n${generated}`);
      console.log('  ✅ 检测完成');
      console.log('  --- 检测结果 ---');
      console.log('  ' + detection.split('\n').join('\n  '));
      console.log('  ---');
    } catch (e) {
      console.error(`  ❌ 检测失败: ${e.message}`);
      continue;
    }

    // Step 3: 降AI味改写
    console.log('  ⏳ Step 3: 降AI味改写...');
    let reduced;
    try {
      reduced = await callDeepSeek(REDUCE_AI_PROMPT, `请将以下小红书笔记改写为真人风格，消除AI痕迹：\n\n${generated}`);
      console.log('  ✅ 改写完成');
      console.log('  --- 降AI味后 ---');
      console.log('  ' + reduced.split('\n').join('\n  '));
      console.log('  ---');
    } catch (e) {
      console.error(`  ❌ 改写失败: ${e.message}`);
      continue;
    }

    // Step 4: 降AI味后再次检测
    console.log('  ⏳ Step 4: 降AI味后再次检测...');
    let reDetection;
    try {
      reDetection = await callDeepSeek(DETECT_PROMPT, `请检测以下小红书笔记的AI痕迹：\n\n${reduced}`);
      console.log('  ✅ 二次检测完成');
      console.log('  --- 二次检测结果 ---');
      console.log('  ' + reDetection.split('\n').join('\n  '));
      console.log('  ---');
    } catch (e) {
      console.error(`  ❌ 二次检测失败: ${e.message}`);
    }

    console.log();
  }

  console.log('='.repeat(50));
  console.log('🏁 测试完成！请对比"检测结果"和"二次检测结果"中的AI味评分变化。');
  console.log('   如果降AI味后评分提升 20+ 分，说明 Prompt 有效，可以开始开发。');
}

runTest().catch(console.error);
