# 设计参考索引

本机设计资源台账。做设计任务时先扫这里，按需调用。

---

## A. 设计系统 / 风格源

### 1. Refero Styles — 真实产品设计系统库 〔R调研源·直引·主·APP/网页/Mac〕

- **是什么**：2000+ 真实产品（Linear、ElevenLabs、Factory、Raycast…）的设计系统，AI 可读（DESIGN.md / Tailwind / CSS Variables / Tokens）
- **怎么用**：浏览器 <https://styles.refero.design/> 搜索；或走 MCP（`refero_search` / `refero_get` / `refero_design_md`，pi 已配置 `https://api.refero.design/mcp`）——深度用法见 `refero-design` skill（styles/screens/flows 三层研究）
- **典型场景**：用户说"用 XX 的风格" → refero 搜该产品 → 拿 DESIGN.md（调色板/字体/间距/准则）→ 照着实现

### 2. Aceternity UI — 落地页组件范式 〔R调研源·转译·次·网页〕

- **是什么**：200+ React + Tailwind + Motion 组件/区块/模板（背景光斑、卡片动效、hero 布局等），复制粘贴式获取
- **怎么用**：抓 <https://ui.aceternity.com/> 的组件 demo 当设计/动效范式参考；组件是 React 的，不直接装，借范式
- **典型场景**：做落地页/SaaS 页面时参考其区块语言；它基于 Motion，与动画工作流契合

### 3. Kami 设计原则 — 暖纸墨蓝排版约束系统（本地） 〔C约束模板·规则·主·通用排版常驻〕

- **是什么**：轻量版 Kami 设计系统（tw93/Kami 技能提炼）——暖羊皮纸底 `#f5f4ed` + 唯一墨蓝 `#1B365D` + 衬线承载层级；十条不变量（禁纯白/禁冷灰/禁第二彩色/禁加粗斜体/禁硬阴影）+ 三步自检（取色 R≥G>B、墨蓝面积 ≤5%、页面密度 60-80%）
- **怎么用**：直接读 `~/Desktop/Design/kami-design-principles/README.md`（使用说明）和 `design-tokens.css`（设计令牌 + 组件配方，可整体粘进项目）；进阶读完整规范 `~/.agents/skills/kami/references/design.md`（1280 行）
- **典型场景**：做文档/落地页/作品集/简历/幻灯片等"排版型"视觉时走"暖纸编辑感"风格；用户要求"有高级感/书卷气/印刷质感"或"别做科技冷灰风"时

### 4. Zine 风格参考 — 52 个 AI 海报技能风格库（本地） 〔R调研源·转译·主·海报/杂志〕

- **是什么**：52 个「照片→海报/画作」类 AI 图像生成技能的提炼——8 大风格族（水彩水墨抽象/复古拼贴档案/像素复古界面/电影海报霓虹/超现实波普/明信片旅行/诗意极简/3D 品牌），含每族核心配方（从代表技能 SKILL.md 提炼）和产品设计可迁移性分级
- **怎么用**：读 `~/Desktop/Design/zine-style-references/README.md`（触发词路由表 + 迁移性速览）→ `style-families.md`（族详情）→ `quick-reference.md`（52 技能速查）；图像生成任务直接用配方写 prompt，产品设计任务用其中可迁移规律（暖纸底/档案排版/潘通取色/留白）
- **典型场景**：照片转海报/画作风格、复古档案感/像素风/电影海报风/水墨风/潘通色卡风设计；与 Kami 配合使用（同源「暖纸+衬线+克制」审美）

### 5. Minimal Gallery — 极简网页设计灵感库 〔R调研源·转译·兜底·网页〕

- **是什么**：2013 年起每日更新的精选网页设计案例库（极简风为主，含模板、字体、工具）
- **怎么用**：浏览 <https://minimal.gallery/> 找灵感案例；页面 curl 可能被拒（HTTP 000），用 web_search 查案例
- **典型场景**：做极简风/高端感设计时找真实案例参考

## B. AI 应用界面范式

