# 设计工作流 — 归位映射（design-references × Hallmark 协同）

**流程外壳 = design-references 五环节**（编排层）。Hallmark 的资产按环节归位为**执行细节**，不是平行流程。本文件 + 下方 hallmark 完整 SKILL.md 一起生效；如果 hallmark 未安装，跳过其条目，按本文件骨架 + design-references skill 执行。

## 第一层 · 阶段判定（先判任务在流程哪个点，禁止无谓前滚全流程）

```
├─ 从零新建（无方向/无产物）→ 完整流程 0→4
├─ 有方向要落地（指定风格/已有 brief）→ 从环节 2/3 切入
├─ 产物已存在要审计/迭代（"这页面很丑/很怪/不协调/帮我看看/截图迭代"）→ 环节 4 快速通道 ★
│     └─ 视觉迭代读 references/ui-quickfix.md（方向锁+grep sibling），不走 0/1/2/3
├─ 有参考对象（"看这网站/截图风格"）→ hallmark study，不进设计流程
└─ 组件级微调 → 轻量：grep sibling + 复用 token，不触发流程
```

**判不出 → 按产物是否已存在兜底：已有产物→环节 4；无→完整流程。**

## 五环节 × 归位（执行细节，只在对应环节 read）

| 环节 | 动作 | 调用什么 | 产物 |
| --- | --- | --- | --- |
| **0 意图** | 一次问完（≤3 问）：格式/渠道/受众/硬约束 + 风格方向（含 Tone 极端：editorial · brutalist · soft · utilitarian · luxury · playful · technical · austere，"干净现代"不算） | 问询协议（覆盖 A/B/C 全分支） | Brief |
| **1 调研** | **硬步骤①：先调 `design_route <需求特征>`** 定位风格桶组合（主桶必查+次桶按需，反同质化定位），**再调 `design_research <branch> <query>`** 取候选池（本地台账 → refero 探测 → web 搜索，带证据来源）。**硬步骤②：对最终选中的 2-3 个候选逐一验证（双引擎退化链：先 `hallmark_study_fetch <url>` 快验；需精确 token 直引 / 站点 JS 重或 SPA / 快验失败时升级 `dembrandt <url> --design-md --save-output`，真浏览器渲染产精确计算值 + 规范 DESIGN.md）**；验证不了的候选标注"未验证"（证据等级降级为属性级借用，禁止当直引参考）。然后每个候选标注形态×气质×行业×防重四维 + 来源桶 + 理由，**调 `design_diversity <c1> <c2> <c3>` 机器校验差异度（≥2 桶、色相/字体互异），PASS 后展示给用户选（强制）**；用户 go ahead 才静默。**禁止仅凭模型内建知识直接选风格** | 真实产品参考（用户参考库/refero/web 搜索）+ hallmark_study_fetch / dembrandt 验证 + Hallmark 形态库（21 宏结构）+ 气质库（4 genre/21 theme） | 风格候选（带证据） |
| **2 约束** | 候选转译成 ≤10 条可校验约束，**每条标注来源**（参考 DESIGN.md 哪条 / Kami 哪条不变量 / hallmark 哪条 anti-pattern） | Kami 骨架（常驻）+ 选定参考 + **hallmark anti-patterns 禁忌前置转译**（禁默认字体/渐变文字/emoji 图标/编造指标/假 chrome/标题斜体/transition-all）+ genre 允许禁止清单；有选定候选时用 Hallmark theme/genre 落 token（var(--x) 体系） | 约束集 |
| **3 产出** | 严格按约束集；产出前跑 pre-emit 六轴自评（Philosophy/Hierarchy/Execution/Specificity/Restraint/Variety，<3 分回炉）；CSS 顶部打戳 | E 工具（kami/huashu/gpt-image-2/guizang-ppt…）+ Hallmark build 纪律（macrostructures/组件原型/enrichment 按需读） | 产物 |
| **4 校验** | 四段全跑：①机器层 `design_audit`（含动效 EM-* 子集）②品牌层 Kami 三查 ③视觉层 hallmark 58 gates（视觉类按 slop-test.md 自查）+ 动效视觉自查（频率档/目的命名/慢放检查）④UX 层 design-qa-checklist。任一不达标 → 回环节 2 改约束，不打补丁 | design_audit / Kami 三查 / slop-test.md / design-qa-checklist | 达标/回炉 |

## 选择裁决（优先级）

**用户显式指令 > 参考驱动（真实产品优先）> Hallmark 形态/气质库 > catalog 静默兜底**（仅用户 go ahead）。

