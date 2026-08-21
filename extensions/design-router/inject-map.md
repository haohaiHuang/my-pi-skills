# 设计工作流 — 归位映射（design-references × Hallmark 协同）

**流程外壳 = design-references 五环节**（编排层）。Hallmark 的资产按环节归位为**执行细节**，不是平行流程。本文件 + 下方 hallmark 完整 SKILL.md 一起生效；如果 hallmark 未安装，跳过其条目，按本文件骨架 + design-references skill 执行。

## 五环节 × 归位

| 环节 | 动作 | 调用什么 | 产物 |
| --- | --- | --- | --- |
| **0 意图** | 一次问完（≤3 问）：格式/渠道/受众/硬约束 + 风格方向（含 Tone 极端：editorial · brutalist · soft · utilitarian · luxury · playful · technical · austere，"干净现代"不算） | 问询协议（覆盖 A/B/C 全分支） | Brief |
| **1 调研** | **硬步骤：先调用 `design_research <branch> <query>`** 取候选池（本地台账 → refero 探测 → web 搜索，带证据来源）。然后筛 2-3 个候选，每个标注形态×气质×行业×防重四维 + 理由，**展示给用户选（强制）**；用户 go ahead 才静默。**禁止仅凭模型内建知识直接选风格**——候选必须来自 design_research 输出 | 真实产品参考（用户参考库/refero/web 搜索）+ Hallmark 形态库（21 宏结构）+ 气质库（4 genre/21 theme） | 风格候选（带证据） |
| **2 约束** | 候选转译成 ≤10 条可校验约束，**每条标注来源**（参考 DESIGN.md 哪条 / Kami 哪条不变量 / hallmark 哪条 anti-pattern） | Kami 骨架（常驻）+ 选定参考 + **hallmark anti-patterns 禁忌前置转译**（禁默认字体/渐变文字/emoji 图标/编造指标/假 chrome/标题斜体/transition-all）+ genre 允许禁止清单；有选定候选时用 Hallmark theme/genre 落 token（var(--x) 体系） | 约束集 |
| **3 产出** | 严格按约束集；产出前跑 pre-emit 六轴自评（Philosophy/Hierarchy/Execution/Specificity/Restraint/Variety，<3 分回炉）；CSS 顶部打戳 | E 工具（kami/huashu/gpt-image-2/guizang-ppt…）+ Hallmark build 纪律（macrostructures/组件原型/enrichment 按需读） | 产物 |
| **4 校验** | 四段全跑：①机器层 `design_audit` ②品牌层 Kami 三查 ③视觉层 hallmark 58 gates（视觉类按 slop-test.md 自查）④UX 层 design-qa-checklist。任一不达标 → 回环节 2 改约束，不打补丁 | design_audit / Kami 三查 / slop-test.md / design-qa-checklist | 达标/回炉 |

## 选择裁决（优先级）

**用户显式指令 > 参考驱动（真实产品优先）> Hallmark 形态/气质库 > catalog 静默兜底**（仅用户 go ahead）。

- 用户指定了风格/参考 → 萃取路径，Hallmark 进 studied-DNA / custom（不用 catalog）
- 参考库没货 → 才轮到 Hallmark 组合候选（形态×气质，如 "Bento × editorial"）
- 用户完全放权 → 静默选，但要在回复开头声明选了什么的推断

## 去 AI 味 = 两段式

- **前置**（环节 2）：hallmark anti-patterns 转译进约束集 —— 产出时就被绑住，不是产出后再打回
- **后置**（环节 4）：slop-test 58 gates 验收 —— 机器部分走 `design_audit`，视觉部分模型自查
