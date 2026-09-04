# design-router — design-references 确定性能力 × Pi Extension

**定位**：把 design-references 的确定性层（registry 查询、机器化检查）从"模型读 markdown 后自己 grep"升级为 Pi extension 的确定性工具；Hallmark 完整规则在设计任务时注入上下文。

**关系**：`skills/design-references/` 是跨 6 平台共通真源（推理密集部分）；本 extension 是 **pi 专属增强壳**（确定性部分），互不取代。Hallmark 为上游技能（`~/.pi/agent/skills/hallmark/`），不 fork，机器化规则跟随其版本。

## 安装（一键脚本）

```bash
# 默认：装 pi 平台（extension + 自动补 design-references skill）
./install-design-router.sh

# 同时安装 hallmark（第三方上游，需显式确认）
./install-design-router.sh --with-hallmark

# design-references 分发到全部已登记平台（workbuddy/codex/claude/trae-ide/trae-work）
./install-design-router.sh --all-platforms
```

**依赖策略**（讨论结论）：

| 依赖 | 性质 | 安装行为 |
| --- | --- | --- |
| extension 本体 | 必装 | 无条件分发；4 工具独立工作，不依赖任何 skill |
| design-references skill | 自己的资产（共通层） | 缺则**自动补装**（真身装共享层 `~/.agents/skills/` + pi 软链，与 DSH 共读，避免同名冲突） |
| hallmark skill | 第三方上游（nutlope/hallmark） | **只检测提示**，装需 `--with-hallmark`（同样装共享层 + pi 软链） |

版本配套：`data/manifest.json` 记录 extension 版本 / 转译自的 hallmark 规则版本 / design-references 源 / registry 生成日期；`/design-router status` 显示实际 hallmark 版本与转译源是否一致（不一致提示复核 checks）。

## 工具

| 工具 | 作用 |
| --- | --- |
| `design_research <branch> <query>` | **环节 1 必用**：确定性调研退化链（本地台账 → refero 网站 → tvly web 搜索），候选带证据来源，禁止内建知识冒充 |
| `design_route <需求特征>` | **环节 1 反同质化第一步**：需求特征 → 推荐风格桶组合（主桶必查+次桶按需）+ 各桶代表资源与桶健康（🟢/🟡/🔴，空桶带查询指引），差质源自动降权 |
| `design_lookup <branch> <stage>` | 查 registry 三维索引（R/C/E/V × 主/次/兜底 + 退化链 + 来源，输出标注风格桶+质量等级，差质沉底）。分支 A1/A2/A3/B1/B2/B3/C1/C2/C3，环节 1-4 |
| `design_diversity <c1> <c2> <c3>` | **环节 1 候选展示前必调**：3 候选差异度机器检查（色相族/字体气质/来源桶），PASS 才展示，FAIL 回炉（反同质化） |
| `design_quality report\|query` | **环节 4 收尾记录 / 环节 1 查询**：客观质量信号（提取成败/未验证/回炉/可达性），本地 `~/.pi/design-router-quality.json` 不入 git；禁以用户审美打分，差质源下次自动降权 |
| `design_audit <target>` | 合并 Hallmark 机器化 gates（1/2/10/14/19/24/26/27/30/33/34/37/38a/39/40/41/46/47/50/51）+ interfaces CS-* 8 条 + 环节4 扫描 + kill-ai-slop KS-* 转译子集（cozy 暖洗/语义彩虹/单色状态框/衬线乱入/AI 文案腔）+ 继承链对比度 → 带 gate 号 punch list，只读 |
| `design_contrast <target>` | WCAG 2.1（主判）+ APCA 近似（参考）对比度扫描，支持 hex/rgb/hsl/oklch/一层 CSS 变量 + 继承链配对（选择器包含匹配） |
| `hallmark_study_fetch <url>` | 抓取 HTML/CSS 提取 DNA 草稿（字体/色值/间距/结构信号）。DNA 判定由模型读 `hallmark references/study.md` |

## 注入（before_agent_start）

- **触发**：prompt 含设计意图（设计/落地页/landing/海报/hallmark/redesign/audit/study 等强词，或 2 个弱词组合）
- **内容**：**归位映射（inject-map.md）** + hallmark 完整 SKILL.md（已装时）——五环节为壳，Hallmark 按环节归位为执行细节，不再平行注入两套流程
- **hallmark 未装**：只注入归位映射 + 一行说明（机器校验工具仍可用）；TOOL_NOTE 的 references 提示按是否安装条件化
- **配置**：`config.json` `injectionMode: full | slim`（slim 时 hallmark 部分只注入四动词 + 六条纪律）
- **注入源**：inject-map.md（本目录）+ `~/.pi/agent/skills/hallmark/SKILL.md`（与已装技能同源，不双份拷贝）

## 维护

```bash
# registry 数据：registry.md 是真源，改后重新生成（禁止手改 registry.json）
node extensions/design-router/scripts/build-registry.mjs

# 自检（无框架 assert，node 24 直接跑）
node extensions/design-router/tests/self-test.ts

# 集成验证
pi -p "调用 design_lookup 工具查询分支 A2 环节 1 的资源，总结返回"
pi -p "调用 design_audit 工具扫描 <含 slop 的 html>，汇报检出"
pi -p "帮我设计一个落地页，先回答你收到的设计规则骨架与可用工具"  # 验证注入（归位映射）
```

**上游跟随**：Hallmark 更新 → 复核 `checks/` 的 gate 号与 manifest 的 `hallmarkRuleVersion`；design-references 更新 registry.md → 重跑 build-registry.mjs（同时更新 manifest 的 source/registryGenerated）。

## 明确不做（边界）

- ❌ redesign 自动化、21 主题/宏结构生成（推理密集，留 skill）
- ❌ 全量 58 gates 机器化（视觉类 gate 6/8/28/29/31/32/35/36/44/45/52-54/56/57 留模型自查，audit 输出已注明）
- ❌ study 截图模式（第一版只做 URL；截图走 vision 工具）
- ❌ input 事件全自动路由（不抢 skill 的分支判断）

## 测试与验证状态

- ✅ 自检 8 项全过（registry 完整性 / typography / layout / a11y / copy / contrast / study 加载 / 触发词）
- ✅ 集成：`design_lookup`（A2×环节1 返回 3 资源+铁律）、`design_audit`（真实 slop 文件 13 项全部属实）、注入（LLM 引用 hallmark 纪律原文 + 工具清单 + 走 design-context gate 三问）