### 6. Beautiful UI — AI-native 界面范式 〔R调研源·转译·次·APP〕

- **是什么**：AI 应用 UI 组件库（Chat、Streaming Text、Thinking、Tool Chips、Approval Card、Records Table 等 20 个）
- **怎么用**：抓 <https://www.beautifului.dev/> 的 demo 页面当设计语言参考（fetch_content 或 curl 解析）；组件是 React/Next 的，不直接装，只借范式
- **典型场景**：做 AI 产品界面（聊天面板、agent 状态、流式输出）时参考其组件语言

## C. 组件素材库

### 7. 21st.dev — shadcn/ui 组件市场 〔R调研源·转译·次·网页〕

- **是什么**：设计工程师社区发布的 shadcn/ui 组件/模板目录（React + Tailwind），含 shadcn 主题、shaders、渐变；组件以 shadcn registry 格式发布，与 shadcn/ui 原语组合
- **怎么用**：浏览 <https://21st.dev/> 预览组件 → 复制 AI-ready prompt 让 Cursor/Claude Code/v0 等 agent 直接落地，或 `npx shadcn add` 安装；组件是 React 的，不直接装时借范式
- **典型场景**：项目已用 shadcn/ui 时找现成组件/主题；做 React 界面时参考其组件语言

### 8. Uiverse Galaxy — 组件/按钮素材库 〔R调研源·直引·兜底·网页〕

- **是什么**：3800+ 免费 UI 元素（按钮为主，MIT）
- **怎么用**：
  - 本地克隆（离线/批量）：`~/resources/galaxy/`（未克隆时远程操作原仓库 github.com/uiverse-io/galaxy）
  - 按标签 grep：`grep -l "gradient|neon" galaxy/Buttons/*.html`
  - 或在线 <https://uiverse.io/>
- **典型场景**：找现成按钮/组件 → 复制样式适配进项目

## D. 动画引擎

### 9. Motion — Web 动画库（首选） 〔E执行工具·工具·次·通用动效〕

- **是什么**：专业 Web 动画引擎（弹簧物理、滚动、手势），MIT
- **怎么用**：独立 HTML 直接 CDN 引用，零安装：

  ```html
  <script type="module">
    import { animate, spring, inView, scroll } from "https://cdn.jsdelivr.net/npm/motion@latest/+esm"
  </script>
  ```

- **配套**：本机已装 `motion-dev-animations` skill（~/.pi/agent/skills/motion-dev-animations/）——写动画前查它的 best-practices、spring 物理与可访问性指南
- **典型场景**：做 HTML 动效时用 Motion 而不是手写 CSS 动画

### 10. Anime.js — 全能动画引擎（补充） 〔E执行工具·工具·兜底·通用动效〕

- **是什么**：通用 JS/SVG 动画引擎 v4（keyframes、easings、stagger、SVG morph、运动路径、Scroll Observer），`npm i animejs` 或 CDN
- **怎么用**：<https://animejs.com/> 文档/示例；CDN: `https://cdn.jsdelivr.net/npm/animejs@4/lib/anime.esm.js`
- **典型场景**：Motion 不擅长的地方——SVG 形状变形（morph）、沿路径运动、复杂 stagger 序列

## F. 图标 / 字体 / 纹理（高频素材，直接引用）

### 12. Lucide — 图标库（首选） 〔R调研源·直引·兜底·通用〕

- **是什么**：1000+ 线性图标，MIT，SVG 可直接引用
- **怎么用**：CDN 或复制 SVG：`https://unpkg.com/lucide-static@latest/icons/<name>.svg`；或 <https://lucide.dev/> 预览
- **典型场景**：按钮/导航/空状态/特性列表图标

### 13. Heroicons — 图标库（补充） 〔R调研源·直引·兜底·通用〕

- **是什么**：Tailwind 官方图标（outline/solid 两套），MIT
- **怎么用**：<https://heroicons.com/> 复制 SVG；或 `https://cdn.jsdelivr.net/npm/heroicons@latest/24/outline/<name>.svg`
- **典型场景**：需要 outline/solid 两种权重时

