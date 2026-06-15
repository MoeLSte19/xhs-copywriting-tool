# 前端 AI 味去除 & 苹果液态玻璃风格改造技术文档

> 版本：v1.0 | 日期：2026-06-15 | 状态：进行中

---

## 一、改造目标

将「笔记侠」前端从**典型 AI 审美（粉色底、大 emoji、彩色阴影、卡片叠卡片）**转变为**苹果液态玻璃风格的专业工具（白色面板、蓝色按钮、干净克制）**。

### 设计方向决策

| 维度 | 旧 | 新 |
|------|----|----|
| 品牌调性 | 网红感 | **专业工具感**（参考 Notion / Linear） |
| 色彩系统 | 粉色底 #FFF0F5 + 红色主色 #FF2442 | **白色面板 + 苹果蓝 #007AFF** |
| 视觉风格 | emoji 密集、卡片嵌套、彩色阴影 | **液态玻璃（微透质感）、克制留白** |
| Lmscan 面板 | 面向用户的主界面模块 | **开发调试面板，默认折叠** |

### 需修改文件清单

```
app/client/
├── tailwind.config.js          ◄ 色彩系统重定义
├── src/styles/main.css          ◄ 全局背景 + 移除渐变按钮
├── src/views/HomeView.vue       ◄ 页面结构 + 空状态
├── src/components/
│   ├── InputSection.vue         ◄ 输入区去 emoji + 按钮重写
│   ├── CategorySelector.vue     ◄ 横滚 → 网格布局
│   ├── OutputSection.vue        ◄ 输出区去 emoji + 文案
│   ├── TitleSelector.vue        ◄ 标题选择去 emoji
│   ├── AiScoreBar.vue           ◄ 分数条文案重构
│   ├── CopyButton.vue           ◄ 复制按钮去 emoji
│   └── LmscanPanel.vue          ◄ 折叠为开发面板
```

---

## 二、逐文件修改规格

### 2.1 `tailwind.config.js` — 色彩系统

**当前**：

```js
colors: {
  primary: '#FF2442',
  'primary-light': '#FF6B81',
  'primary-dark': '#D91A37',
  accent: '#FFF0F5',
  'accent-dark': '#FFE0EB',
}
```

**改为**：

```js
colors: {
  primary: '#007AFF',          // Apple 系统蓝
  'primary-hover': '#3395FF',  // hover 微亮
  'primary-dark': '#0056CC',   // active 微深
  surface: '#F5F5F7',           // 苹果暖灰白（页面底）
  'surface-dark': '#EBEBED',    // 稍深灰（hover 等场景）
}
```

**设计意图**：
- `#007AFF` 是 Apple 系统原生蓝色，天然与苹果生态一致
- `#F5F5F7` 是 Apple.com 经典背景色，比纯白 #fff 更有质感
- 去掉 `accent`、`accent-dark` 两个粉色 token，全部引用从代码中移除

---

### 2.2 `main.css` — 全局样式

**改动点**：

| 行号 | 旧 | 新 | 说明 |
|------|----|----|------|
| 24 | `background-color: #FFF0F5` | `background-color: #F5F5F7` | 粉色底 → 暖灰白 |
| 52-62 | `.btn-primary-gradient` 整段 | **删除** | 渐变按钮不再使用 |

---

### 2.3 `HomeView.vue` — 页面结构

| 行 | 旧 | 新 | 说明 |
|----|----|----|------|
| 2 | `bg-accent` | `bg-surface` | 页面底色 |
| 4 | `bg-white/90 backdrop-blur-sm shadow-sm` | `bg-white border-b border-gray-100` | 去掉毛玻璃，纯白 header + 极细分割线 |
| 7 | `<span>📝</span>` | **删除** | 去掉 emoji |
| 9 | `小红书爆款文案生成器` | `AI 写作助手` | 更克制 |
| 12 | `今日剩余 X 次` | **移至 InputSection 按钮下方** | header 减少信息 |
| 42 | `✨ 输入主题，一键生成...` | 改为两行排版（见下方代码） | 空状态升级 |
| 51 | `⚠️ 建议加入个人真实体验...` | `AI 生成内容仅供参考，建议加入个人体验后发布` | 去 emoji，文案中性化 |
| 26 | `LmscanPanel` | 添加 `v-if="showAdvanced"` 控制 | 默认折叠 |

