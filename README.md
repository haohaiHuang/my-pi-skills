# my-pi-skills

A collection of original **Agent Skills** (following the [Agent Skills standard](https://agentskills.io/specification)) with no upstream repository, distributed and synced through this repo.

## Skills

| Skill | Description |
| --- | --- |
| `design-references` | Design reference index: consult `~/resources/design-references.md` before design work (design systems / AI UI patterns / components / motion / icons-fonts-textures) |
| `skill-router` | Skill advisor + inventory manager: scans local skills across platforms at runtime; subcommands scan / report / check / platforms / drift / sync |
| `vision` | Image-to-text: when the current model has no vision, automatically discovers local vision models (preferredModels order, fallback on failure) to read images |

## Structure

```
skills/                    Original skills (each with SKILL.md)
  design-references/       Design reference index
  skill-router/            Skill advisor + inventory (scripts/catalog.sh)
  vision/                  Image-to-text
resources/                 External assets / companion tools
  design-references.md     Asset catalog for design-references (SKILL.md is just the entry)
  vision-cli               Cross-platform CLI for vision (put on PATH, e.g. ~/.local/bin)
docs/                      Generic docs
  skill-sync-map.md        Multi-platform skill distribution methodology (template)
  inventory.example.md     Per-machine inventory template (actual inventories live in a private repo)
```

> Skills with a GitHub upstream (mattpocock, lark-*, etc.) install from their own upstream, not this repo.

## Usage

### design-references — Design references

**When**: UI / visual / style / motion tasks (landing pages, AI panels, PPT, components, styling).

**How**: say "build a landing page in the style of X" / "reference beautifului's AI panel patterns" — the agent first consults `~/resources/design-references.md` and reuses real resources instead of improvising; deep design tasks also leverage `refero-design`, `motion-dev-animations`, etc.

Keywords: design reference, style library, "in the style of X", landing page, AI panel.

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

## Notes

- This repo only holds **original skills with no upstream**; files containing API keys (models.json, auth.json, mcp.json, etc.) must **never be committed** — configure them per machine
- Machine-specific skill inventories are **not in this repo** — they live in a private repo (see `docs/inventory.example.md`)
