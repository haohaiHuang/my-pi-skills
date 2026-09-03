# my-pi-skills

A collection of original **Agent Skills** (following the [Agent Skills standard](https://agentskills.io/specification)) with no upstream repository, distributed and synced through this repo.

## Skills

| Skill | Description |
| --- | --- |
| `design-references` | Design workflow router: stage-first routing (new build / has direction / audit existing artifact / extract reference / component tweak) → scenario branch (A product / B content / C generic) → single needed stage of 0-intent/1-research/2-constraints/3-produce/4-verify. Uses real resources over improvisation |
| `skill-router` | Skill advisor + inventory manager: scans local skills across platforms at runtime; subcommands scan / report / check / platforms / drift / sync |
| `vision` | Image-to-text: when the current model has no vision, automatically discovers local vision models (preferredModels order, fallback on failure) to read images |

## Structure

```
skills/                    Original skills (each with SKILL.md)
  design-references/       Design reference index
  skill-router/            Skill advisor + inventory (scripts/catalog.sh)
  vision/                  Image-to-text
extensions/                Pi-only capability layer (确定性工具壳，pi 专属)
  design-router/           design-references 确定性工具化 + hallmark 注入（5 工具，见其 README）
resources/                 External assets / companion tools
  design-references.md     Asset catalog for design-references (SKILL.md is just the entry)
  vision-cli               Cross-platform CLI for vision (put on PATH, e.g. ~/.local/bin)
docs/                      Generic docs
  skill-sync-map.md        Multi-platform skill distribution methodology (template)
  inventory.example.md     Per-machine inventory template (actual inventories live in a private repo)
```

## 安装

- 技能分发到各平台：`./install.sh [目标 skills 目录]`（默认 `~/.pi/agent/skills`）
- pi 专属 extension：`./install-design-router.sh`（含 design-references 自动补装；hallmark 需 `--with-hallmark` 显式确认）

> Skills with a GitHub upstream (mattpocock, lark-*, etc.) install from their own upstream, not this repo.

## Usage

### design-references — Design workflow router

**When**: UI / visual / style / motion tasks (landing pages, AI panels, PPT, components, styling), or auditing an existing artifact ("this page looks ugly / AI-ish").

**How**: stage-first routing, not full-pipeline-by-default:

| Stage signal | Route |
| --- | --- |
| From scratch (no direction/artifact) | Full flow 0→4 |
| Has direction/brief | Enter at stage 2/3 |
| Artifact exists → audit/iterate ("很丑/很怪/不协调") | Stage 4 quick channel (`references/ui-quickfix.md`) |
| Has reference object ("look at this site/style") | hallmark study / extraction |
| Component tweak | Light: grep sibling + reuse tokens |

pi platform adds deterministic tools via `extensions/design-router` (design_route / design_research / design_diversity / design_lookup / design_audit / design_contrast / design_quality / hallmark_study_fetch) + slim hallmark skeleton injection (stage-routing, not full 19K SKILL.md).

Keywords: design reference, style library, "in the style of X", landing page, AI panel, 很丑/不好看/不协调, audit this page.

### skill-router — Skill advisor + inventory

**When**: unsure which skill to use, want a platform skill list, pre-install duplication check, inventory/reporting.

**How**: describe the goal directly ("which skill should I use to turn screenshots into a video?") or use subcommands:

| Subcommand | Purpose |
| --- | --- |
| `scan [platform]` | List skills (default: pi) |
| `report [platform]` | Inventory report (counts/duplicates/conflicts) |
| `check <skill> [platform]` | Pre-install duplication check |
| `platforms` | Platform overview |
| `drift [skill]` | Cross-platform version drift detection |
| `sync` | Update the skill routing matrix (run after installing new skills) |
| `help` | Usage |

Keywords: which skill, list skills, skill inventory, skill audit, update inventory, will it duplicate.

### vision — Image-to-text

**When**: current model has no vision, but the task needs to see images/screenshots, OCR text, or understand UI.

**How**: say "analyze this image /tmp/x.png" / "extract the text" — the agent automatically calls `vision-cli` (auto-discovers local vision models, preferredModels order, fallback on failure); or manually: `vision-cli <image> [question]`.

Advanced:

```bash
vision-cli --deep <image> "focus"          # autonomous multi-round understanding → full report
vision-cli <image> "..." --format json     # API-enforced JSON output (extract lists)
vision-cli <image> "..." --context "prev"  # follow-up on the same image (multi-turn)
```

Keywords: look at image, recognize image, extract image text, analyze screenshot, what's in this image.

## Install

**Let your agent install it (recommended)** — give the repo URL to your current agent:

> "Install the skills from this repo: https://github.com/haohaiHuang/my-pi-skills"

The agent will clone and run `install.sh` automatically.

**Manual**:

```bash
git clone https://github.com/haohaiHuang/my-pi-skills && cd my-pi-skills
./install.sh        # install to pi (including external assets, vision-cli)
./install.sh ~/.workbuddy/skills      # other platforms: pass the target skills dir
```

## Managing skills day to day

**Just installed a new skill?** No manual registration needed — skill-router scans the disk at runtime, so the skill is visible on next query; run `sync` to persist it into the routing matrix (`/skill:skill-router sync`, or just ask "update skill inventory").

**New skills in this repo** (maintainers): put new original skill dirs in `skills/`, external deps in `resources/`, commit & push.

## Credits — 借鉴与归位

`design-references` 是编排器/路由器，不是原创方法论合集。它把多家方法论**归位为执行细节**（各归各环节、按需 read），并注明借鉴来源：

| 借鉴自 | 归位为 | 环节 |
| --- | --- | --- |
| [nutlope/hallmark](https://github.com/nutlope/hallmark) | 执行层：21 宏结构/21 theme/4 genre/58 slop gates + pre-emit 六轴自评 | 形态库/气质库/环节 4 |
| [tw93/Kami](https://github.com/tw93/Kami) | 排版骨架不变量 + Kami 三查（取色/品牌色面积/页面密度） | 环节 2 约束 / 环节 4 品牌层 |
| [tw93/Waza](https://github.com/tw93/Waza) → `/ui` | 视觉迭代快速通道：方向锁五维 + grep sibling 复用 + native exception + 中文 gut-feel 路由 | 环节 4 视觉迭代（`references/ui-quickfix.md`） |
| [huashu-design](https://github.com/alchaincyf/huashu-design) | 事实验证门（涉具体产品先搜证）+ 品牌资产门（logo/产品图 > 品牌色）+ 候选"看得见" | 环节 0 5b / 环节 1 1a / 环节 1 9a |
| [baoyu-design](https://github.com/JimLiu/baoyu-design) | 候选同页并排展示（artboard 对比优于散文件） | 环节 1 9a |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) | 动效原则（频率分级/缓动决策序/时长表/物理感，EM-*） | 环节 2 动效约束 / 环节 4 |
| interfaces.dev cheat-sheet | craft 约束（typography/colors/layout/a11y/writing，CS-*） | 环节 2 |
| refero Styles / beautifului / zine 族 | 真实产品参考候选池（风格桶） | 环节 1 调研 |
| dembrandt / openpencil | 候选验证引擎（URL→精确 token / .fig 直读） | 环节 1 验证 / 环节 4 |

> 归位原则：**触发重叠才归位**（如 hallmark、/ui 与设计任务重叠→并入环节）；**触发独立则独立存在**（如 /write /health /think 是独立 skill，不在本 repo）。具体各 skill 的深入借鉴在对应文件内标注。

## Notes

- This repo only holds **original skills with no upstream**; files containing API keys (models.json, auth.json, mcp.json, etc.) must **never be committed** — configure them per machine
- Machine-specific skill inventories are **not in this repo** — they live in a private repo (see `docs/inventory.example.md`)
