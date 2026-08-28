/**
 * self-test.ts — design-router 自检（无框架，node 直接跑）
 *
 * 用法：node tests/self-test.ts
 * 覆盖：registry 数据完整性、5 个检查器、对比度计算（已知 FAIL/PASS 对）。
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { runTypographyChecks } from "../checks/typography.ts";
import { runLayoutChecks } from "../checks/layout.ts";
import { runA11yChecks } from "../checks/a11y.ts";
import { runCopyChecks } from "../checks/copy.ts";
import { runContrastChecks, wcagContrast, apcaApprox, parseColor } from "../checks/contrast.ts";
import { runCheatChecks } from "../checks/cheat.ts";
import { dnaSelfTest } from "../study.ts";
import type { AuditFile } from "../checks/types.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const f = (path: string, content: string, kind: AuditFile["kind"] = "other"): AuditFile => ({ path, content, kind });

// ============ 1. registry 数据完整性 ============
function testRegistry() {
  const reg = JSON.parse(readFileSync(join(HERE, "../data/registry.json"), "utf8"));
  assert.ok(reg.resources.length >= 45, `资源数应 >= 45，实际 ${reg.resources.length}`);
  assert.ok(Object.keys(reg.routes).length === 9, "应有 9 个分支路由");
  const refero = reg.resources.find((r: { slug?: string }) => r.slug === "refero-design");
  assert.ok(refero, "refero-design 应存在");
  assert.ok(refero.fallback && refero.source, "refero-design 应有退化链+来源");
  const gaps = reg.resources.filter((r: { slug?: string }) => !r.slug);
  assert.equal(gaps.length, 0, `不应有无 slug 资源：${gaps.map((g: { name: string }) => g.name).join(",")}`);
  // 反同质化：风格桶 + 需求路由表 + 质量默认值
  assert.ok(reg.buckets && Object.keys(reg.buckets).length === 8, "应有 8 个风格桶");
  assert.ok(reg.routing && Object.keys(reg.routing).length >= 5, `需求路由表应 ≥5 条，实际 ${Object.keys(reg.routing || {}).length}`);
  const bucketed = reg.resources.filter((r: { bucket?: string }) => r.bucket);
  assert.ok(bucketed.length >= 8, `打桶资源应 ≥8，实际 ${bucketed.length}`);
  assert.ok(reg.resources.every((r: { quality?: string }) => r.quality), "所有资源应有 quality 默认值");
  console.log(`✓ registry: ${reg.resources.length} 资源, 9 分支, ${bucketed.length} 打桶, ${Object.keys(reg.routing).length} 路由, 无缺 slug`);
}

// ============ 2. typography ============
function testTypography() {
  const css = `
  h1.title { font-family: Inter; font-style: italic; }
  .a { font-family: "Open Sans", Arial; }
  .b { font-family: Roboto; }
  .c { font-family: Poppins; }
  p { font-weight: 700; }
  `;
  const finds = runTypographyChecks([f("a.css", css, "css")]);
  assert.ok(finds.some((x) => x.gate === "1"), "gate 1 应检出默认字体");
  assert.ok(finds.some((x) => x.gate === "38a"), "gate 38a 应检出标题斜体");
  assert.ok(finds.some((x) => x.gate === "37"), "gate 37 应检出 >3 家族");
  console.log("✓ typography: gate 1/37/38a 检出正常");
}

// ============ 3. layout ============
function testLayout() {
  const css = `
  html { background: #fff; }
  .hero { background: linear-gradient(90deg, #111, #222); }
  .card { transition: all .2s; padding: 17px; }
  @keyframes slide { from { left: 0; } }
  .grid { grid-template-columns: 1fr 1fr; }
  `;
  const finds = runLayoutChecks([f("b.css", css, "css"), f("b.html", "<img src=x>", "html")]);
  assert.ok(finds.some((x) => x.gate === "2"), "gate 2 应检出渐变");
  assert.ok(finds.some((x) => x.gate === "10"), "gate 10 应检出 transition-all");
  assert.ok(finds.some((x) => x.gate === "24"), "gate 24 应检出非 4pt 间距 17px");
  assert.ok(finds.some((x) => x.gate === "34"), "gate 34 应检出缺 overflow-x");
  assert.ok(finds.some((x) => x.gate === "14" && x.message.includes("left")), "gate 14 应检出 keyframes 内布局属性");
  const clean = runLayoutChecks([f("b2.css", "@keyframes fade { from { opacity: 0 } }", "css")]);
  assert.ok(!clean.some((x) => x.gate === "14"), "纯 opacity 动画不应误报 gate 14");
  console.log("✓ layout: gate 2/10/14/24/34 检出正常，无误报");
}

// ============ 4. a11y ============
function testA11y() {
  const html = `<button>Go</button><a href="#">x</a><svg></svg>`;
  const css = `button { animation: pulse 1s infinite; } @keyframes pulse { from { opacity: 1; } }`;
  const finds = runA11yChecks([f("c.html", html, "html"), f("c.css", css, "css")]);
  assert.ok(finds.some((x) => x.gate === "26"), "gate 26 应检出缺 focus-visible");
  assert.ok(finds.some((x) => x.gate === "27"), "gate 27 应检出缺 reduced-motion");
  assert.ok(finds.some((x) => x.gate === "33"), "gate 33 应检出 svg 缺 aria");
  console.log("✓ a11y: gate 26/27/33 检出正常");
}

// ============ 5. copy ============
function testCopy() {
  const html = `
  <h2>Trusted by 50,000+ teams</h2>
  <p>Our app is 10x faster. Contact Jane Doe.</p>
  <div class="icon">✨</div>
  `;
  const finds = runCopyChecks([f("d.html", html, "html")]);
  assert.ok(finds.some((x) => x.gate === "46"), "gate 46 应检出编造指标");
  assert.ok(finds.some((x) => x.gate === "19"), "gate 19 应检出占位名");
  assert.ok(finds.some((x) => x.gate === "30"), "gate 30 应检出 emoji");
  console.log("✓ copy: gate 19/30/46 检出正常");
}

// ============ 6. contrast ============
function testContrast() {
  // 色值解析
  assert.deepEqual(parseColor("#ff0000"), { r: 255, g: 0, b: 0 });
  assert.deepEqual(parseColor("rgb(0, 128, 255)"), { r: 0, g: 128, b: 255 });
  const oklch = parseColor("oklch(0.6 0.15 250)");
  assert.ok(oklch && oklch.r !== undefined, "oklch 应可解析");

  // 已知对：白底黑字 21:1；黑底黑字 1:1
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  assert.ok(wcagContrast(black, white) > 20, "黑/白对比应 > 20");
  assert.ok(Math.abs(wcagContrast(black, black) - 1) < 0.01, "黑/黑对比应 ≈ 1");
  assert.ok(apcaApprox(black, white) > 80, "APCA 黑白应高");

  // 规则级配对扫描
  const css = `
  :root { --ink: #111; --paper: #fff; }
  .btn-danger { color: #000; background-color: #000; }
  .ok { color: #111; background: #fff; }
  .muted { color: #777777; background: #ffffff; }
  .var { color: var(--ink); background: var(--paper); }
  `;
  const finds = runContrastChecks([f("e.css", css, "css")]);
  const fails = finds.filter((x) => x.gate === "40" && x.rule === "contrast-fail");
  const inkOnInk = finds.filter((x) => x.gate === "41");
  assert.ok(fails.some((x) => x.message.includes("#000 on #000")), "黑底黑字应 FAIL");
  assert.ok(inkOnInk.length >= 1, "ink-on-ink 应检出");
  assert.ok(!fails.some((x) => x.message.includes("#111 on #fff")), "白底深字不应 FAIL");
  assert.ok(!fails.some((x) => x.message.includes("#111 on #fff")), "var 解析对不应 FAIL");
  assert.ok(fails.some((x) => x.message.includes("#777777 on #ffffff")), "#777/#fff 边界应 FAIL(≈4.48:1)");
  console.log("✓ contrast: 黑/黑 FAIL、白/黑 PASS、var 解析正常");
}

// ============ 6b. 继承链对比度 ============
function testInheritedContrast() {
  const css = `
  .card { background: #111; }
  .card h2 { color: #111; }
  .ok-card { background: #fff; }
  .ok-card p { color: #111; }
  .card-2 { background: #000; }
  .card-2x h2 { color: #000; }
  `;
  const finds = runContrastChecks([f("inh.css", css, "css")]);
  const inherited = finds.filter((x) => x.rule === "contrast-fail-inherited");
  assert.ok(inherited.some((x) => x.message.includes(".card h2")), "应检出 .card 深底上的 .card h2 深字");
  assert.ok(!inherited.some((x) => x.message.includes(".ok-card")), "浅底深字不应误报");
  assert.ok(!inherited.some((x) => x.message.includes(".card-2x")), "选择器边界控制：.card-2x 不应误命中 .card-2");
  console.log("✓ 继承链对比度: 深底深字检出、浅底不误报、选择器边界正确");
}

// ============ 6c. cheat sheet 检查器 ============
function testCheatChecks() {
  const html = `<div onclick="go()">Click</div><p>He said "hi" and 'bye'</p>`;
  const css = `
  @font-face { src: url("font.ttf"); }
  h1 { width: 400px; }
  button:hover { color: red; }
  body { margin-left: 10px; margin-right: 10px; padding-left: 5px; }
  `;
  const finds = runCheatChecks([f("cs.html", html, "html"), f("cs.css", css, "css")]);
  assert.ok(finds.some((x) => x.gate === "CS-1"), "CS-1 应检出 ttf");
  assert.ok(finds.some((x) => x.gate === "CS-2"), "CS-2 应检出 div 当按钮");
  assert.ok(finds.some((x) => x.gate === "CS-4"), "CS-4 应检出文本固定宽");
  assert.ok(finds.some((x) => x.gate === "CS-5"), "CS-5 应检出 hover 未包裹");
  assert.ok(finds.some((x) => x.gate === "CS-6"), "CS-6 应检出直引号");
  assert.ok(finds.some((x) => x.gate === "CS-8"), "CS-8 应检出物理属性");
  console.log("✓ cheat sheet: CS-1/2/4/5/6/8 检出正常");
}

// ============ 7. study 模块可加载 ============
function testStudyLoad() {
  assert.ok(dnaSelfTest(), "study.ts 应可加载");
  console.log("✓ study: 模块加载正常（URL 抓取需网络，不在此跑）");
}

// ============ 8. 设计任务检测（从 index.ts 复刻逻辑内联验证） ============
function testTriggerWords() {
  const strong = ["帮我做个落地页", "设计一个官网", "hallmark audit 这个页面", "帮我 redesign 首页", "做个海报"];
  const weak = ["这个页面风格怎么改", "帮我美化一下界面"];
  const nonDesign = ["修复这个 bug", "解释这段代码", "提交 git", "写测试"];
  const strongHints = ["设计", "落地页", "landing", "海报", "hallmark", "redesign", "官网", "封面", "banner", "首页", "登录页", "设计系统", "配色", "排版", "界面", "做个小程序", "做个app", "做个 app", "幻灯片", "ppt", "slides", "deck", "原型", "mockup", "wireframe", "组件库", "改版"];
  const weakHints = ["audit", "study", "页面", "风格", "参考", "美化", "升级", "ui"];
  const isDesignTask = (prompt: string) => {
    const p = prompt.toLowerCase();
    if (strongHints.some((h) => p.includes(h.toLowerCase()))) return true;
    if (/\bapp\b|\bui\b|\bdesign\b/i.test(p)) return true;
    return weakHints.filter((h) => p.includes(h.toLowerCase())).length >= 2;
  };
  for (const t of strong) assert.ok(isDesignTask(t), `应触发: ${t}`);
  for (const t of weak) assert.ok(isDesignTask(t), `应触发(弱组合): ${t}`);
  for (const t of nonDesign) assert.ok(!isDesignTask(t), `不应触发: ${t}`);
  console.log("✓ 触发词: 强/弱组合命中，非设计任务不误触");
}

// ============ 跑全部 ============
testRegistry();
testTypography();
testLayout();
testA11y();
testCopy();
testContrast();
testInheritedContrast();
testCheatChecks();
testStudyLoad();
testTriggerWords();
console.log("\n✅ 全部自检通过");
