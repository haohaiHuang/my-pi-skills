---
name: skill-router
description: 本机技能咨询台与台账管理器。当用户困惑"用什么技能完成某目标"、想查某平台装了哪些技能、准备安装新技能判断是否重复/冲突、或要盘点/同步技能台账时使用。支持子命令模式：scan（扫描清单）、report（盘点报告）、check（装前判断）、platforms（平台概览）、drift（版本漂移检测）、sync（更新技能路由矩阵台账）。运行 scripts/catalog.sh 扫描本机技能清单（按平台）。触发词："用什么技能"、"哪个技能"、"查技能"、"技能清单"、"装新技能"、"技能会不会重复"、"技能盘点"、"技能体检"、"更新台账"、"skill router"。
---

# Skill Router — 本机技能咨询台 + 台账

**核心原则：咨询台，不是分发器。** 用户描述目标 → 扫描真实磁盘 → 推荐该调用谁。同时是本机技能**台账管理器**：技能×平台路由矩阵（`~/Documents/skill-inventory.md`）+ 装前冗余判断。

> 逻辑只写一次（本 SKILL.md），数据按平台运行时扫描（`scripts/catalog.sh`，唯一的"数据源"）。每次调用现扫，永远与磁盘一致；矩阵台账（inventory）由 `sync` 模式固化快照，供跨平台路由与漂移检测。

## 调用模式（子命令路由）

先看用户意图匹配下表；无参数或无法匹配时走**默认·咨询台**模式。

| 模式 | pi 显式调用 | 各平台触发词 | 执行动作 |
|---|---|---|---|
| **默认·咨询台** | `/skill:skill-router` | "用什么技能""帮我选技能""哪个技能" | 推荐技能（先查矩阵路由） |
| **scan** | `/skill:skill-router scan [平台]` | "查技能清单""扫描""装了哪些" | `catalog.sh <平台>` 分类清单 |
| **report** | `/skill:skill-router report [平台]` | "盘点""体检""出报告""技能统计" | `catalog.sh <平台> --check` + 结构化盘点 |
| **check** | `/skill:skill-router check <技能> [平台]` | "装X会不会重复""装前判断" | `--check` + 能否安装结论 |
| **platforms** | `/skill:skill-router platforms` | "有哪些平台""平台概览" | `catalog.sh all` |
| **drift** | `/skill:skill-router drift [技能]` | "版本不一致""漂移""哪个平台没更新" | 读矩阵找多平台版本差异 |
| **sync** | `/skill:skill-router sync` | "更新台账""登记技能""同步台账" | 生成矩阵 → diff → 确认 → 写 `~/Documents/skill-inventory.md` |
| **help** | `/skill:skill-router help` | "怎么用" | 输出本表 |

平台参数：`pi` / `dsh` / `workbuddy` / `codex` / `claude` / `trae-ide` / `trae-work`，或自动发现平台名（`platforms` 查看）。

---

### 默认模式：咨询台（推荐技能）

用户描述目标，不知道用什么技能时：

1. **先读矩阵路由**：读 `~/Documents/skill-inventory.md`，看候选技能在**当前平台**是否有、在其他平台版本如何——推荐时能说"这技能 pi 有，workbuddy 也有（版本一致）"
2. **再跑 scan 验证当下**：`bash <本技能目录>/scripts/catalog.sh <当前平台>`，确认技能确实在当前平台可见（矩阵可能滞后于磁盘）
3. 从输出里定位目标类别（飞书 / 工程流 / 生产力 / 设计图像 / 文档PPT / 浏览器 / 搜索调研 / 知识管理 / 审查收尾 / 平台接入 / 视频音频…）
4. 返回 **1–3 个候选**：技能名 + 理由 + 调用方式（显式 `/技能名` 或描述自动触发）+ 平台分布
5. 有子路由先指子路由：工程流 → `ask-matt`；飞书 → 对应 `lark-*`
6. 冲突组给出区分点（见下）
7. **只推荐当前平台真实可见的技能，不编造**

### scan 模式：扫描清单

1. 跑 `bash <本技能目录>/scripts/catalog.sh <平台>`（默认 pi）
2. 输出分类清单；用户可追问"X 类有哪些""Y 技能在吗"

### report 模式：盘点报告

