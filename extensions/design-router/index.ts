/**
 * design-router — design-references 确定性能力 × Pi extension
 *
 * 定位：把 design-references 的确定性层（registry 查询、机器化检查）从"模型读
 * markdown 后自己 grep"升级为确定性工具；Hallmark 完整规则在设计任务时注入上下文。
 *
 * 工具：
 *   design_lookup       — registry 三维索引查询（分支×环节 → 资源+退化链+来源）
 *   design_audit        — 合并 Hallmark 可机器化 gates + design-references 环节4 扫描
 *   design_contrast     — APCA/WCAG 对比度计算（gate 40-41）
 *   hallmark_study_fetch— URL 抓取 → DNA 草稿（字体/色值/间距/结构信号）
 *
 * 事件：before_agent_start 检测设计任务 → 注入 hallmark SKILL.md（full/slim 可配）
 * 命令：/design-router status | reload
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type { AuditFile, Finding } from "./checks/types.ts";
import { runTypographyChecks } from "./checks/typography.ts";
import { runLayoutChecks } from "./checks/layout.ts";
import { runA11yChecks } from "./checks/a11y.ts";
import { runCopyChecks } from "./checks/copy.ts";
import { runContrastChecks } from "./checks/contrast.ts";
import { runCheatChecks } from "./checks/cheat.ts";
import { fetchDna } from "./study.ts";

const execFileAsync = promisify(execFile);

declare const __dirname: string | undefined;

const baseDir =
  typeof __dirname === "string" && __dirname ? __dirname : dirname(fileURLToPath(import.meta.url));

// ---------- 配置 ----------
interface Config {
  injectionMode: "full" | "slim";
}
const DEFAULT_CONFIG: Config = { injectionMode: "full" };
function loadConfig(): Config {
  try {
    const raw = JSON.parse(readFileSync(join(baseDir, "config.json"), "utf8"));
    return { ...DEFAULT_CONFIG, ...raw };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

// ---------- registry 加载 ----------
interface RegistryResource {
  name: string;
  role: string;
  form: string;
  level: string;
  scenarios: string;
  fallback: string;
  source: string;
  slug?: string;
}
interface Registry {
  resources: RegistryResource[];
  routes: Record<string, Record<string, string[]>>;
  logoExtra: Record<string, string[]>;
  hallmarkExtra?: Record<string, string[]>;
  cheatExtra?: Record<string, string[]>;
}
function loadRegistry(): Registry {
  try {
    return JSON.parse(readFileSync(join(baseDir, "data/registry.json"), "utf8"));
  } catch {
    return { resources: [], routes: {}, logoExtra: {} };
  }
}

// ---------- Hallmark 注入源 ----------
const HALLMARK_SKILL = join(process.env.HOME || "", ".pi/agent/skills/hallmark/SKILL.md");
function loadHallmarkSkill(): string {
  try {
    return readFileSync(HALLMARK_SKILL, "utf8");
  } catch {
    return "";
  }
}
function loadInjectMap(): string {
  try {
    return readFileSync(join(baseDir, "inject-map.md"), "utf8");
  } catch {
    return "";
  }
}
function slimHallmark(full: string): string {
  const cut = full.indexOf("## Design flow (default)");
  const body = cut > 0 ? full.slice(0, cut) : full.slice(0, 6000);
  return body + "\n\n（slim 模式：只注入四动词表 + 跨动词纪律；完整流程细节按需 read hallmark references/）";
}

function buildInjection(config: Config): string {
  const map = loadInjectMap();
  const hallmark = loadHallmarkSkill();
  const parts: string[] = [];
  if (map) parts.push(map);
  if (hallmark) {
    parts.push(
      "\n---\n\n# Hallmark SKILL.md（完整规则，供执行层遵循）\n\n" +
        (config.injectionMode === "slim" ? slimHallmark(hallmark) : hallmark),
    );
  }
  if (!hallmark) {
    parts.push(
      "\n---\n\n[design-router] hallmark skill 未安装（软依赖）：跳过其规则，按上方归位映射 + design-references skill 执行；机器校验仍可用 design_audit / design_contrast。",
    );
  }
  return parts.join("\n");
}

const TOOL_NOTE = `
[design-router] 本会话可用确定性设计工具，按需调用：
· design_research <branch> <query> — 【环节 1 必用】确定性调研：本地台账 → refero 探测 → web 搜索，返回带证据来源的真实候选池，禁止仅凭内建知识选风格
· design_lookup <branch> <stage> — 查设计资源注册表（R/C/E/V 三维索引 + 退化链 + 来源）
· design_audit <target> — 跑 Hallmark 机器化 slop gates + 环节4 扫描，返回带 gate 号的 punch list（只读）
· design_contrast <target> — APCA/WCAG 对比度计算
· hallmark_study_fetch <url> — 抓取页面提取 DNA 草稿（字体/色值/间距/结构信号）
`;

function toolNoteWithDetails(): string {
  const hallmark = loadHallmarkSkill();
  const detailLine = hallmark
    ? "完整细节按需 read ~/.pi/agent/skills/hallmark/references/（slop-test.md / anti-patterns.md / study.md 等）"
    : "规则细节按 design-references skill（references/registry.md + workflow.md）执行";
  return TOOL_NOTE + detailLine + "\n";
}

// ---------- 设计任务检测 ----------
const STRONG_HINTS = [
  "设计", "落地页", "landing", "海报", "hallmark", "redesign", "官网", "封面", "banner",
  "首页", "登录页", "设计系统", "配色", "排版", "界面", "做个小程序", "做个app", "做个 app",
  "幻灯片", "ppt", "slides", "deck", "原型", "mockup", "wireframe", "组件库", "改版",
];
const WEAK_HINTS = ["audit", "study", "页面", "风格", "参考", "美化", "升级", "ui"];

function isDesignTask(prompt: string): boolean {
  const p = prompt.toLowerCase();
  if (STRONG_HINTS.some((h) => p.includes(h.toLowerCase()))) return true;
  if (/\bapp\b|\bui\b|\bdesign\b/i.test(p)) return true;
  const weakHits = WEAK_HINTS.filter((h) => p.includes(h.toLowerCase()));
  return weakHits.length >= 2;
}

// ---------- audit 文件收集 ----------
const AUDIT_EXTS = [".html", ".htm", ".css", ".scss", ".js", ".jsx", ".ts", ".tsx", ".vue"];
function collectFiles(target: string): string[] {
  const abs = resolve(target);
  const out: string[] = [];
  const walk = (p: string) => {
    let st;
    try {
      st = statSync(p);
    } catch {
      return;
    }
    if (st.isDirectory()) {
      for (const e of readdirSync(p)) {
        if (e === "node_modules" || e.startsWith(".")) continue;
        walk(join(p, e));
      }
    } else if (AUDIT_EXTS.includes(extname(p).toLowerCase())) {
      out.push(p);
    }
  };
  walk(abs);
  return out;
}

function readAuditFiles(paths: string[]): AuditFile[] {
  return paths
    .map((p) => {
      try {
        const content = readFileSync(p, "utf8");
        const ext = extname(p).toLowerCase();
        const kind = ext === ".html" || ext === ".htm" ? "html" : ext === ".css" || ext === ".scss" ? "css" : "other";
        return { path: p, content, kind };
      } catch {
        return null;
      }
    })
    .filter((f): f is AuditFile => f !== null);
}

const VISUAL_GATES_NOTE =
  "以下 gates 需视觉/上下文判定，机器无法覆盖，请模型按 hallmark references/slop-test.md 自查：6（hero 居中）、8（结构指纹）、28/29/31（enrichment）、32（diversification knob）、35/36（装饰/基线）、44/45（hero 折叠/无意义装饰）、52-54（响应式 section-head/radio/eyebrow 列）、56（sticky 重叠）、57（studied-DNA 丢弃）。";

function formatFindings(findings: Finding[], showVisualNote: boolean): string {
  if (findings.length === 0) {
    return "✅ 机器化检查通过：未检出文本可判定的 slop 项。\n\n" + (showVisualNote ? VISUAL_GATES_NOTE : "");
  }
  const bySeverity = { error: 0, warn: 0, info: 0 };
  for (const f of findings) bySeverity[f.severity]++;
  const lines = [`检出 ${findings.length} 项（error ${bySeverity.error} / warn ${bySeverity.warn} / info ${bySeverity.info}）：`, ""];
  const sorted = [...findings].sort((a, b) => (a.severity === "error" ? -1 : a.severity === "warn" ? 0 : 1) - (b.severity === "error" ? -1 : b.severity === "warn" ? 0 : 1) || a.gate.localeCompare(b.gate));
  for (const f of sorted) {
    const icon = f.severity === "error" ? "🔴" : f.severity === "warn" ? "🟡" : "🔵";
    lines.push(`${icon} [gate ${f.gate}] ${f.message}  ${f.location}`);
  }
  lines.push("", "机器只覆盖文本可判定项；视觉/上下文类见下：", VISUAL_GATES_NOTE);
  return lines.join("\n");
}

// ---------- design_research: 环节 1 确定性调研 ----------
const LEDGER = join(process.env.HOME || "", "resources/design-references.md");

interface ResearchLayer {
  name: string;
  evidence: string;
  result: string;
}

/** 本地台账：按关键词抽条目（按 ## 分类分组，只返回命中行附近内容） */
function localLedgerLayer(query: string): ResearchLayer {
  try {
    const text = readFileSync(LEDGER, "utf8");
    const lines = text.split("\n");
    const hits: string[] = [];
    let category = "";
    for (const line of lines) {
      if (/^## /.test(line)) category = line.replace(/^## /, "").trim();
      if (/^### /.test(line) && line.toLowerCase().includes(query.toLowerCase())) {
        const next = lines[lines.indexOf(line) + 1] || "";
        hits.push(`- [${category}] ${line.replace(/^### /, "").trim()} ${next.trim().slice(0, 80)}`);
      }
    }
    return {
      name: "本地台账（用户精选资产）",
      evidence: LEDGER,
      result: hits.length ? hits.slice(0, 6).join("\n") : "（无关键词命中条目；可人工查看全文按需调用）",
    };
  } catch {
    return { name: "本地台账（用户精选资产）", evidence: LEDGER, result: "（台账不存在）" };
  }
}

/** refero 层：网页浏览 styles.refero.design（免费；SPA 需浏览器，pi 用 ego-browser） */
async function referoWebLayer(): Promise<ResearchLayer> {
  return {
    name: "refero Styles 网站（真实产品设计系统，免费网页版）",
    evidence: "https://styles.refero.design/",
    result:
      "✅ 可浏览（SPA，需浏览器——pi 平台用 ego-browser 打开 styles.refero.design 搜同品类产品/风格词）。" +
      "浏览到的产品设计系统信息转译成约束；浏览器不可用时降级到 web 搜索层。",
  };
}

/** web 搜索层：tvly CLI（tavily） */
async function webSearchLayer(query: string): Promise<ResearchLayer> {
  const base = { name: "web 搜索（tavily）", evidence: "tvly CLI" };
  try {
    const { stdout } = await execFileAsync("tvly", ["search", query, "--max-results", "6", "--depth", "basic"], { timeout: 20000 });
    return { ...base, result: stdout.trim().slice(0, 3000) || "（无结果）" };
  } catch {
    return { ...base, result: "❌ tvly 不可用。所有外部层失败——才允许声明'无真实参考可查'并按 Kami 骨架执行。" };
  }
}

// ======================================================================
export default function (pi: ExtensionAPI) {
  const config = loadConfig();

  // ---- design_research - 环节 1 确定性调研 ----
  pi.registerTool({
    name: "design_research",
    label: "Design Research",
    description:
      "环节 1 调研的确定性工具（设计任务必用）：自动走退化链（本地台账 → refero MCP 探测 → web 搜索）返回真实候选池 + 证据来源。规则：设计任务的风格候选必须来自本工具输出，禁止仅凭模型内建知识直接选风格；本工具所有外部层都失败时，才允许声明'无真实参考可查'并按 Kami 骨架执行。",
    parameters: Type.Object({
      branch: Type.String({ description: "场景分支：A1(APP)/A2(网页)/A3(Mac)/B1(海报)/B2(杂志插图)/B3(PPT)/C1(组件素材)/C2(动效)/C3(文档排版)" }),
      query: Type.String({ description: "调研主题：产品/行业/品类描述（如 'API 可观测性 SaaS'、'咖啡品牌官网'、'在线课程平台'），web 层会原样用于搜索" }),
    }),
    async execute(_toolCallId, params: { branch: string; query: string }, signal, _onUpdate, _ctx) {
      const query = params.query.trim();
      const layers: ResearchLayer[] = [localLedgerLayer(query)];
      try {
        layers.push(await referoWebLayer());
      } catch {
        layers.push({ name: "refero Styles 网站", evidence: "https://styles.refero.design/", result: "❌ 层异常" });
      }
      try {
        layers.push(await webSearchLayer(`${query} product website`));
      } catch {
        layers.push({ name: "web 搜索（tavily）", evidence: "tvly CLI", result: "❌ 搜索异常" });
      }
      const lines = [
        `## design_research 候选池（${params.branch}）`,
        "",
        "**规则**：候选必须来自下列输出并标注证据来源；全部外部层失败才允许声明无真实参考、按 Kami 骨架执行。禁止用内建知识冒充调研结果。",
        "",
      ];
      for (const layer of layers) {
        lines.push(`### ${layer.name}`, `证据: ${layer.evidence}`, layer.result, "");
      }
      lines.push("**下一步**：从候选里选 2-3 个真实方向（标注形态/气质/行业/防重四维 + 证据来源），展示给用户选。refero 可用时优先用 refero 取 DESIGN.md/风格详情。");
      return {
        content: [{ type: "text", text: lines.join("\n") }],
        details: { branch: params.branch, layers: layers.map((l) => l.name) },
      };
    },
  });

  // ---- design_lookup ----
  pi.registerTool({
    name: "design_lookup",
    label: "Design Lookup",
    description:
      "查询 design-references 资源注册表（R调研源/C约束模板/E执行工具/V校验标准 × 主/次/兜底层级），按分支×环节返回资源+退化链+精确来源。分支 A1/A2/A3/B1/B2/B3/C1/C2/C3，环节 1调研/2约束/3产出/4校验。设计任务流程中需要'这一步该查什么资源'时使用。",
    parameters: Type.Object({
      branch: Type.String({ description: "场景分支：A1(APP)/A2(网页)/A3(Mac)/B1(海报)/B2(杂志插图)/B3(PPT)/C1(组件素材)/C2(动效)/C3(文档排版)" }),
      stage: Type.Number({ description: "五环节：1 调研 / 2 约束 / 3 产出 / 4 校验（0 意图澄清无资源）" }),
    }),
    async execute(_toolCallId, params: { branch: string; stage: number }, _signal, _onUpdate, _ctx) {
      const registry = loadRegistry();
      const branch = params.branch.toUpperCase();
      const stage = params.stage;
      if (!registry.routes[branch]) {
        return {
          content: [{ type: "text", text: `未知分支 ${branch}。可选：${Object.keys(registry.routes).join(", ")}` }],
          details: {},
        };
      }
      if (stage < 1 || stage > 4) {
        return { content: [{ type: "text", text: "stage 需为 1-4（0 意图澄清无资源调用）" }], details: {} };
      }
      const slugs = [
        ...(registry.routes[branch][stage] || []),
        ...(registry.logoExtra[stage] || []),
        ...(registry.hallmarkExtra?.[stage] || []),
        ...(registry.cheatExtra?.[stage] || []),
      ];
      const hits = slugs
        .map((slug) => registry.resources.find((r) => r.slug === slug))
        .filter((r): r is RegistryResource => Boolean(r));
      if (hits.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `分支 ${branch} × 环节 ${stage}：无注册资源（登记空白区，见 registry.md）。该环节走退化链人工执行。`,
            },
          ],
          details: {},
        };
      }
      const lines = [`## ${branch} · 环节 ${stage} 资源`, ""];
      for (const r of hits) {
        lines.push(`### ${r.name}`, `- 角色: ${r.role} · 形态: ${r.form} · 层级: ${r.level}`, `- 适用: ${r.scenarios}`, `- 退化链: ${r.fallback}`, `- 来源: ${r.source}`, "");
      }
      lines.push("铁律：参考必须转译成约束（环节2），不'看一眼'就产出。用户精选资产优先于外部参考。");
      return { content: [{ type: "text", text: lines.join("\n") }], details: { branch, stage, count: hits.length } };
    },
  });

  // ---- design_audit ----
  pi.registerTool({
    name: "design_audit",
    label: "Design Audit",
    description:
      "对目标文件/目录跑设计反模式机器检查（只读不改）：Hallmark 可机器化 slop gates（1/2/10/14/19/24/26/27/30/33/34/37/38a/39/46/47/50/51 + 40/41 对比度）+ design-references 环节4 扫描（字重/圆角/渐变/emoji）。返回带 gate 号的 punch list。用于 hallmark audit 或环节4 校验。",
    parameters: Type.Object({
      target: Type.String({ description: "文件或目录路径（目录会递归收集 html/css/js/tsx/vue 等）" }),
    }),
    async execute(_toolCallId, params: { target: string }, _signal, _onUpdate, ctx) {
      const target = resolve(params.target);
      let paths: string[];
      try {
        paths = collectFiles(target);
      } catch (e) {
        return { content: [{ type: "text", text: `无法读取 ${target}：${(e as Error).message}` }], details: {}, isError: true };
      }
      if (paths.length === 0) {
        return { content: [{ type: "text", text: `目标下无前端文件（html/css/js/tsx/vue）：${target}` }], details: {}, isError: true };
      }
      const files = readAuditFiles(paths);
      const findings = [
        ...runTypographyChecks(files),
        ...runLayoutChecks(files),
        ...runA11yChecks(files),
        ...runCopyChecks(files),
        ...runContrastChecks(files),
        ...runCheatChecks(files),
      ];
      const isPage = files.some((f) => f.kind === "html");
      const text = formatFindings(findings, isPage);
      return { content: [{ type: "text", text }, { type: "text", text: `\n扫描 ${paths.length} 个文件：${paths.slice(0, 8).join(", ")}${paths.length > 8 ? " …" : ""}` }], details: { files: paths.length, findings: findings.length, cwd: ctx.cwd } };
    },
  });

  // ---- design_contrast ----
  pi.registerTool({
    name: "design_contrast",
    label: "Design Contrast",
    description:
      "对目标 CSS/HTML 计算 color/background 配对对比度（WCAG 2.1 为主 + APCA 近似参考）。检出 <4.5:1 的文本对（大字/图标按 3:1 人工放宽）与 ink-on-ink（文字≈填充）。支持 hex/rgb/hsl/oklch/一层 CSS 变量。",
    parameters: Type.Object({
      target: Type.String({ description: "CSS/HTML 文件或目录路径" }),
    }),
    async execute(_toolCallId, params: { target: string }, _signal, _onUpdate, _ctx) {
      const target = resolve(params.target);
      let paths: string[];
      try {
        paths = collectFiles(target);
      } catch (e) {
        return { content: [{ type: "text", text: `无法读取 ${target}：${(e as Error).message}` }], details: {}, isError: true };
      }
      const files = readAuditFiles(paths);
      const findings = runContrastChecks(files);
      if (findings.length === 0) {
        return { content: [{ type: "text", text: "✅ 未检出低于 4.5:1 的显式 color/background 配对（或无可配对声明，需人工核对继承链）。" }], details: { files: paths.length } };
      }
      const lines = [`检出 ${findings.length} 项对比度问题：`, ""];
      for (const f of findings) lines.push(`${f.severity === "error" ? "🔴" : "🔵"} [gate ${f.gate}] ${f.message}  ${f.location}`);
      return { content: [{ type: "text", text: lines.join("\n") }], details: { files: paths.length } };
    },
  });

  // ---- hallmark_study_fetch ----
  pi.registerTool({
    name: "hallmark_study_fetch",
    label: "Hallmark Study Fetch",
    description:
      "抓取指定 URL 的 HTML/CSS，提取设计 DNA 草稿（字体家族、:root 色值、间距档位、HTML 结构信号）。只做抓取+提取；DNA 的结构化判定、诊断报告与 design.md 产出由模型按 hallmark references/study.md 完成。auth-walled/JS SPA/抓取失败会提示改传截图。",
    parameters: Type.Object({
      url: Type.String({ description: "要研究的页面 URL（http/https）" }),
    }),
    async execute(_toolCallId, params: { url: string }, signal, _onUpdate, _ctx) {
      if (!/^https?:\/\//i.test(params.url)) {
        return { content: [{ type: "text", text: "需要 http/https URL。贴截图的话请用 vision 工具先读图。" }], details: {}, isError: true };
      }
      try {
        const dna = await fetchDna(params.url, signal ?? undefined);
        const lines = [
          `## DNA 草稿 — ${dna.title || dna.url}`,
          "",
          `**字体**（前 8）：`,
          ...dna.fonts.map((f) => `  - ${f.family}（${f.count} 处）`),
          "",
          `**色值**（前 12，按出现次数）：`,
          ...dna.colors.map((c) => `  - ${c.value}（${c.count} 次 · ${c.role}）`),
          "",
          `**间距档位**（偶数 px）：${dna.spacing.length ? dna.spacing.join(", ") : "（未提取到）"}`,
          "",
          `**结构信号**：`,
          ...dna.structureSignals.map((s) => `  - ${s.signal}: ${s.detail}`),
          "",
          dna.cssNote,
          "",
          "下一步：按 hallmark references/study.md 做 DNA 判定（macrostructure / 字体配对 / 颜色锚点），产出诊断报告，可选项：build 或 lock 成 design.md。",
        ];
        return { content: [{ type: "text", text: lines.join("\n") }], details: { url: dna.url, fonts: dna.fonts.length, colors: dna.colors.length } };
      } catch (e) {
        return { content: [{ type: "text", text: (e as Error).message }], details: {}, isError: true };
      }
    },
  });

  // ---- Hallmark 常驻注入（设计任务触发） ----
  pi.on("before_agent_start", async (event) => {
    if (!event.prompt || !isDesignTask(event.prompt)) return;
    const injected = buildInjection(config);
    if (!injected.trim()) return; // 注入源全部缺失，静默
    return {
      message: {
        customType: "design-router",
        content: injected + "\n\n" + toolNoteWithDetails(),
        display: true,
      },
    };
  });

  // ---- /design-router 命令 ----
  pi.registerCommand("design-router", {
    description: "design-router 状态/重载：/design-router status | reload",
    handler: async (args, ctx) => {
      const cmd = (args || "").trim().toLowerCase();
      if (cmd === "reload") {
        try {
          await execFileAsync("node", [join(baseDir, "scripts/build-registry.mjs")], { timeout: 15000 });
          ctx.ui.notify("registry.json 已重新生成", "info");
        } catch (e) {
          ctx.ui.notify(`重新生成失败：${(e as Error).message}`, "error");
        }
        return;
      }
      // status（默认）
      const registry = loadRegistry();
      const cfg = loadConfig();
      let manifest: Record<string, string> = {};
      try {
        manifest = JSON.parse(readFileSync(join(baseDir, "data/manifest.json"), "utf8"));
      } catch {
        /* 无 manifest */
      }
      const hallmarkInstalled = (() => {
        try {
          return readFileSync(HALLMARK_SKILL, "utf8");
        } catch {
          return "";
        }
      })();
      const hallmarkVer = hallmarkInstalled.match(/^version:\s*(.+)$/m)?.[1]?.trim() || "?";
      const expected = manifest.hallmarkRuleVersion || "?";
      const verMatch = hallmarkInstalled && (expected === "?" || hallmarkVer === expected);
      const lines = [
        "design-router 状态",
        `· 注入模式: ${cfg.injectionMode}（config.json 可改 full/slim；注入 = 归位映射 inject-map.md + hallmark SKILL.md）`,
        `· registry: ${registry.resources.length} 条资源 / ${Object.keys(registry.routes).length} 个分支路由（data/registry.json）`,
        `· 版本配套: extension ${manifest.extensionVersion || "?"} · 规则转译自 hallmark ${expected} · registry 生成 ${manifest.registryGenerated || "?"}`,
        `· hallmark 实际: ${hallmarkInstalled ? "已安装 " + hallmarkVer : "未安装（软依赖，注入跳过 hallmark 部分，工具照常）"}${hallmarkInstalled && !verMatch ? " ⚠️ 版本与转译源不一致（${hallmarkVer} vs ${expected}），checks 规则可能需复核" : ""}`,
        `· design-references skill: ${loadInjectMap() ? "注入映射就绪" : "inject-map.md 缺失"}`,
        `· 检查器: typography / layout / a11y / copy / contrast（design_audit 全跑，design_contrast 单跑）`,
        `· 触发词: 设计/落地页/landing/海报/hallmark/redesign/audit/study 等`,
      ];
      ctx.ui.notify(lines.join("\n"), "info");
    },
  });
}