**新增空状态代码**：

```html
<div class="text-center py-16">
  <p class="text-xl font-semibold text-gray-700 mb-2">写好你的出发点</p>
  <p class="text-sm text-gray-400">AI 帮你把想法变成小红书的语言</p>
</div>
```

**新增高级面板展开入口**（在 footer 上方）：

```html
<div class="max-w-[768px] mx-auto px-4 py-2">
  <button
    class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
    @click="showAdvanced = !showAdvanced"
  >
    {{ showAdvanced ? '收起' : '高级工具' }}
  </button>
</div>
```

**script 新增**：
```ts
const showAdvanced = ref(false);
```

---

### 2.4 `InputSection.vue` — 输入区

| 行 | 旧 | 新 | 说明 |
|----|----|----|------|
| 8 | `📝 笔记主题` | `主题` | 去 emoji |
| 14 | 三行 placeholder | `你打算写什么？比如：大理三天两夜攻略` | 精简为一行 |
| 7 | `bg-white rounded-2xl p-4 shadow-sm` | `bg-white/60 ring-1 ring-gray-200/60 rounded-xl p-4` | 液态玻璃质感（微透+细环） |
| 27 | `shadow-lg shadow-primary/30` | **删除彩色阴影** | AI 味重灾区 |
| 41 | `✨ 一键生成爆款文案` | `生成文案` | 极简动词 |
| 42-44 | （新增） | 按钮下方 `<p>今日剩余 N 次</p>` | 剩余次数从 header 下移 |

**按钮新样式**：
```html
<button
  class="w-full py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-200"
  :class="{
    'bg-primary hover:bg-primary-hover active:scale-[0.98] active:bg-primary-dark': canGenerate,
    'bg-gray-200 text-gray-400 cursor-not-allowed': !canGenerate,
  }"
>
```

**新增计算属性**：
```ts
const canGenerate = computed(() => !store.isGenerating && !usageStore.isLimitReached);
```

---

### 2.5 `CategorySelector.vue` — 分类选择器

| 行 | 旧 | 新 | 说明 |
|----|----|----|------|
| 3 | `📷 选择分类` | `分类` | 去 emoji |
| 4 | `flex gap-3 overflow-x-auto` | `grid grid-cols-3 gap-2` | 横滚 → 2 行网格 |
| 10 | `border-primary bg-accent text-primary` | `border-primary bg-blue-50 text-primary` | 粉色选中态 → 蓝色 |
| 11 | `border-gray-200 bg-white text-gray-500` | `border-gray-200 bg-white/60 text-gray-500` | 未选中微透 |
| 15-16 | `text-2xl` emoji + `text-xs` 文字 | 小 SVG 图标 + 文字（保留 emoji 但缩小，后续可换图标） | 降低视觉权重 |
| 2 | `bg-white rounded-2xl p-4 shadow-sm` | `bg-white/60 ring-1 ring-gray-200/60 rounded-xl p-3` | 液态玻璃 |

---

### 2.6 `OutputSection.vue` — 输出区

| 行 | 旧 | 新 | 说明 |
|----|----|----|------|
| 12 | `📋 文案内容` | `内容` | 去 emoji |
| 10 | `bg-white rounded-2xl p-5 shadow-sm` | `bg-white/60 ring-1 ring-gray-200/60 rounded-xl p-5` | 液态玻璃 |
| 25 | `bg-accent text-primary hover:bg-accent-dark border-2 border-primary/20` | `border border-gray-200 text-gray-700 hover:bg-gray-50` | 降 AI 按钮降级为次要按钮 |
| 38 | `🔄 一键降AI味改写` | `改写得自然些` | 口语化 |
| 44 | 绿色卡片 `bg-green-50 border-green-200` | `text-sm text-gray-500 text-center py-4` | 去绿色庆祝卡片 |
| 46 | `AI味评分已达 N 分，文案很自然！` | `这版读起来已经挺自然了` | 中性友好 |

