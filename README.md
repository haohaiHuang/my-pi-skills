# my-pi-skills

自研的 **Agent Skills** 集合（遵循 [Agent Skills 标准](https://agentskills.io/specification)），无上游仓库，通过本仓库分发与同步。

## 包含技能

| 技能 | 说明 |
| --- | --- |
| `design-references` | 设计参考索引：动手前先查 `~/resources/design-references.md` 素材台账（设计系统 / AI 范式 / 组件 / 动效 / 图标字体纹理） |
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

## 安装

1. Clone 本仓库
2. 把 skill 复制到 agent 的 skills 目录（示例：pi）：
   ```bash
   cp -R skills/* ~/.pi/agent/skills/
   ```
   （其他平台：`~/.agents/skills`、`~/.workbuddy/skills`、`~/.codex/skills` 等）
3. 放回外部资源（必须，否则对应 skill 残废）：
   ```bash
   mkdir -p ~/resources ~/Documents
   cp resources/design-references.md ~/resources/
   cp docs/skill-sync-map.md ~/Documents/
   ```
4. vision-cli 加入 PATH：
   ```bash
   cp resources/vision-cli ~/.local/bin/ && chmod +x ~/.local/bin/vision-cli
   ```

## 新增技能

自研 skill 丢进 `skills/`，外部依赖放 `resources/` 并在上方结构表登记，然后 commit push。

## 注意

- 本仓库只放**无上游的自研件**；带 API key 的配置文件（models.json、auth.json、mcp.json 等）**一律不进 git**，各机器自行配置
- 机器相关的技能安装清单**不放本仓库**——存私有仓库（见 `docs/inventory.example.md`）
