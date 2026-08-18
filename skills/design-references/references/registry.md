# 资源注册表 — 三维索引

**维度**：`角色`（R调研源 / C约束模板 / E执行工具 / V校验标准）× `形态`（直引 / 转译 / 规则 / 工具）× `层级`（主 / 次 / 兜底）+ 适用场景 + **退化链**（工具缺失时降级路径）。

**查法**：`[分支] × [环节] → 找对应格子`。主层级必查，次按需，兜底无匹配才查。
**填法**：新增资源先登记再使用；一条资源可占多行（每行一个格子），但每行只占一格。
**装前规则**：新增资源必须五栏全填；与现有资源**同型**（同角色+同形态+同场景）的不装；站不住位置的不装。

---

## R 调研源（环节 1：真实产品/作品，回答"别人怎么做的"）

| 资源 | 形态 | 层级 | 适用场景 | 退化链 |
| --- | --- | --- | --- | --- |
| refero MCP / refero-design skill（真实产品 DESIGN.md，150K+ 屏幕） | 直引 | 主 | APP / 网页 / Mac | → styles.refero.design 网站 → web_search |
| Zine 风格库（52 个 AI 海报技能风格配方，本地 `~/Desktop/Design/zine-style-references/`） | 转译 | 主 | 海报 / 杂志 | → 本地文件直读（无退化） |
| VoltAgent awesome-claude-design（68 个真实产品 DESIGN.md 合集） | 直引 | 次 | 网页 / Mac | → getdesign.md 官网 |
| Beautiful UI（AI-native 界面范式） | 转译 | 次 | APP | → 官网浏览 → web_search |
| Aceternity UI（落地页组件/区块范式） | 转译 | 次 | 网页 | → 官网浏览 → web_search |
| 21st.dev（shadcn/ui 组件市场） | 转译 | 次 | 网页 | → 官网浏览 |
| minimal.gallery（极简网页灵感） | 转译 | 兜底 | 网页 | → web_search |
| Uiverse Galaxy（组件/按钮素材） | 直引 | 兜底 | 网页 | → 本地克隆 grep |
| orange-line-illustration（纽约客风编辑插画风格） | 转译 | 次 | 海报 / 杂志 | → 技能本地文件 |
| Lucide / Heroicons / Google Fonts / Hero Patterns / 渐变工具（图标字体纹理素材） | 直引 | 兜底 | 通用 | → CDN 直引（无退化） |

## C 约束模板（环节 2：规则/令牌，回答"我们怎么做"）

| 资源 | 形态 | 层级 | 适用场景 | 退化链 |
| --- | --- | --- | --- | --- |
| Kami 约束骨架（十条不变量 + 设计令牌，本地 `~/Desktop/Design/kami-design-principles/`） | 规则 | 主 | 通用排版（所有场景常驻） | → Kami 轻量版 README → 十条不变量心法手动应用 |
| Kami 完整设计规范（`~/.agents/skills/kami/references/design.md`） | 规则 | 主 | 文档 / 网页 | → 本地文件直读（无退化） |
| Zine 风格族配方（从风格库提炼的色板/质感/排版规律） | 转译 | 主 | 海报 / 杂志 | → style-families.md 直读 |
| DESIGN.md（选定参考的设计系统文件） | 直引 | 主 | APP / 网页 / Mac | → refero 在线拿 / getdesign.md |
| design-md-skill（生成 DESIGN.md 约束文件，待装） | 工具 | 主 | APP（约束生成） | → 手动写约束集（遵循 workflow.md 格式） |

## E 执行工具（环节 3：能动手的技能）