1. 单平台：跑 `catalog.sh <平台> --check`；全机：跑 `catalog.sh all`（或逐平台 `--check`）
2. 整理为结构化报告：
   - **平台概况**：技能总数、实体/软链/死链、平台对比表
   - **同名检测**：列出重复（已按 realpath 去重——软链对同一物理文件只计一次；只有不同物理文件同名才报真冲突）
   - **同类分布**：>1 的类别 + 成员，标注需确认的区分
   - **⚠️ 风险提示**：死链、版本漂移（可对照矩阵）、异常分类
3. 报告末尾可附"台账同步建议"：与矩阵对比，列出新增/消失/漂移项（提示用户跑 `sync` 更新）

### check 模式：安装前判断

1. 跑 `catalog.sh <平台> --check`
2. 对新技能判断：
   - **同名**：矩阵/清单已有同名 → 提示冲突（覆盖/弃装）
   - **同类 >1**：列出同类现有技能，功能重叠 → 预警冗余，让用户决策
   - **类别已有代表**：如已装 `guizang-ppt-skill`（网页 PPT）再来一个网页 PPT 生成器 → 给区分点
3. 结论明确："✅ 可装（无冲突）" 或 "⚠️ 与 X 冗余，建议…"

### platforms 模式：平台概览

`catalog.sh all` → 已登记平台 + 自动发现平台，各平台技能数。

### drift 模式：版本漂移检测

1. 读 `~/Documents/skill-inventory.md` 矩阵，找多平台技能中版本/hash 不一致的行
2. 无参数：列出全部漂移项；带技能名：只查该技能
3. 输出格式：`技能：pi=1.2.0, workbuddy=1.1.0（漂移，规范源待确认）`
4. 提示用户可用 `sync` 更新矩阵，或用规范源重新分发

### sync 模式：更新台账（技能路由矩阵）

**这是唯一"写入台账"的模式。**

1. 生成新矩阵：`bash <本技能目录>/scripts/catalog.sh matrix`
2. 对比旧矩阵 `~/Documents/skill-inventory.md`，提取差异：
   - **新增技能**（矩阵新增行）：多平台出现 → 建议登记
   - **消失技能**（矩阵删除行）：提示确认是否真删除
   - **漂移**（同技能跨平台版本/hash 不一致）：提示规范源待确认
3. **展示 diff 给用户，确认后**才写文件（半自动，不擅自改文档）
4. 写入后更新文件头的时间戳快照标记
5. 矩阵含义：`✓版本` = 该平台有（有 version frontmatter 记版本，无则记 SKILL.md hash 前 6 位）；`✗` = 无

> ⚠️ 注意：sync 只更新 `~/Documents/skill-inventory.md`（机器维护的路由矩阵）；`~/Documents/skill-sync-map.md`（规范源/分发文档）仍是人工维护，sync 不碰它。

### help 模式

输出上方的调用模式速查表。

---

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
| dsh | `~/.dsh/skills` + `~/.agents/skills`（共享层：DSH 的 design agent 预设与 picgen 导入都写这里，与 pi 共读；同名单文件 = 软链/同源，非冲突） |
| workbuddy | `~/.workbuddy/skills` |
| trae-ide | `~/.trae-cn/skills` |
| trae-work | `~/.trae/skills`（存在时）或 `~/Library/Application Support/TRAE SOLO CN/ModularData/ai-agent/skills`（自动探测） |
| codex / claude | 未装 router，仅查询用 |
| **自动发现** | 扫描 `$HOME` 下所有**含实体 SKILL.md** 的隐藏 skills 目录（纯软链空壳不算），目录名即平台名，无需登记 |

## 维护

- 本技能按"全家桶自持"原则部署于 5 平台（pi / workbuddy / trae-ide / trae-work），各副本需保持一致——改了逻辑要同步（codex/claude 不装，仅查询）
- catalog.sh 是唯一数据源；新增分类关键词时改 classify() 函数
- **平台列表不维护**：自动发现本机所有**含实体技能**的 skills 目录，新装的 agent 自动出现；纯软链空壳自动过滤；只有目录映射变化（如平台搬家）才改 platform_dirs()
- **矩阵台账**：`~/Documents/skill-inventory.md` 由 `sync` 模式机器维护（生成 → diff → 确认 → 写入），其余模式只读
- 规范源/分发文档 `~/Documents/skill-sync-map.md` 人工维护（先更规范源，再分发副本）
- 技能增删后，可跑 `--check` 刷新认知；冲突组速查表随新发现更新
