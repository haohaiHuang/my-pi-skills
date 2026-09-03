# my-pi-skills

自研的 **Agent Skills** 集合（遵循 [Agent Skills 标准](https://agentskills.io/specification)），无上游仓库，通过本仓库分发与同步。

## 包含技能

| 技能 | 说明 |
| --- | --- |
| `design-references` | 设计工作流路由：阶段优先判定（从零新建 / 有方向要落地 / 产物已存在审计 / 参考萃取 / 组件微调）→ 场景分支（A 产品 / B 内容 / C 通用）→ 路由到需要的单环节（0 意图/1 调研/2 约束/3 产出/4 校验）。能引用真实资源就不凭空发挥 |
| `skill-router` | 技能咨询台 + 台账管理器：运行时扫描本机各平台技能，支持 scan / report / check / platforms / drift / sync 子命令 |
| `vision` | 读图转文字：当前模型无视觉能力时，自动发现本机视觉模型（preferredModels 顺序，失败回退）读取图片 |

## 结构

```
skills/                    自研 skill 文件夹（每个含 SKILL.md）
  design-references/       设计参考索引
  skill-router/            技能咨询台 + 台账（scripts/catalog.sh）
  vision/                  读图转文字
resources/                 外部素材 / 配套工具
  design-references.md     design-references 的素材台账（SKILL.md 只是入口）
  vision-cli               vision 的跨平台 CLI（放 PATH 如 ~/.local/bin）
docs/                      通用文档
  skill-sync-map.md        多平台技能分发方法论（模板，复制到本机填实际数据）
  inventory.example.md     per-machine 技能清单模板（实际清单存私有仓库）
```

> 有 GitHub 上游的技能（mattpocock、lark-* 等）从各自上游安装，不进本仓库。

## 使用

### design-references — 设计工作流路由

**何时用**：做 UI / 界面 / 视觉 / 风格 / 动效任务（落地页、AI 面板、PPT、组件、风格化），或审计已有产物（“这页面很丑/很 AI”）。

**怎么用**：阶段优先路由，不默认全流程：

| 阶段信号 | 路由 |
| --- | --- |
| 从零新建（无方向/无产物） | 完整流程 0→4 |
| 有方向/brief | 从环节 2/3 切入 |
| 产物已存在 → 审计/迭代（“很丑/很怪/不协调”） | 环节 4 快速通道（`references/ui-quickfix.md`） |
| 有参考对象（“看这网站/风格”） | hallmark study / 萃取 |
| 组件级微调 | 轻量：grep sibling + 复用 token |

pi 平台由 `extensions/design-router` 提供确定性工具（design_route / design_research / design_diversity / design_lookup / design_audit / design_contrast / design_quality / hallmark_study_fetch）+ slim 骨架注入（阶段路由，非完整 19K SKILL.md）。

触发词：设计参考、风格库、用 XX 的风格、做落地页、AI 面板、很丑/不好看/不协调、审计这个页面。

### skill-router — 技能咨询台 + 台账

**何时用**：不知道用什么技能、想查平台技能清单、装新技能前判断重复、盘点/同步台账。

**怎么用**：直接描述目标（“我想把截图合成视频用什么技能？”）或使用子命令：

| 子命令 | 作用 |
| --- | --- |
| `scan [平台]` | 扫描技能清单（默认 pi） |
| `report [平台]` | 盘点报告（技能数/同名/冲突） |
| `check <技能> [平台]` | 装前判断是否重复/冗余 |
| `platforms` | 平台概览 |
| `drift [技能]` | 跨平台版本漂移检测 |
| `sync` | 更新技能路由矩阵台账（新装技能后跑一次） |
| `help` | 用法说明 |

触发词：用什么技能、查技能清单、技能盘点、技能体检、更新台账、装新技能会不会重复。

### vision — 读图转文字

**何时用**：当前模型没有视觉能力，但任务需要看图片/截图、OCR 提取文字、识别 UI。

**怎么用**：对 agent 说“分析这张图 /tmp/x.png”“提取图里文字”，agent 会自动调 `vision-cli`（自动发现本机视觉模型，按 preferredModels 顺序尝试、失败回退）；也可手动：`vision-cli <图片路径> [问题]`。

触发词：看图、识别图片、提取图片文字、分析截图、图片里写了什么。

## 安装

**让 Agent 装（推荐）**——直接把仓库地址给当前 agent：

> “安装这个仓库的技能：https://github.com/haohaiHuang/my-pi-skills”

Agent 会自动执行：clone → 运行 `install.sh` → 装好全部技能。

**手动装**：

```bash
git clone https://github.com/haohaiHuang/my-pi-skills && cd my-pi-skills
./install.sh        # 安装到 pi（含外部资源、vision-cli）
./install.sh ~/.workbuddy/skills      # 其他平台换目标目录
```

## 使用中的技能管理

**新装了一个技能？** 无需手动登记——skill-router 运行时扫描磁盘，下次查询自动可见；跑一次 `sync` 把新技能固化进路由矩阵台账（`/skill:skill-router sync`，或问 agent “更新技能台账”）。

**本仓库的新技能**（维护者）：新自研 skill 目录放进 `skills/`，外部依赖放 `resources/`，commit push 即可。

## 借鉴与归位（Credits）

`design-references` 是编排器/路由器，不是原创方法论合集。它把多家方法论**归位为执行细节**（各归各环节、按需 read），并注明借鉴来源：

| 借鉴自 | 归位为 | 环节 |
| --- | --- | --- |
| [nutlope/hallmark](https://github.com/nutlope/hallmark) | 执行层：21 宏结构/21 theme/4 genre/58 slop gates + pre-emit 六轴自评 | 形态库/气质库/环节 4 |
| [tw93/Kami](https://github.com/tw93/Kami) | 排版骨架不变量 + Kami 三查（取色/品牌色面积/页面密度） | 环节 2 约束 / 环节 4 品牌层 |
| [tw93/Waza](https://github.com/tw93/Waza) → `/ui` | 视觉迭代快速通道：方向锁五维 + grep sibling 复用 + native exception + 中文 gut-feel 路由 | 环节 4 视觉迭代（`references/ui-quickfix.md`） |
| [huashu-design](https://github.com/alchaincyf/huashu-design) | 事实验证门（涉具体产品先搜证）+ 品牌资产门（logo/产品图 > 品牌色）+ 候选“看得见” | 环节 0 5b / 环节 1 1a / 环节 1 9a |
| [baoyu-design](https://github.com/JimLiu/baoyu-design) | 候选同页并排展示（artboard 对比优于散文件） | 环节 1 9a |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) | 动效原则（频率分级/缓动决策序/时长表/物理感，EM-*） | 环节 2 动效约束 / 环节 4 |
| interfaces.dev cheat-sheet | craft 约束（typography/colors/layout/a11y/writing，CS-*） | 环节 2 |
| refero Styles / beautifului / zine 族 | 真实产品参考候选池（风格桶） | 环节 1 调研 |
| dembrandt / openpencil | 候选验证引擎（URL→精确 token / .fig 直读） | 环节 1 验证 / 环节 4 |

> 归位原则：**触发重叠才归位**（如 hallmark、/ui 与设计任务重叠→并入环节）；**触发独立则独立存在**（如 /write /health /think 是独立 skill，不在本仓库）。具体各 skill 的深入借鉴在对应文件内标注。

## 注意

- 本仓库只放**无上游的自研件**；带 API key 的配置文件（models.json、auth.json、mcp.json 等）**一律不进 git**，各机器自行配置
- 机器相关的技能安装清单**不放本仓库**——存私有仓库（见 `docs/inventory.example.md`）