| 资源 | 形态 | 层级 | 适用场景 | 退化链 |
| --- | --- | --- | --- | --- |
| kami 技能（WeasyPrint 排版 → HTML/PDF） | 工具 | 主 | 文档 / 海报排版 / 网页 | → 手写 HTML 遵循令牌 |
| huashu-design（HTML 高保真原型/幻灯片/动画） | 工具 | 主 | 网页 / 通用 | → kami / 手写 HTML |
| baoyu-design（HTML 设计产物：mockup/deck/落地页） | 工具 | 次 | 网页 / 通用 | → huashu-design |
| frontend-design（anthropics/skills，前端落地） | 工具 | 次 | 网页 / Mac | → 手写 HTML/CSS |
| gpt-image-2（图像生成/编辑） | 工具 | 主 | 海报 / 杂志插图 | → 其他绘图工具 |
| imagegen（openai/skills 官方图像生成） | 工具 | 次 | 海报 / 杂志插图 | → gpt-image-2 |
| Figma 家族（openai/skills：generate/implement/design-system-rules） | 工具 | 次 | APP / 网页 | → HTML 原型 |
| guizang-ppt-skill（横向翻页网页 PPT） | 工具 | 主 | PPT | → kami slides 路径 |
| motion / motion-dev-animations / Anime.js（动效） | 工具 | 次 | 通用（网页动效） | → CSS 动画 |
| hyperframes（HTML 渲染视频/动画） | 工具 | 次 | 通用（视频） | → 静态 HTML 分段 |
| diagram-design（架构/流程/图表 SVG） | 工具 | 次 | 通用（图表） | → 手写 SVG |
| theme-factory / brand-guidelines / canvas-design / algorithmic-art（anthropics/skills） | 工具 | 兜底 | 通用 | → 手动应用品牌准则 |

## V 校验标准（环节 4：检查清单）

| 资源 | 形态 | 层级 | 适用场景 | 退化链 |
| --- | --- | --- | --- | --- |
| Kami 三查（取色 R≥G>B / 品牌色面积 ≤5% / 页面密度 60-80%） | 规则 | 主 | 通用排版 | → 取色器 + 目测 → 三条规则人脑执行 |
| huashu 5 维评审（设计成品多维度审查） | 规则 | 主 | 网页 / 通用 | → Kami 三查 + 人工评审 |
| Zine 风格一致性自检（对照选定风格族的色板/质感/排版核对） | 规则 | 次 | 海报 / 杂志 | → 人工对照 style-families.md |
| design-qa-checklist（Owl-Listener/designer-skills 的 UI QA 清单，待装） | 规则 | 主 | APP（交互可用性） | → 手动过导航/状态/反馈三问 |

---

## 登记空白区（缺格子 — 待补/待增强）

| 格子 | 状态 | 动作 | 候选 |
| --- | --- | --- | --- |
| R·海报场景·主 | 已有 Zine 风格库 | 无缺 | — |
| R·杂志场景·主 | 已有 Zine 风格库 | 无缺 | — |
| R·Mac 场景·主 | refero 已覆盖（2000+ 产品含桌面） | 无缺（撤销原标记） | — |
| R·UX 研究方法 | 16 条资源全为视觉/风格参考，无 UX 方法 | 待补 | Owl-Listener design-research 组 |
| C·APP 场景·约束模板 | 无跨产品可复用的 APP 约束骨架 | 待补 | design-md-skill（生成式） |
| V·APP 场景·校验 | 无 UI 可用性/交互自检标准 | 待补 | design-qa-checklist |
| E·Mac 场景·执行 | 依赖通用工具，无原生 SwiftUI 执行链 | 待评估 | frontend-design / 原生 |

## 安装裁定（基于装配图）

| 资源 | 裁定 |
| --- | --- |
| Owl-Listener/designer-skills | ✅ 装（补 V·APP + R·UX 两个类型真空） |
| wenyen-hsu/design-md-skill | ✅ 装（补 C·APP 约束生成） |
| VoltAgent awesome-claude-design | ⛔ 不装（与 refero 同型：R 查询类，仅登记，拉到 Design 文件夹作离线补充） |
| anthropics brand-guidelines / theme-factory / algorithmic-art | ⛔ 不装（增强非补缺，登记即可，按需再装） |
| openai imagegen | ⛔ 不装（与 gpt-image-2 同型重合） |
