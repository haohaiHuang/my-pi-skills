---
name: skill-router
description: 本机技能咨询台与台账管理器。当用户困惑"用什么技能完成某目标"、想查某平台装了哪些技能、或准备安装新技能需要判断会不会与现有技能重复/冲突时使用。运行 scripts/catalog.sh 扫描本机技能清单（按平台），返回候选技能及区分点，或给出安装前冗余判断。触发词："用什么技能"、"哪个技能"、"查技能"、"技能清单"、"装新技能"、"技能会不会重复"、"skill router"、"帮我选技能"、"技能统计"。
---

# Skill Router — 本机技能咨询台 + 台账

**核心原则：咨询台，不是分发器。** 用户描述目标 → 扫描真实磁盘 → 推荐该调用谁。同时是本机技能**台账管理器**：装新技能前扫一遍，判断会不会冗余。

> 逻辑只写一次（本 SKILL.md），数据按平台运行时扫描（`scripts/catalog.sh`，唯一的"数据源"）。不缓存、不静态清单——技能增删频繁，每次调用现扫，永远最新。

## 用法

### 1. 查询"用什么技能"

用户描述目标后：

1. 跑 `bash <本技能目录>/scripts/catalog.sh <当前平台>`
   - 平台：`pi` / `workbuddy` / `codex` / `claude` / `trae-ide` / `trae-work`，或本机**自动发现**的平台（先跑 `catalog.sh all` 看全部，如 `qwen` / `roo` / `tabnine`）
2. 从输出里定位目标类别（飞书 / 工程流 / 生产力 / 设计图像 / 文档PPT / 浏览器 / 搜索调研 / 知识管理 / 审查收尾…）
3. 返回 **1–3 个候选**：技能名 + 理由 + 调用方式（显式 `/技能名` 或描述自动触发）
4. 有子路由先指子路由：
   - 工程流问题 → 指 `ask-matt`（mattpocock 路由器）
   - 飞书问题 → 指对应 `lark-*` 技能（自带分域路由）
5. 冲突组给出区分点（见下）
6. **只推荐当前平台真实可见的技能，不编造**

### 2. 管理台账 / 安装前判断

用户想装新技能，或问"会不会重复"时：

1. 跑 `bash <本技能目录>/scripts/catalog.sh <平台> --check`
   - 输出：技能总数、实体/软链/死链结构、**同名检测**、**同类技能分布**（>1 需确认区分）
2. 判断新技能是否值得装：
   - **同名**：若清单里已有同名 → 提示冲突，建议覆盖或弃装
   - **同类 >1**：列出同类现有技能，比较新技能与其差异——若功能重叠（同类别、同 description 关键词）→ 预警冗余，让用户决策
   - **类别是否已有代表**：如已装 `guizang-ppt-skill`（网页 PPT），再来一个网页 PPT 生成器 → 提示区分点

### 3. 平台概览

`bash <本技能目录>/scripts/catalog.sh all` → 已登记平台 + **自动发现平台**技能数一览。

> 自动发现：catalog.sh 每次运行先扫描 `$HOME` 下所有隐藏目录，把**含实体 SKILL.md** 的 skills 目录识别为平台
> （一层 `~/.<name>/skills`，两层 `~/.<name>/agent/skills`，如 pi、tabnine；纯软链空壳不算，滤空目录）。
> 新装的 agent 无需改代码即可被查到——直接拿目录名当平台名查询。

## 冲突组速查（2026-08-09 全机清理后更新，随台账刷新）

| 冲突组 | 成员 | 区分点 | 处理状态 |
| --- | --- | --- | --- |
| PPT 生成 | guizang-ppt-skill / orange-ppt-skill / pptx / slides / ljg-present | 网页 HTML vs 橙线插画(已禁用) vs PPTX 文件 vs 高桥流 | 全保留（产物不同） |
| 设计 | baoyu-design / huashu-design / kami / superpowers | 三套 HTML 设计生成器，作者不同、风格侧重不同 | 全保留（trae 端 kami 禁用） |
| 浏览器 | agent-browser-core / playwright-browser-automation / playwright | agent-browser CLI vs Playwright API vs playwright-cli | 全保留（实现不同） |
| 调试 | diagnosing-bugs（mattpocock，最新版） | diagnose 已删（08-09），统一用它 | ✅ 已统一 |
| 计划 | planning-with-files（自动）vs to-spec/to-tickets/wayfinder（手动+需 tracker） | 互补，不冲突 | 保留 |
| 测试 | tdd（mattpocock） | test-driven-development（trae 云端）已删（08-09） | ✅ 已统一 |
| 研究 | research vs deep-research vs consulting-analysis | 工程调研/深度综合/咨询报告，侧重不同 | 保留 |
| 前端 | fullstack-developer / design-taste-frontend / universal-design-system / frontend-design / frontend-skill | 全栈 vs 设计品味 vs 设计系统 vs 云端设计 | 保留（trae 端） |

## 目录映射（本机实际路径，见 catalog.sh）

| 平台 | 目录 |
| --- | --- |
| pi | `~/.pi/agent/skills` + `~/.agents/skills`（直读共享层） |
| workbuddy | `~/.workbuddy/skills` |
| trae-ide | `~/.trae-cn/skills` |
| trae-work | `~/.trae/skills`（存在时）或 `~/Library/Application Support/TRAE SOLO CN/ModularData/ai-agent/skills`（自动探测） |
| codex / claude | 未装 router，仅查询用 |
| **自动发现** | 扫描 `$HOME` 下所有**含实体 SKILL.md** 的隐藏 skills 目录（纯软链空壳不算），目录名即平台名，无需登记 |

## 维护

- 本技能按"全家桶自持"原则部署于 5 平台（pi / workbuddy / trae-ide / trae-work），各副本需保持一致——改了逻辑要同步（codex/claude 不装，仅查询）
- catalog.sh 是唯一数据源；新增分类关键词时改 classify() 函数
- **平台列表不维护**：`catalog.sh all` 自动发现本机所有**含实体技能**的 skills 目录，新装的 agent 自动出现；纯软链空壳（如 `npx skills add -g` 铺出的占位目录）自动过滤；只有目录映射变化（如平台搬家）才改 platform_dirs()
- 技能增删后，可跑 `--check` 刷新认知；冲突组速查表随新发现更新
- 规范源台账见 `~/Documents/skill-sync-map.md`（先更规范源，再分发副本）
