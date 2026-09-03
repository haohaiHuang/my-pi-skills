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
extensions/                Pi-only capability layer (deterministic tool shells, pi-specific)
  design-router/           design-references 确定性工具化 + hallmark 注入（5 工具，见其 README）
resources/                 External assets / companion tools
  design-references.md     Asset catalog for design-references (SKILL.md is just the entry)
  vision-cli               Cross-platform CLI for vision (put on PATH, e.g. ~/.local/bin)
docs/                      Generic docs
  skill-sync-map.md        Multi-platform skill distribution methodology (template)
  inventory.example.md     Per-machine inventory template (actual inventories live in a private repo)
```

## 安装

- Distribute skills to platforms: `./install.sh [target skills dir]` (default `~/.pi/agent/skills`)
- Pi-only extension: `./install-design-router.sh` (auto-installs design-references; hallmark requires explicit `--with-hallmark`)

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

## Credits

`design-references` is an **orchestrator/router**, not an original methodology collection. It takes methodologies from other projects, **maps each into a stage detail** (read on demand), and credits the sources:

| Borrowed from | Mapped into | Stage |
| --- | --- | --- |
| [nutlope/hallmark](https://github.com/nutlope/hallmark) | Execution layer: 21 macrostructures / 21 themes / 4 genres / 58 slop gates + pre-emit 6-axis self-review | Shape library / mood library / Stage 4 |
| [tw93/Kami](https://github.com/tw93/Kami) | Typesetting skeleton invariants + Kami triple-check (palette extraction / brand-color area / page density) | Stage 2 constraints / Stage 4 brand layer |
| [tw93/Waza](https://github.com/tw93/Waza) → `/ui` | Visual iteration fast path: 5-dimension direction lock + grep-sibling reuse + native-app exception + Chinese gut-feel routing | Stage 4 visual iteration (`references/ui-quickfix.md`) |
| [huashu-design](https://github.com/alchaincyf/huashu-design) | Fact-verification gate (search before asserting on specific products) + brand-asset gate (logo/product image > brand color) + visible candidates | Stage 0 5b / Stage 1 1a / Stage 1 9a |
| [baoyu-design](https://github.com/JimLiu/baoyu-design) | Side-by-side candidate display (artboard comparison over loose files) | Stage 1 9a |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) | Motion principles (frequency tiers / easing decision order / duration table / physics, EM-*) | Stage 2 motion constraints / Stage 4 |
| interfaces.dev cheat-sheet | Craft constraints (typography / colors / layout / a11y / writing, CS-*) | Stage 2 |
| refero Styles / beautifului / zine family | Real-product reference candidate pool (style buckets) | Stage 1 research |
| dembrandt / openpencil | Candidate verification engine (URL → precise tokens / direct .fig read) | Stage 1 verification / Stage 4 |

> Mapping principle: **borrow when triggers overlap** (hallmark, `/ui` overlap design tasks → merged into stages); **keep independent when triggers are separate** (`/write`, `/health`, `/think` are standalone skills, not in this repo). Deeper borrowings per skill are noted inside the files.

## Notes

- This repo only holds **original skills with no upstream**; files containing API keys (models.json, auth.json, mcp.json, etc.) must **never be committed** — configure them per machine
- Machine-specific skill inventories are **not in this repo** — they live in a private repo (see `docs/inventory.example.md`)
