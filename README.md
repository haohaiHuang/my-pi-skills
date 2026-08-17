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

## 注意

- 本仓库只放**无上游的自研件**；带 API key 的配置文件（models.json、auth.json、mcp.json 等）**一律不进 git**，各机器自行配置
- 机器相关的技能安装清单**不放本仓库**——存私有仓库（见 `docs/inventory.example.md`）