---

### 2.7 `LmscanPanel.vue` — 开发面板折叠

**彻底重写模板结构**：

```html
<template>
  <div v-if="modelValue" class="bg-white/60 ring-1 ring-gray-200/60 rounded-xl">
    <div class="p-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="text-sm font-medium text-gray-600">服务检测</h3>
      <button class="text-xs text-gray-400 hover:text-gray-600" @click="$emit('update:modelValue', false)">
        关闭
      </button>
    </div>
    <!-- 原有内容精简后放在这里 -->
  </div>
</template>
```

改为 props + emit 控制显隐，由 HomeView 传入。

原有面板内部的 emoji 全部去除：
- `🔬 Lmscan + Stop Slop` → `服务检测`
- `🔍 使用 Lmscan 检测 AI 味` → `检测 AI 痕迹`
- `🚀 一键降 AI 味` → `完整处理`
- `📊 Lmscan 检测结果` → `检测结果`
- `📈 检测结果` → `原始结果`
- `✏️ 改写结果` → `改写结果`
- `🎉` → 删除

---

### 2.8 `TitleSelector.vue` — 标题列表

| 行 | 旧 | 新 | 说明 |
|----|----|----|------|
| 3 | `📌 选择标题（5选1）` | `选一个标题` | 去 emoji + 去冗余括号 |
| 10 | `border-primary bg-accent text-primary` | `border-primary bg-blue-50 text-primary` | 蓝色选中态 |
| 2 | `bg-white rounded-2xl p-4 shadow-sm` | `bg-white/60 ring-1 ring-gray-200/60 rounded-xl p-4` | 液态玻璃 |

---

### 2.9 `AiScoreBar.vue` — 评分条

| 行 | 旧 | 新 | 说明 |
|----|----|----|------|
| 4 | `🤖 AI味评分` | `自然度` | 正面表达 |
| 40-44 | 5 段 emoji 提示 | 3 段纯文字 | 简化 |
| 2 | `bg-white rounded-2xl p-4 shadow-sm` | `bg-white/60 ring-1 ring-gray-200/60 rounded-xl p-4` | 液态玻璃 |

**新提示文案**：
```ts
if (score >= 80) return '自然，可直接用'
if (score >= 50) return '有点 AI 味，建议改改'
return 'AI 痕迹明显，需要重写'
```

---

### 2.10 `CopyButton.vue` — 复制按钮

| 行 | 旧 | 新 | 说明 |
|----|----|----|------|
| 12 | `✅ 已复制` | `已复制` | 去 emoji |
| 14 | `📋 复制文案` | `复制` | 简化 |

---

## 三、设计系统速查（实施后）

| Token | 值 | 用途 |
|-------|-----|------|
| `primary` | `#007AFF` | 主按钮、选中态、链接 |
| `primary-hover` | `#3395FF` | 按钮 hover |
| `primary-dark` | `#0056CC` | 按钮 active |
| `surface` | `#F5F5F7` | 页面背景 |
| `surface-dark` | `#EBEBED` | hover 背景 |
| 面板底色 | `bg-white/60` | 液态玻璃半透白 |
| 面板边框 | `ring-1 ring-gray-200/60` | 细环替代 border |

---

## 四、验证清单

- [ ] 页面不再出现粉色（`#FF2442`、`#FFF0F5`、`#FFE0EB`）
- [ ] 所有 emoji 标签已替换为纯文字
- [ ] 没有彩色阴影（`shadow-{color}/30`）
- [ ] LmscanPanel 默认不可见
- [ ] 分类选择器是网格布局，不用滚动
- [ ] 主按钮是纯蓝色，无渐变
- [ ] 面板使用 `bg-white/60 ring-1 ring-gray-200/60` 液态玻璃
- [ ] 文案克制，无过度庆祝（绿色卡片、🎉）
