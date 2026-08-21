#!/usr/bin/env node
/**
 * build-registry.mjs — registry.md → registry.json 生成器
 *
 * 数据真源：my-pi-skills/skills/design-references/references/registry.md（人可读 markdown 表格）
 * 生成物：design-router/data/registry.json（extension 运行时数据）
 * 维护规则：改 registry.md 后重跑本脚本；禁止手改 registry.json。
 *
 * 用法：node scripts/build-registry.mjs [path/to/registry.md]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SRC = join(HERE, "../../../skills/design-references/references/registry.md");
const OUT = join(HERE, "../data/registry.json");

// ---------- 名称 → slug 映射（registry 首列为中文+括号描述，需人工映射） ----------
const SLUG_BY_KEYWORD = [
  // R 调研源
  ["refero-design", "refero MCP / refero-design skill"],
  ["zine-style-library", "Zine 风格库"],
  ["voltagent", "VoltAgent"],
  ["beautiful-ui", "Beautiful UI"],
  ["aceternity", "Aceternity UI"],
  ["21st-dev", "21st.dev"],
  ["minimal-gallery", "minimal.gallery"],
  ["uiverse", "Uiverse Galaxy"],
  ["orange-line-illustration", "orange-line-illustration"],
  ["lucide", "Lucide"],
  ["heroicons", "Heroicons"],
  ["google-fonts", "Google Fonts"],
  ["hero-patterns", "Hero Patterns"],
  ["css-gradient-tools", "CSS 渐变工具"],
  ["design-md-spec", "DESIGN.md 格式规范"],
  ["liquid-gooey", "Liquid Gooey"],
  ["transitions-dev", "transitions.dev"],
  ["vibeprompts", "vibeprompts.dev"],
  // C 约束模板
  ["kami-skeleton", "Kami 约束骨架"],
  ["kami-spec", "Kami 完整设计规范"],
  ["zine-family-recipes", "Zine 风格族配方"],
  ["design-md", "DESIGN.md（选定参考的设计系统文件）"],
  ["design-md-skill", "design-md-skill"],
  ["huashu-philosophy", "huashu-design 设计哲学"],
  ["brand-guidelines", "brand-guidelines / theme-factory"],
  ["logo-design-patterns", "logo-generator 设计模式库"],
  ["logo-background-styles", "logo-generator 背景风格库"],
  ["logo-webgl-backgrounds", "logo-generator WebGL"],
  // E 执行工具
  ["kami-skill", "kami 技能"],
  ["huashu-design", "huashu-design（HTML 高保真原型"],
  ["baoyu-design", "baoyu-design"],
  ["frontend-design", "frontend-design"],
  ["gpt-image-2", "gpt-image-2"],
  ["imagegen", "imagegen（openai/skills"],
  ["figma-family", "Figma 家族"],
  ["guizang-ppt-skill", "guizang-ppt-skill"],
  ["motion-lib", "motion（Motion.dev"],
  ["motion-dev-animations", "motion-dev-animations"],
  ["animejs", "Anime.js"],
  ["hyperframes", "hyperframes"],
  ["diagram-design", "diagram-design"],
  ["anthropics-tools", "theme-factory / brand-guidelines / canvas-design"],
  ["openai-imagegen", "OpenAI imagegen"],
  ["openmotion", "OpenMotion"],
  // V 校验标准
  ["kami-sancha", "Kami 三查"],
  ["huashu-5dim", "huashu 5 维评审"],
  ["zine-consistency", "Zine 风格一致性自检"],
  ["design-qa-checklist", "design-qa-checklist"],
  ["design-research-methods", "设计研究 UX 方法"],
  ["logo-quality-floor", "logo-generator 图形质量底线"],
];

// ---------- 分支 × 环节 → 资源 slug 路由表（来自 SKILL.md 分支表 + workflow.md 环节调用表） ----------
// stage: 0 意图 / 1 调研 / 2 约束 / 3 产出 / 4 校验
const ROUTES = {
  A1: {
    1: ["refero-design", "beautiful-ui", "minimal-gallery"],
    2: ["kami-skeleton", "refero-design", "design-md-skill"],
    3: ["kami-skill", "huashu-design", "figma-family", "motion-lib"],
    4: ["kami-sancha", "design-qa-checklist", "huashu-5dim"],
  },
  A2: {
    1: ["refero-design", "aceternity", "21st-dev"],
    2: ["kami-skeleton", "refero-design", "design-md-skill"],
    3: ["huashu-design", "kami-skill", "frontend-design"],
    4: ["kami-sancha", "huashu-5dim"],
  },
  A3: {
    1: ["refero-design", "voltagent"],
    2: ["kami-skeleton", "refero-design"],
    3: ["frontend-design"],
    4: ["kami-sancha", "huashu-5dim"],
  },
  B1: {
    1: ["zine-style-library", "orange-line-illustration"],
    2: ["zine-family-recipes", "logo-background-styles"],
    3: ["gpt-image-2", "kami-skill"],
    4: ["zine-consistency", "kami-sancha"],
  },
  B2: {
    1: ["zine-style-library", "orange-line-illustration"],
    2: ["zine-family-recipes", "kami-spec"],
    3: ["gpt-image-2", "kami-skill"],
    4: ["zine-consistency", "kami-sancha"],
  },
  B3: {
    1: [],
    2: ["kami-skeleton"],
    3: ["guizang-ppt-skill"],
    4: [],
  },
  C1: {
    1: ["lucide", "google-fonts", "hero-patterns", "21st-dev", "uiverse"],
    2: ["kami-skeleton"],
    3: ["21st-dev", "uiverse"],
    4: ["kami-sancha"],
  },
  C2: {
    1: ["transitions-dev", "liquid-gooey"],
    2: [],
    3: ["motion-lib", "motion-dev-animations", "animejs"],
    4: [],
  },
  C3: {
    1: [],
    2: ["kami-skeleton"],
    3: ["kami-skill"],
    4: ["kami-sancha"],
  },
};

// logo 场景跨分支附加（环节 2/4 必读）
const LOGO_EXTRA = { 2: ["logo-design-patterns"], 4: ["logo-quality-floor"] };

// ---------- markdown 表格解析 ----------
function parseTableRows(lines) {
  const rows = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // 表头行：| 资源 | 形态 | ...（首列是"资源"或"---"）
    if (/^\|.*资源.*\|/.test(line) || /^\|\s*---/.test(line)) {
      i++;
      while (i < lines.length && /^\|/.test(lines[i])) {
        const cells = lines[i]
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((c) => c.trim());
        if (cells.length >= 5) rows.push(cells);
        i++;
      }
      continue;
    }
    i++;
  }
  return rows;
}

// ---------- 主流程 ----------
function main() {
  const src = process.argv[2] || DEFAULT_SRC;
  const text = readFileSync(src, "utf8");
  const lines = text.split("\n");

  // 角色段落定位
  let currentRole = null;
  const resources = [];
  const skipped = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const roleMatch = line.match(/^## ([RCEV]) /);
    if (roleMatch) {
      currentRole = roleMatch[1];
      continue;
    }
    // 登记空白区/安装裁定段落停止收录
    if (/^## /.test(line) && !/^## [RCEV] /.test(line)) {
      currentRole = null;
      continue;
    }
    if (currentRole && /^\|/.test(line) && !/^\|\s*---/.test(line) && !/^\| 资源 /.test(line) && !/^\| 格子 /.test(line) && !/^\| ---/.test(line)) {
      const cells = line
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim());
      if (cells.length >= 6 && cells[0] !== "---") {
        const [name, form, level, scenarios, fallback, source] = cells;
        // 找 slug
        let slug = null;
        for (const [s, kw] of SLUG_BY_KEYWORD) {
          if (name.includes(kw)) {
            slug = s;
            break;
          }
        }
        const res = {
          name,
          role: currentRole,
          form,
          level,
          scenarios,
          fallback,
          source,
        };
        if (slug) res.slug = slug;
        else skipped.push(name);
        resources.push(res);
      }
    }
  }

  // 组装输出
  const output = {
    generated: new Date().toISOString().slice(0, 10),
    source: "skills/design-references/references/registry.md",
    resources,
    routes: ROUTES,
    logoExtra: LOGO_EXTRA,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");

  console.log(`✅ registry.json 生成：${resources.length} 条资源，${Object.keys(ROUTES).length} 个分支路由`);
  if (skipped.length) {
    console.log(`⚠️ 未匹配 slug 的资源（${skipped.length}）：`);
    for (const s of skipped) console.log(`   - ${s}`);
  }
}

main();