### 14. Google Fonts — 字体源 〔R调研源·直引·兜底·通用〕

- **是什么**：免费 web 字体（含中文：思源黑体 Noto Sans SC / 思源宋体 Noto Serif SC）
- **怎么用**：<https://fonts.google.com/> 挑字体 → 复制 <link> 或 @import 到 HTML
- **典型场景**：中英文排版字体；中文优先 Noto/思源系（免费可商用）

### 15. Hero Patterns — SVG 背景纹理 〔R调研源·直引·兜底·通用〕

- **是什么**：免费 SVG 平铺纹理（dots/grid/waves 等），CC0
- **怎么用**：<https://heropatterns.com/> 选图案 → 复制 CSS background（内联 SVG data URI）
- **典型场景**：hero 区/卡片背景的低调纹理

### 16. CSS 渐变工具 〔R调研源·直引·兜底·通用〕

- **是什么**：渐变背景生成器（mesh gradient 等）
- **怎么用**：<https://cssgradient.io/> 生成 CSS；或手写 `background: radial-gradient(...)` 叠加做 mesh 效果
- **典型场景**：hero 背景、卡片强调色

## G. 本机协同技能（设计任务组合，对应 registry E 执行工具）

| 技能 | 定位 | 何时用 | 场景 |
| --- | --- | --- | --- |
| `refero-design` | research-first 设计方法论（MCP 已配置） | 任何设计任务的首选研究入口 | R·主·APP/网页/Mac |
| `kami` | 专业排版（文档/PPT/落地页 HTML） | 排版输出 | E·主·文档/海报/网页 |
| `huashu-design` | HTML 高保真原型/幻灯片/动画 + 5 维评审 | 网页原型/演示 | E·主·网页 + V·主 |
| `baoyu-design` | HTML 设计产物（mockup/deck/落地页） | 网页/mockup | E·次·网页 |
| `guizang-ppt-skill` | 横向翻页网页 PPT | PPT 演示 | E·主·PPT |
| `gpt-image-2` | 图像生成/编辑 | 配图、插画、视觉探索 | E·主·海报/杂志 |
| `motion` / `motion-dev-animations` | Motion.dev 动画（spring/120fps） | 网页/PPT 动效 | E·次·通用 |
| `hyperframes` | HTML 渲染视频/动画 | 视频/动画合成 | E·次·通用 |
| `diagram-design` | 架构/流程/图表 SVG | 文档/方案图表 | E·次·通用 |
| `orange-line-illustration` | 纽约客风编辑插画 | 杂志配图/封面 | R·次·海报/杂志 |
| `frontend-design`（anthropics，未装） | 前端落地 | 网页/前端产出 | E·次·网页 |
| `imagegen` / Figma 家族（openai，未装） | 图像生成 / Figma 链路 | 配图 / Figma 工作流 | E·次·海报/APP |

> 完整三维索引（角色×形态×层级）见技能内 `references/registry.md`；登记空白区（缺格子）以装配图为准。

## E. 工具发现（非设计资源）

### 11. VibeIndex — AI 编程工具导航 〔非设计资源·工具发现〕

- **是什么**：285 个 AI 编程工具目录（16 类：AI IDE、构建器、代码审查、测试等）
- **怎么用**：<https://vibeindex.dev/> 浏览发现工具（注意：这是工具目录，不是设计参考）
- **典型场景**：找新工具/对比工具时查，做设计时不用

---

## 使用流程（工作流路由，详见技能 SKILL.md 五环节）

1. 识别场景 → 定位环节（0意图/1调研/2约束/3产出/4校验）→ 只执行当前环节动作
2. 环节 1 调研：查 R 角色资源（主必查，次按需，兜底无匹配才查）
3. 环节 2 约束：把选定参考转译成可校验约束集（C 角色 Kami 骨架常驻）
4. 环节 3 产出：调 E 角色执行工具，严格按约束集执行
5. 环节 4 校验：对照约束集自检（V 角色），不达标回环节 2
6. 信息不全 → 先问询（一次问完 ≤3 问），再继续