- 用户指定了风格/参考 → 萃取路径，Hallmark 进 studied-DNA / custom（不用 catalog）
- 参考库没货 → 才轮到 Hallmark 组合候选（形态×气质，如 "Bento × editorial"）
- 用户完全放权 → 静默选，但要在回复开头声明选了什么的推断

## 去 AI 味 = 两段式

- **前置**（环节 2）：hallmark anti-patterns 转译进约束集 —— 产出时就被绑住，不是产出后再打回
- **后置**（环节 4）：slop-test 58 gates 验收 —— 机器部分走 `design_audit`，视觉部分模型自查

## 细节级 craft 约束（interfaces.dev cheat-sheet 精选 + emilkowalski/skills 动效原则，环节 2 转译，机器子集 CS-*/EM-* 已进 audit）

- **Typography**：只用 .woff2；标题 `text-wrap: balance`、描述 `pretty`；`-webkit-font-smoothing: antialiased` 写根元素一次；自然大小写存储 + `text-transform` 控制；智能标点（弯引号/em dash/省略号，禁直引号）；`font-variant-numeric: tabular-nums` 用于变化数字/表格
- **Colors**：**语义 token vs primitive**（用 `--color-text-secondary` 不用 `--blue-500`）；**禁按外观/首次用途命名 token**（`--color-accent-solid` 非 `--color-blue-button`）；**禁跨角色复用 token**；对比度按元素实际渲染背景算；渐变插值空间 `in oklab/oklch`
- **Animation · 决策**（先于代码，频率分级定生死）：100+/天（键盘触发/命令面板）禁动画，tens/天仅近不可感知，occasional 标准动画，rare/首体验才有 delight 预算；目的六词能命名才做（Feedback/Spatial consistency/State indication/Preventing jarring change/Explanation/仅 rare 允许 Delight），说不出目的就不动
- **Animation · 数值**：缓动决策序——进入/退出→ease-out、屏幕内移动/变形→ease-in-out、hover/变色→ease、常速循环→linear、默认 ease-out、**UI 禁 ease-in**；内置曲线太弱，用强曲线 `--ease-out: cubic-bezier(0.23,1,0.32,1)`、`--ease-in-out: cubic-bezier(0.77,0,0.175,1)`（不手搓，从 easing.dev/easings.co 取）；时长表——按压 100–160ms、tooltip 125–200ms、dropdown 150–250ms、modal/drawer 200–500ms、**UI 一律 <300ms**
- **Animation · 物理感**：禁 scale(0) 入场（→scale(0.9–0.97)+opacity:0，现实世界没有凭空出现）；弹层 transform-origin 在触发器（modal 豁免居中）；按压 scale(0.95–0.98)+`transition: transform 160ms ease-out`；弹簧 bounce 0.1–0.3 仅 drag/playful；不对称时序——用户决策处慢、系统响应处快
- **Animation · 实现**：只动 transform/opacity（clip-path 为第 4 豁免，height 仅 accordion）；高频触发用 transition 非 keyframes（可中断重定向）；退出与进入对称（toast 从哪来从哪走）；禁 `transition: all`；Motion 用完整 transform 字符串（x/y/scale 快捷属性不硬件加速）；translate 百分比相对自身尺寸；stagger 30–80ms 不阻塞交互；图标切换 cross-fade；切主题时禁用全部过渡；`will-change` 只用于 transform/opacity/filter
- **Animation · a11y**：`prefers-reduced-motion: reduce` 给"更少更缓"而非归零（留 opacity 去位移）；hover 动效包 `@media (hover:hover) and (pointer:fine)`；velocity 判定滑动手势（>~0.11 即 dismiss）
- **A11y**：hit-area 24px / touch 44px / desktop 40px；hover 样式包 `@media (hover: hover)`；`prefers-reduced-motion: no-preference` 正向包裹动效；`role="status"` vs `role="alert"`；状态变化禁颜色单通道；skip-to-content；`tabindex` 只用 0/-1
- **Layout**：组间距 ≥ 组内间距 2 倍；逻辑属性（margin-inline-start）；文本容器不设固定宽高
- **Writing**：按钮以动词开头；确认按钮重复后果；每流程一词（Continue/Next 二选一）；链接描述目的地（"Read docs" 非 "Click here"）；sentence case 统一；toggle 用开启状态命名（"Send read receipts"）；empty state 给下一步动作；称呼用户 "you" 非 "the user"
