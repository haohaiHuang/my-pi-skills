# 设计参考索引

本机设计资源台账。做设计任务时先扫这里，按需调用。

---

## A. 设计系统 / 风格源

### 1. Refero Styles — 真实产品设计系统库

- **是什么**：2000+ 真实产品（Linear、ElevenLabs、Factory、Raycast…）的设计系统，AI 可读（DESIGN.md / Tailwind / CSS Variables / Tokens）
- **怎么用**：浏览器 <https://styles.refero.design/> 搜索；或走 MCP（`refero_search` / `refero_get` / `refero_design_md`，pi 已配置 `https://api.refero.design/mcp`）——深度用法见 `refero-design` skill（styles/screens/flows 三层研究）
- **典型场景**：用户说"用 XX 的风格" → refero 搜该产品 → 拿 DESIGN.md（调色板/字体/间距/准则）→ 照着实现

### 2. Aceternity UI — 落地页组件范式

- **是什么**：200+ React + Tailwind + Motion 组件/区块/模板（背景光斑、卡片动效、hero 布局等），复制粘贴式获取
- **怎么用**：抓 <https://ui.aceternity.com/> 的组件 demo 当设计/动效范式参考；组件是 React 的，不直接装，借范式
- **典型场景**：做落地页/SaaS 页面时参考其区块语言；它基于 Motion，与动画工作流契合

### 3. Minimal Gallery — 极简网页设计灵感库

- **是什么**：2013 年起每日更新的精选网页设计案例库（极简风为主，含模板、字体、工具）
- **怎么用**：浏览 <https://minimal.gallery/> 找灵感案例；页面 curl 可能被拒（HTTP 000），用 web_search 查案例
- **典型场景**：做极简风/高端感设计时找真实案例参考

## B. AI 应用界面范式

### 4. Beautiful UI — AI-native 界面范式

- **是什么**：AI 应用 UI 组件库（Chat、Streaming Text、Thinking、Tool Chips、Approval Card、Records Table 等 20 个）
- **怎么用**：抓 <https://www.beautifului.dev/> 的 demo 页面当设计语言参考（fetch_content 或 curl 解析）；组件是 React/Next 的，不直接装，只借范式
- **典型场景**：做 AI 产品界面（聊天面板、agent 状态、流式输出）时参考其组件语言

## C. 组件素材库

### 5. 21st.dev — shadcn/ui 组件市场

- **是什么**：设计工程师社区发布的 shadcn/ui 组件/模板目录（React + Tailwind），含 shadcn 主题、shaders、渐变；组件以 shadcn registry 格式发布，与 shadcn/ui 原语组合
- **怎么用**：浏览 <https://21st.dev/> 预览组件 → 复制 AI-ready prompt 让 Cursor/Claude Code/v0 等 agent 直接落地，或 `npx shadcn add` 安装；组件是 React 的，不直接装时借范式
- **典型场景**：项目已用 shadcn/ui 时找现成组件/主题；做 React 界面时参考其组件语言

### 6. Uiverse Galaxy — 组件/按钮素材库

- **是什么**：3800+ 免费 UI 元素（按钮为主，MIT）
- **怎么用**：
  - 本地克隆（离线/批量）：`~/resources/galaxy/`（未克隆时远程操作原仓库 github.com/uiverse-io/galaxy）
  - 按标签 grep：`grep -l "gradient|neon" galaxy/Buttons/*.html`
  - 或在线 <https://uiverse.io/>
- **典型场景**：找现成按钮/组件 → 复制样式适配进项目

## D. 动画引擎

### 7. Motion — Web 动画库（首选）

- **是什么**：专业 Web 动画引擎（弹簧物理、滚动、手势），MIT
- **怎么用**：独立 HTML 直接 CDN 引用，零安装：

  ```html
  <script type="module">
    import { animate, spring, inView, scroll } from "https://cdn.jsdelivr.net/npm/motion@latest/+esm"
  </script>
  ```

- **配套**：本机已装 `motion-dev-animations` skill（~/.pi/agent/skills/motion-dev-animations/）——写动画前查它的 best-practices、spring 物理与可访问性指南
- **典型场景**：做 HTML 动效时用 Motion 而不是手写 CSS 动画

