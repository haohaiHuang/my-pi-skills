# Skill 同步地图（skill-sync-map）— 本机台账

> 用途：登记所有"多平台技能"的规范源。更新技能时先更新规范源，再分发到各副本。
> 生成日期：2026-08-09（全机体检后）
> 平台目录：pi=`~/.pi/agent/skills`(+直读`~/.agents/skills`)、agents=`~/.agents/skills`、workbuddy=`~/.workbuddy/skills`、codex=`~/.codex/skills`、claude=`~/.claude/skills`、trae-ide=`~/.trae-cn/skills`、trae-work=`~/Library/Application Support/TRAE SOLO CN/ModularData/ai-agent/skills`

## 规范源约定

- **GITHUB** = 有 GitHub 上游仓库，以仓库为准（更新：clone → 分发）
- **指定副本** = 无上游仓库，以指定平台目录的副本为规范源
- **LOCALIZED** = 故意差异（双语/适配版），不同步
- **CLOUD** = Trae marketplace 云端分发，GitHub 无对应，随 Trae 账号同步

## 重复技能清单

### 已统一（多副本内容一致，2026-08-09 体检确认）

| skill | 副本数 | 平台 | 规范源 |
| --- | --- | --- | --- |
| mattpocock 全家桶 35 | 5 | pi/workbuddy/codex/claude/trae-ide | GITHUB: mattpocock/skills main |
| guizang-ppt-skill | 2 | workbuddy/trae-ide | GITHUB: op7418/guizang-ppt-skill |
| orange-line-illustration | 4 | agents/workbuddy/claude/trae-ide | GITHUB: orange2ai/orange-line-illustration |
| book2skill (cangjie) | 1 | trae-ide | GITHUB: kangarooking/cangjie-skill |
| planning-with-files | 1 | agents(pi 直读) | GITHUB: mxyhi/ok-skills |
| find-docs / find-skills | 3 | agents/claude/trae-ide | GITHUB: mxyhi/ok-skills |
| defuddle / json-canvas / obsidian-* | 3 | agents/claude/trae-ide | GITHUB: kepano/obsidian-skills |
| excalidraw / mermaid / obsidian-canvas | 3 | agents/claude/trae-ide | GITHUB: axtonliu/axton-obsidian-visual-skills |
| harness-creator | 3 | agents/claude/trae-ide | GITHUB: walkinglabs/learn-harness-engineering |
| hyperframes | 3 | agents/claude/trae-ide | GITHUB: hyperframes/hyperframes |
| context7 | 1 | pi | GITHUB: intellectronica/agent-skills |
| edge-tts | 1 | pi | GITHUB: aahl/skills |
| tavily-search | 1 | pi | GITHUB: tavily-ai/skills |
| neat-freak | 3 | agents/claude/trae-ide | GITHUB: KKKKhazix/khazix-skills |
| baoyu-design / huashu-design / kami | 3 | agents(软链)/workbuddy/trae-ide(软链) | 指定副本: workbuddy |
| lark-* 27 | 3 | agents(实体)/claude(软链)/trae-ide(软链) | 指定副本: .agents（lark-cli 分发） |
| skill-router | 5 | pi/workbuddy/trae-ide/trae-work | 自研，catalog.sh 运行时扫描（codex/claude 不装） |
| pdf | 3 | pi/codex/trae-ide | 各平台独立版本（trae 312 行完整版 > pi 67 行精简版），暂不同步 |
| book-to-skill | 3 | workbuddy/trae-ide/trae-work | ⚠️ workbuddy 残缺(1文件)，trae-ide 完整(34文件)，待统一 |
| orange-ppt-skill | 2 | workbuddy/trae-ide | 指定副本: workbuddy（trae 已禁用） |
| stock-selection | 2 | workbuddy/trae-ide | 指定副本: workbuddy |

### 故意差异（LOCALIZED，勿同步）

| skill | 说明 |
| --- | --- |
| defuddle | trae 版已删（2026-08-09）；agents/claude 用 kepano 版 |
| kami | workbuddy 实体 vs trae 软链+禁用（trae 用户手动禁用） |

## 软链接网络登记（删除实体前必查）

| 实体所在 | 被谁软链引用 | 数量 |
| --- | --- | --- |
| .agents/skills/lark-* | claude(27)、trae-ide(27) | 27 |
| .agents/skills/设计绘图组 | claude(excalidraw/mermaid/json-canvas/obsidian-*)、trae-ide(同) | ~10 |
| .agents/skills/find-docs/find-skills/grill-with-docs/harness-creator/hyperframes/neat-freak/orange-line-illustration | claude、trae-ide | 7 |
| .agents/skills/baoyu-design/huashu-design/kami | trae-ide（2026-08-09 实体→软链） | 3 |
| trae-ide 实体 77 | 无软链引用（自身为实体） | 0 |

**⚠️ 删除 .agents 实体前必查此表**——claude/trae-ide 靠软链访问共享层，实体删除 = 两平台技能丢失。

## 一键分发命令

```bash
SRC=<规范源副本路径>
for dst in ~/.pi/agent/skills ~/.workbuddy/skills ~/.codex/skills ~/.claude/skills ~/.trae-cn/skills; do
  rsync -a --delete "$SRC/" "$dst/<技能名>/"
done
```

## 一致性体检命令（2026-08-09 实测可用）

```bash
# 各平台 SKILL.md 版本对比
for d in ~/.pi/agent/skills ~/.agents/skills ~/.workbuddy/skills ~/.codex/skills ~/.claude/skills ~/.trae-cn/skills; do
  echo "$(basename $d): $(find $d -maxdepth 2 -name SKILL.md | wc -l | tr -d ' ') 技能"
done

# 特定技能跨平台 md5（找漂移）
S=grill-me
for d in ~/.pi/agent/skills ~/.workbuddy/skills ~/.codex/skills ~/.claude/skills ~/.trae-cn/skills; do
  [ -f "$d/$S/SKILL.md" ] && echo "  $d: $(md5 -q "$d/$S/SKILL.md" | cut -c1-8)"
done
```

## 上游版本对比（2026-08-09 体检结果）

| 技能 | 上游 | 状态 |
| --- | --- | --- |
| mattpocock 35 | mattpocock/skills | 🟢 全部最新 |
| guizang-ppt-skill | op7418 | 🟢 最新 |
| orange-line-illustration | orange2ai | 🟢 最新（更新于 08-09） |
| book2skill | kangarooking | 🟢 最新（更新于 08-09） |
| planning-with-files | mxyhi | 🟢 最新（恢复于 08-09） |
| defuddle (trae) | — | 已删（08-09） |
| obsidian-* / axton / ok-skills 系 | 各上游 | 🟢 最新 |

**无法 GitHub 对比**：lark-*27（lark-cli 分发）、trae marketplace 52（CLOUD）、本地自研（ljg-*/aihot/hv-analysis 等）

## 平台技能总量（2026-08-09）

| 平台 | 技能数 | 备注 |
| --- | --- | --- |
| pi | 92 | 41 实体 + 51 .agents 直读 |
| trae-ide | ~153 | 110 实体 + 43 软链（清理后） |
| claude | 77 | 36 实体 + 41 软链 |
| workbuddy | 55 | 全实体 |
| codex | 39 | 全实体 |
| trae-work | 2 | 1 实体 + router（VM 挂载读 IDE+共享层） |
