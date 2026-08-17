---
name: design-references
description: 设计参考索引。做 UI、界面、视觉、风格、动效相关的任务时使用——先查 ~/resources/design-references.md 的设计资源台账（真实产品设计系统、AI 界面范式、组件库、动画库、图标字体纹理），再决定怎么做；深度设计任务配合 refero-design（research-first 方法论，MCP 已配置）与 motion-dev-animations（动画）等协同技能。核心原则：能引用真实资源，就不凭空发挥。触发词：设计参考、风格库、参考网站、design reference、参考 beautifului/refero/uiverse、用 XX 的风格、做落地页、做 AI 面板、加动画。
---

# Design References

动手做任何视觉/界面/风格/动效相关任务前，先读 `~/resources/design-references.md`，确认是否有可用的设计资源，再决定怎么做。

核心原则：**能引用真实资源，就不凭空发挥。** 不依赖模型的"通用设计直觉"。

## 何时触发（任务类型）

用户请求属于以下任一类，先查参考再动手：

- **落地页 / SaaS 官网 / 产品页**（hero、区块语言、营销叙事）
- **AI 产品界面**（聊天面板、agent 状态、流式输出、工具调用 chips）
- **风格化**（"用 XX 的风格"、"像 Linear/Raycast 那样"）
- **组件**（按钮、卡片、表单、导航、图标）
- **动效**（进入动画、滚动揭示、微交互、页面过渡）
- **排版 / 配色 / 间距**（设计 token 方向）
- **PPT / 演示 / 文档排版**（视觉输出类）

不属于：纯后端逻辑、纯文本内容写作（除非要排版视觉化）。

## 使用流程

1. **判断任务类型** → 对应查素材库 A–E 分组（设计系统 / AI 范式 / 组件 / 动效 / 工具）
2. **选资源**：
   - 有 refero → 优先走 `refero-design` skill（MCP 已配置：styles 视觉方向 / screens 界面模式 / flows 流程）——设计任务首选
   - 无 refero 或只需范式 → 素材库里的 aceternity / beautifului / 21st.dev / galaxy / minimal
3. **落地方式**（按资源类型）：
   - 设计系统（refero DESIGN.md）→ 拿 token（调色板/字体/间距）照实现
   - 组件库 → 借范式（React 组件不直接装，抄结构/样式语言）
   - 动效 → `motion-dev-animations` skill（spring 物理/best-practices）或素材库 CDN 片段
   - 图标/字体/纹理 → 素材库直接引 CDN/SVG
4. **协同技能**（本机已装，按需组合）：
   - `refero-design` — 深度设计研究方法论（styles/screens/flows，非协商条款）
   - `motion-dev-animations` — Motion.dev 动画（spring 物理、120fps、可访问性）
   - `kami` — 专业排版（文档/PPT/落地页 HTML）
   - `guizang-ppt-skill` — 横向翻页网页 PPT
   - `hyperframes` — 视频/动画合成（HTML 渲染视频）
   - `gpt-image-2` — 图像生成/编辑（配图、插画、视觉探索）
5. **没有匹配资源 → 正常发挥，不要硬凑**（素材库"工具发现"分组是找新工具用，不是设计参考）

## 场景速查

| 任务 | 查什么 | 用什么落地 |
|---|---|---|
| "用 XX 的风格做落地页" | refero styles（DESIGN.md token） | kami / 直接 HTML |
| AI 产品面板/聊天界面 | beautifului（AI-native 范式） | 借组件语言重写 |
| 按钮/卡片/表单组件 | galaxy（3800+ 元素）/ 21st.dev | 复制样式适配 |
| 网页/PPT 动效 | motion-dev-animations / Motion CDN | 独立 HTML + CDN |
| 图标 | Lucide / Heroicons（素材库 C 组） | 引 SVG |
| 字体 | Google Fonts（素材库） | 引 CDN |
| 背景纹理/渐变 | Hero Patterns / 渐变工具（素材库） | 引 CSS/SVG |

## 数据源

- 素材台账：`~/resources/design-references.md`（本机共享，所有平台同一 HOME 可见）
- 深度方法论：`refero-design` skill（MCP：`https://api.refero.design/mcp`，pi 已配置）
