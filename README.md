# my-pi-skills

本机自研、无上游仓库的 pi skills 备份。私有仓库，换电脑用。

## 结构

```
skills/                  → 自研 skill 文件夹（每个含 SKILL.md）
  design-references/     设计参考索引
  skill-router/          技能台账管理器（scripts/catalog.sh 运行时扫描）
resources/design-references.md   ← design-references 的素材库（SKILL.md 只是指针）
docs/skill-sync-map.md           ← skill-router 的规范源台账
```

> 其余 skill（mattpocock、lark-*、obsidian 系等）有 GitHub 上游或由
> lark-cli 分发，换机重装即有，不进本仓库。

## 新电脑激活（3 步）

1. 装好 pi 后 clone：
   `git clone git@github.com:haohaiHuang/my-pi-skills.git ~/my-pi-skills`
2. 把自研 skill 放回 pi 的读取目录：
   `cp -R ~/my-pi-skills/skills/* ~/.pi/agent/skills/`
3. 放回两个外部资源文件（必须，否则 skill 残废）：
   `mkdir -p ~/resources ~/Documents && cp ~/my-pi-skills/resources/design-references.md ~/resources/ && cp ~/my-pi-skills/docs/skill-sync-map.md ~/Documents/`

验证：在 pi 里问「查一下技能清单」应能触发 skill-router。

## 新增 skill

自研新 skill 就丢进 `skills/` 目录，commit push 即可；依赖的外部文件
放进 `resources/` 并在本 README 结构表里登记，方便换机时记得放回。

## 注意

- 本仓库只放**无上游的自研件**。带 API key 的配置文件（~/.pi/agent/mcp.json、
  models.json）一律不进 git，换机时手动拷或重新配置。
