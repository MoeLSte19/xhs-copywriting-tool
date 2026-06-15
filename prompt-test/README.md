# 笔记侠 Prompt 效果验证测试

## 快速开始

### 1. 获取 DeepSeek API Key

1. 打开 https://platform.deepseek.com/
2. 注册/登录
3. 进入「API Keys」页面，创建一个新 Key
4. 复制 Key（格式：sk-xxxxxxxx）

> 💡 新注册用户有免费额度，测试完全够用。如果不够，充值 10 元即可。

### 2. 运行测试

```bash
cd D:\vibe coding\xhs-copywriting-tool\prompt-test

# Windows PowerShell
$env:DEEPSEEK_API_KEY="sk-你的key"; node test-prompt.js

# Windows CMD
set DEEPSEEK_API_KEY=sk-你的key && node test-prompt.js
```

### 3. 看什么

测试会跑 3 个场景（美妆/美食/好物种草），每个场景走 4 步：

1. **生成笔记** → 看输出是否像小红书风格
2. **AI味检测** → 看评分（0-100，低于80有问题）
3. **降AI味改写** → 看改写后是否更像真人
4. **二次检测** → 看评分是否提升

**判断标准：**
- 降AI味后评分提升 **20+ 分** → ✅ Prompt 有效，可以开发
- 降AI味后评分提升 **10-20 分** → ⚠️ 需要优化 Prompt
- 降AI味后评分提升 **< 10 分** → ❌ Prompt 需要重写

## 如果不想跑脚本

直接复制 `prompts.md` 中的三套 Prompt，粘贴到 DeepSeek 网页版手动测试：
https://chat.deepseek.com/

## 文件说明

| 文件 | 说明 |
|------|------|
| test-prompt.js | 自动化测试脚本（3个场景 × 4步流程） |
| prompts.md | 三套核心 Prompt 文本（可手动测试） |
