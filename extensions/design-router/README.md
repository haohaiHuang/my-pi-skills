# design-router — design-references 确定性能力 × Pi Extension

**定位**：把 design-references 的确定性层（registry 查询、机器化检查）从"模型读 markdown 后自己 grep"升级为 Pi extension 的确定性工具；Hallmark 完整规则在设计任务时注入上下文。

**关系**：`skills/design-references/` 是跨 6 平台共通真源（推理密集部分）；本 extension 是 **pi 专属增强壳**（确定性部分），互不取代。Hallmark 为上游技能（`~/.pi/agent/skills/hallmark/`），不 fork，机器化规则跟随其版本。

## 安装（分发）

```bash
# 从 my-pi-skills 分发（构建产物含 data/registry.json）
rsync -a --delete --exclude 'tests/' ~/my-pi-skills/extensions/design-router/ ~/.pi/agent/extensions/design-router/
# pi 内 /reload 或重启生效
```

## 工具

| 工具 | 作用 |
| --- | --- |
| `design_lookup <branch> <stage>` | 查 registry 三维索引（R/C/E/V × 主/次/兜底 + 退化链 + 来源）。分支 A1/A2/A3/B1/B2/B3/C1/C2/C3，环节 1-4 |
| `design_audit <target>` | 合并 Hallmark 机器化 gates（1/2/10/14/19/24/26/27/30/33/34/37/38a/39/40/41/46/47/50/51）+ 环节4 扫描 → 带 gate 号 punch list，只读 |
| `design_contrast <target>` | WCAG 2.1（主判）+ APCA 近似（参考）对比度扫描，支持 hex/rgb/hsl/oklch/一层 CSS 变量 |
| `hallmark_study_fetch <url>` | 抓取 HTML/CSS 提取 DNA 草稿（字体/色值/间距/结构信号）。DNA 判定由模型读 `hallmark references/study.md` |

## 注入（before_agent_start）

- **触发**：prompt 含设计意图（设计/落地页/landing/海报/hallmark/redesign/audit/study 等强词，或 2 个弱词组合）
- **内容**：完整 hallmark SKILL.md（四动词 + 六条纪律 + 组件/页面分流 + 流程）+ 工具提示
- **配置**：`config.json` `injectionMode: full | slim`（slim 只注入四动词 + 六条纪律，~2K tokens）
- **注入源**：`~/.pi/agent/skills/hallmark/SKILL.md`（与已装技能同源，不双份拷贝；hallmark 未装则静默跳过）

## 维护

```bash
# registry 数据：registry.md 是真源，改后重新生成（禁止手改 registry.json）
node extensions/design-router/scripts/build-registry.mjs

# 自检（无框架 assert，node 24 直接跑）
node extensions/design-router/tests/self-test.ts

# 集成验证
pi -p "调用 design_lookup 工具查询分支 A2 环节 1 的资源，总结返回"
pi -p "调用 design_audit 工具扫描 <含 slop 的 html>，汇报检出"
pi -p "帮我设计一个落地页，先回答你收到的 hallmark 纪律与可用工具"  # 验证注入
```

**上游跟随**：Hallmark 更新 → 复核 `checks/` 的 gate 号与 `slop-rules.json` 语义；design-references 更新 registry.md → 重跑 build-registry.mjs。

## 明确不做（边界）

- ❌ redesign 自动化、21 主题/宏结构生成（推理密集，留 skill）
- ❌ 全量 58 gates 机器化（视觉类 gate 6/8/28/29/31/32/35/36/44/45/52-54/56/57 留模型自查，audit 输出已注明）
- ❌ study 截图模式（第一版只做 URL；截图走 vision 工具）
- ❌ input 事件全自动路由（不抢 skill 的分支判断）

## 测试与验证状态

- ✅ 自检 8 项全过（registry 完整性 / typography / layout / a11y / copy / contrast / study 加载 / 触发词）
- ✅ 集成：`design_lookup`（A2×环节1 返回 3 资源+铁律）、`design_audit`（真实 slop 文件 13 项全部属实）、注入（LLM 引用 hallmark 纪律原文 + 工具清单 + 走 design-context gate 三问）