### 8. Anime.js — 全能动画引擎（补充）

- **是什么**：通用 JS/SVG 动画引擎 v4（keyframes、easings、stagger、SVG morph、运动路径、Scroll Observer），`npm i animejs` 或 CDN
- **怎么用**：<https://animejs.com/> 文档/示例；CDN: `https://cdn.jsdelivr.net/npm/animejs@4/lib/anime.esm.js`
- **典型场景**：Motion 不擅长的地方——SVG 形状变形（morph）、沿路径运动、复杂 stagger 序列

## F. 图标 / 字体 / 纹理（高频素材，直接引用）

### 10. Lucide — 图标库（首选）

- **是什么**：1000+ 线性图标，MIT，SVG 可直接引用
- **怎么用**：CDN 或复制 SVG：`https://unpkg.com/lucide-static@latest/icons/<name>.svg`；或 <https://lucide.dev/> 预览
- **典型场景**：按钮/导航/空状态/特性列表图标

### 11. Heroicons — 图标库（补充）

- **是什么**：Tailwind 官方图标（outline/solid 两套），MIT
- **怎么用**：<https://heroicons.com/> 复制 SVG；或 `https://cdn.jsdelivr.net/npm/heroicons@latest/24/outline/<name>.svg`
- **典型场景**：需要 outline/solid 两种权重时

### 12. Google Fonts — 字体源

- **是什么**：免费 web 字体（含中文：思源黑体 Noto Sans SC / 思源宋体 Noto Serif SC）
- **怎么用**：<https://fonts.google.com/> 挑字体 → 复制 <link> 或 @import 到 HTML
- **典型场景**：中英文排版字体；中文优先 Noto/思源系（免费可商用）

### 13. Hero Patterns — SVG 背景纹理

- **是什么**：免费 SVG 平铺纹理（dots/grid/waves 等），CC0
- **怎么用**：<https://heropatterns.com/> 选图案 → 复制 CSS background（内联 SVG data URI）
- **典型场景**：hero 区/卡片背景的低调纹理

### 14. CSS 渐变工具

- **是什么**：渐变背景生成器（mesh gradient 等）
- **怎么用**：<https://cssgradient.io/> 生成 CSS；或手写 `background: radial-gradient(...)` 叠加做 mesh 效果
- **典型场景**：hero 背景、卡片强调色

## G. 本机协同技能（设计任务组合）

| 技能 | 定位 | 何时用 |
| --- | --- | --- |
| `refero-design` | research-first 设计方法论（MCP 已配置） | 任何设计任务的首选研究入口 |
| `motion-dev-animations` | Motion.dev 动画（spring/120fps） | 网页/PPT 动效 |
| `kami` | 专业排版（文档/PPT/落地页 HTML） | 排版输出 |
| `guizang-ppt-skill` | 横向翻页网页 PPT | PPT 演示 |
| `hyperframes` | HTML 渲染视频/动画 | 视频/动画合成 |
| `gpt-image-2` | 图像生成/编辑 | 配图、插画、视觉探索 |

## E. 工具发现（非设计资源）

### 9. VibeIndex — AI 编程工具导航

- **是什么**：285 个 AI 编程工具目录（16 类：AI IDE、构建器、代码审查、测试等）
- **怎么用**：<https://vibeindex.dev/> 浏览发现工具（注意：这是工具目录，不是设计参考）
- **典型场景**：找新工具/对比工具时查，做设计时不用

---

## 使用流程（做设计任务时）

1. 判断任务类型 → 对应查 A–G 分组
2. 深度设计任务优先走 `refero-design` skill（research-first：styles/screens/flows，MCP 已配置）；轻量任务直接查素材库
3. 优先真实资源（refero 设计系统 / aceternity+beautifului 范式 / 21st.dev+galaxy 组件 / motion+animejs 动效 / minimal 灵感 / lucide+fonts+patterns 高频素材）
4. 落地时按需组合协同技能（G 组：kami / guizang / hyperframes / gpt-image-2 / motion-dev-animations）
5. 没有匹配资源 → 正常发挥，不要硬凑
