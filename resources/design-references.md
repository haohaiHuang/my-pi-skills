# 设计参考索引

本机设计资源台账。做设计任务时先扫这里，按需调用。

---

## A. 设计系统 / 风格源

### 1. Refero Styles — 真实产品设计系统库

- **是什么**：2000+ 真实产品（Linear、ElevenLabs、Factory、Raycast…）的设计系统，AI 可读（DESIGN.md / Tailwind / CSS Variables / Tokens）
- **怎么用**：浏览器 <https://styles.refero.design/> 搜索；或走 MCP（`refero_search` / `refero_get` / `refero_design_md`，pi 已配置 npx 免费版）
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

### 5. Uiverse Galaxy — 组件/按钮素材库

- **是什么**：3800+ 免费 UI 元素（按钮为主，MIT）
- **怎么用**：
  - 本地克隆（离线/批量）：`~/resources/galaxy/`（未克隆时远程操作原仓库 github.com/uiverse-io/galaxy）
  - 按标签 grep：`grep -l "gradient|neon" galaxy/Buttons/*.html`
  - 或在线 <https://uiverse.io/>
- **典型场景**：找现成按钮/组件 → 复制样式适配进项目

## D. 动画引擎

### 6. Motion — Web 动画库（首选）

- **是什么**：专业 Web 动画引擎（弹簧物理、滚动、手势），MIT
- **怎么用**：独立 HTML 直接 CDN 引用，零安装：

  ```html
  <script type="module">
    import { animate, spring, inView, scroll } from "https://cdn.jsdelivr.net/npm/motion@latest/+esm"
  </script>
  ```

- **配套**：本机已装 `motion` skill（~/.pi/agent/skills/motion/）——写动画前查它的 best-practices 和 css-spring
- **典型场景**：做 HTML 动效时用 Motion 而不是手写 CSS 动画

### 7. Anime.js — 全能动画引擎（补充）

- **是什么**：通用 JS/SVG 动画引擎 v4（keyframes、easings、stagger、SVG morph、运动路径、Scroll Observer），`npm i animejs` 或 CDN
- **怎么用**：<https://animejs.com/> 文档/示例；CDN: `https://cdn.jsdelivr.net/npm/animejs@4/lib/anime.esm.js`
- **典型场景**：Motion 不擅长的地方——SVG 形状变形（morph）、沿路径运动、复杂 stagger 序列

## E. 工具发现（非设计资源）

### 8. VibeIndex — AI 编程工具导航

- **是什么**：285 个 AI 编程工具目录（16 类：AI IDE、构建器、代码审查、测试等）
- **怎么用**：<https://vibeindex.dev/> 浏览发现工具（注意：这是工具目录，不是设计参考）
- **典型场景**：找新工具/对比工具时查，做设计时不用

---

## 使用流程（做设计任务时）

1. 判断任务类型 → 对应查 A–E 分组
2. 优先真实资源（refero 设计系统 / aceternity+beautifului 范式 / galaxy 组件 / motion+animejs 动效 / minimal 灵感）
3. 没有匹配资源 → 正常发挥，不要硬凑
