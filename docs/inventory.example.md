# 技能清单模板（per-machine inventory）

> 每台电脑一份，存**私有仓库**（本仓库的对应私有仓，如 `my-skills-inventory`）。
> 生成方式（装好 skill-router 后）：
>
> ```bash
> bash <skill-router>/scripts/catalog.sh matrix > machine-<hostname>.md
> bash <skill-router>/scripts/catalog.sh all  >> machine-<hostname>.md
> ```
>
> 生成后补上机器名、日期、备注，commit push 到私有仓库。

# 机器：<hostname>

- **生成时间**：<YYYY-MM-DD>
- **备注**：<这台机器的用途、特殊配置等>

## 平台技能总数（catalog.sh all）

```
<粘贴 catalog.sh all 的输出>
```

## 技能 × 平台矩阵（catalog.sh matrix）

```
<粘贴 catalog.sh matrix 的输出>
```

## 特殊说明

- <非标准安装、本地定制、待办清理项等>
