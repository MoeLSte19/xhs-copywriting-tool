# 笔记侠 - 小红书爆款文案生成器

> 输入一句话，3秒生成过检爆款笔记

## 项目简介

笔记侠是一款专为小红书创作者打造的AI文案生成工具。它能够：

- 一键生成小红书爆款笔记
- 提供5个不同风格的标题供选择
- 自动添加emoji和话题标签
- AI味检测评分（0-100分）
- 一键降AI味改写
- 移动端优先的响应式设计

## 技术栈

**前端：**
- Vue 3 + Vite
- TypeScript
- Tailwind CSS
- Pinia 状态管理

**后端：**
- Node.js + Express
- DeepSeek V4 Flash API
- Prompt 工程优化

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/xhs-copywriting-tool.git
cd xhs-copywriting-tool
```

### 2. 安装依赖

```bash
# 前端
cd app/client
npm install

# 后端
cd ../server
npm install
```

### 3. 配置环境变量

```bash
cd app/server
cp .env.example .env
```

编辑 `.env` 文件，填入你的 DeepSeek API Key：

```env
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
PORT=3000
```

### 4. 启动开发服务器

```bash
# 后端（在 app/server 目录）
npm run dev

# 前端（在 app/client 目录）
npm run dev
```

访问 http://localhost:5173 即可使用。

## 核心功能

### 1. 一键生成爆款文案
输入产品或想法描述，AI自动生成完整的小红书笔记，包含：
- 5个不同风格的爆款标题
- 3-5个短段落的正文
- 自动添加emoji
- 3-5个话题标签

### 2. AI味检测
自动检测文案的AI痕迹，给出0-100分评分：
- 80分以上：文案自然，可以直接使用
- 80分以下：建议降AI味改写

### 3. 一键降AI味
将AI生成的文案改写为更自然的真人风格：
- 句式打碎，加入口语化表达
- 加入具体场景和真实体验
- 破坏结构感，增加"杂质"

### 4. 免费次数限制
- 未登录用户每天3次免费生成
- 防滥用机制（IP级限流）

## 项目结构

```
xhs-copywriting-tool/
├── app/
│   ├── client/          # 前端 Vue 3 项目
│   │   ├── src/
│   │   │   ├── components/    # Vue 组件
│   │   │   ├── views/         # 页面视图
│   │   │   ├── stores/        # Pinia 状态管理
│   │   │   ├── composables/   # 组合式函数
│   │   │   ├── services/      # API 调用
│   │   │   └── types/         # TypeScript 类型
│   │   └── ...
│   └── server/          # 后端 Express 项目
│       ├── src/
│       │   ├── controllers/   # 控制器
│       │   ├── services/      # 业务逻辑
│       │   ├── middleware/     # 中间件
│       │   └── routes/        # 路由定义
│       └── prompts/           # Prompt 模板
├── docs/                # 项目文档
└── prompt-test/         # Prompt 测试
```

## 部署

### 前端部署（Vercel）

1. 将 `app/client` 目录推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量 `VITE_API_BASE_URL` 为你的后端地址

### 后端部署（Railway/Render）

1. 将 `app/server` 目录推送到 GitHub
2. 在 Railway 或 Render 中导入项目
3. 配置环境变量：
   - `DEEPSEEK_API_KEY`
   - `DEEPSEEK_BASE_URL`
   - `DEEPSEEK_MODEL`
   - `PORT`

## 成本估算

| 项目 | 成本 |
|------|------|
| DeepSeek API | ¥0.002/次 |
| 1000次生成 | ¥2 |
| 域名 | ¥50/年 |
| 部署 | 免费（Vercel + Railway） |

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

---

**笔记侠** - 让每个人都能写出小红书爆款笔记 ✨
