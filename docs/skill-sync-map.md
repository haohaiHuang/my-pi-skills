# Skill 同步地图（skill-sync-map）— 多平台技能分发方法论

> **本文件是通用模板**：记录"多平台技能"的规范源和分发方法。复制到本机 `~/Documents/skill-sync-map.md` 后填入实际数据；各机器的实际技能清单另存私有仓库（见 `inventory.example.md`）。

## 平台目录约定（按实际环境调整）

| 平台 | 目录（示例） |
| --- | --- |
| pi | `~/.pi/agent/skills`（+ 直读共享层 `~/.agents/skills`） |
| workbuddy | `~/.workbuddy/skills` |
| codex | `~/.codex/skills` |
| claude | `~/.claude/skills` |
| trae-ide | `~/.trae-cn/skills` |
| trae-work | `~/.trae/skills` 或 `~/Library/Application Support/TRAE SOLO CN/ModularData/ai-agent/skills`（按实际） |

## 规范源约定

- **GITHUB** = 有 GitHub 上游仓库，以仓库为准（更新：clone → 分发）
- **指定副本** = 无上游仓库，以指定平台目录的副本为规范源
- **LOCALIZED** = 故意差异（双语/适配版），不同步
- **CLOUD** = Trae marketplace 云端分发，随 Trae 账号同步

## 重复技能清单（示例行，复制后填入实际）

| skill | 副本数 | 平台 | 规范源 |
| --- | --- | --- | --- |
| `<技能名>` | `<n>` | `<平台列表>` | `<GITHUB: owner/repo | 指定副本: 位置 | 自研>` |

## 软链接网络（有共享层时注意）

若存在共享层（如 `~/.agents/skills` 为实体、多平台软链引用），**删除实体前必查**谁引用它——实体删除 = 各平台技能丢失。

| 实体所在 | 被谁软链引用 | 数量 |
| --- | --- | --- |
| `<目录>` | `<平台>(<数量>)` | `<n>` |

## 一键分发命令

```bash
SRC=<规范源副本路径>
for dst in ~/.pi/agent/skills ~/.workbuddy/skills ~/.codex/skills ~/.claude/skills ~/.trae-cn/skills; do
  rsync -a --delete "$SRC/" "$dst/<技能名>/"
done
```

## 一致性体检命令

```bash
# 各平台技能数
for d in ~/.pi/agent/skills ~/.agents/skills ~/.workbuddy/skills ~/.codex/skills ~/.claude/skills ~/.trae-cn/skills; do
  echo "$(basename $d): $(find $d -maxdepth 2 -name SKILL.md | wc -l | tr -d ' ') 技能"
done

# 特定技能跨平台 md5（找漂移）
S=<技能名>
for d in ~/.pi/agent/skills ~/.workbuddy/skills ~/.codex/skills ~/.claude/skills ~/.trae-cn/skills; do
  [ -f "$d/$S/SKILL.md" ] && echo "  $d: $(md5 -q "$d/$S/SKILL.md" | cut -c1-8)"
done
```

> 机器技能清单的**自动生成**：安装 skill-router 后，`bash <skill-router>/scripts/catalog.sh matrix` 输出技能×平台矩阵；`catalog.sh all` 输出各平台技能数。生成结果存入私有仓库。
