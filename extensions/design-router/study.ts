/**
 * study.ts — hallmark_study_fetch 的实现：URL → 结构化 DNA 草稿
 *
 * 只做"抓取 + 提取"的工程活：HTML/CSS 抓取、字体/色值/间距/结构信号提取。
 * 不做视觉判定——DNA 的结构化判定与诊断报告由模型读 hallmark references/study.md 完成。
 *
 * 边界：auth-walled / JS SPA shell / 抓取失败 → 返回错误提示"改传截图"。
 */
import type { AuditFile } from "./checks/types.ts";

export interface DnaDraft {
  url: string;
  title: string;
  fonts: Array<{ family: string; count: number }>;
  colors: Array<{ value: string; count: number; role: "root" | "inline" | "declaration" }>;
  spacing: number[];
  structureSignals: Array<{ signal: string; detail: string }>;
  cssNote: string;
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

function countBy<T>(arr: T[], key: (t: T) => string): Array<{ value: T; count: number }> {
  const m = new Map<string, { value: T; count: number }>();
  for (const item of arr) {
    const k = key(item);
    const hit = m.get(k);
    if (hit) hit.count++;
    else m.set(k, { value: item, count: 1 });
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}

function extractCssSources(html: string): string[] {
  const urls: string[] = [];
  for (const m of html.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)) urls.push(m[1]);
  for (const m of html.matchAll(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']stylesheet["']/gi)) urls.push(m[1]);
  return urls;
}

function resolveUrl(base: string, href: string): string {
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

async function fetchText(url: string, signal?: AbortSignal): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,text/css,*/*" },
      redirect: "follow",
      signal,
      // 安全上限：10MB
    });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > 10 * 1024 * 1024) return null;
    // 按字节解码（Content-Type charset 或 UTF-8）
    const ct = res.headers.get("content-type") || "";
    const enc = ct.match(/charset=([\w-]+)/i)?.[1];
    try {
      return new TextDecoder(enc || "utf-8").decode(buf);
    } catch {
      return new TextDecoder("utf-8").decode(buf);
    }
  } catch {
    return null;
  }
}

export async function fetchDna(url: string, signal?: AbortSignal): Promise<DnaDraft> {
  const html = await fetchText(url, signal);
  if (html === null) {
    throw new Error(`无法抓取 ${url}（网络错误/auth-walled/超 10MB）。若是登录墙或 JS 渲染页，请改传截图。`);
  }
  if (/<script[^>]*src=/.test(html) && !/<\/body>/.test(html)) {
    // 弱信号：无 body 的 SPA shell
    throw new Error(`${url} 看起来是 JS-only SPA shell（无完整 HTML 内容）。请改传截图。`);
  }

  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || "";

  // ---- 字体：内联 <style>/inline style + 外链 CSS ----
  const fontHits: string[] = [];
  const cssTexts: string[] = [];
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) cssTexts.push(m[1]);
  for (const m of html.matchAll(/style=["']([^"']*font-family[^"']*)["']/gi)) fontHits.push(m[1]);

  // 抓外链 CSS（限 3 个，含字体来源判断）
  const cssUrls = extractCssSources(html);
  let cssFetched = 0;
  for (const href of cssUrls.slice(0, 3)) {
    const abs = resolveUrl(url, href);
    if (/fonts\.(googleapis|gstatic)\.com|font\.awesome/.test(abs)) continue; // 字体源本身不抓
    const css = await fetchText(abs, signal);
    if (css) {
      cssTexts.push(css);
      cssFetched++;
    }
  }

  for (const css of cssTexts) {
    for (const m of css.matchAll(/font-family\s*:\s*([^;{}]+)/gi)) {
      fontHits.push(m[1]);
    }
  }

  const fonts = countBy(
    fontHits.map((s) => s.split(",")[0].trim().replace(/^["']|["']$/g, "")).filter((s) => s && !s.startsWith("var(")),
    (s) => s,
  ).map(({ value, count }) => ({ family: value, count }));

  // ---- 色值：:root 变量 / 声明 / inline ----
  const colorHits: Array<{ value: string; role: DnaDraft["colors"][number]["role"] }> = [];
  for (const css of cssTexts) {
    for (const m of css.matchAll(/^\s*--[\w-]+\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|oklch\([^)]+\))\s*;?/gm)) {
      colorHits.push({ value: m[1], role: "root" });
    }
    for (const m of css.matchAll(/color(?:-background)?\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|oklch\([^)]+\))/gi)) {
      colorHits.push({ value: m[1], role: "declaration" });
    }
  }
  for (const m of html.matchAll(/style=["']([^"']*(?:#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))[^"']*)["']/gi)) {
    const inlineColors = m[1].match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g) || [];
    for (const c of inlineColors) colorHits.push({ value: c, role: "inline" });
  }
  const colors = countBy(colorHits, (c) => c.value).map(({ value, count }) => ({ value: value.value, count, role: value.role }));

  // ---- 间距档位 ----
  const spacingSet = new Set<number>();
  for (const css of cssTexts) {
    for (const m of css.matchAll(/(?:padding|margin|gap)\s*:\s*([^;}]+)/gi)) {
      for (const v of m[1].matchAll(/(\d+)px/g)) {
        const n = parseInt(v[1]);
        if (n > 0 && n <= 256 && n % 2 === 0) spacingSet.add(n);
      }
    }
  }

  // ---- 结构信号 ----
  const structureSignals: Array<{ signal: string; detail: string }> = [];
  const tagCount: Record<string, number> = {};
  for (const m of html.matchAll(/<(section|nav|footer|header|main|aside|h1|h2|article|form)\b/gi)) {
    tagCount[m[1].toLowerCase()] = (tagCount[m[1].toLowerCase()] || 0) + 1;
  }
  for (const [tag, n] of Object.entries(tagCount)) {
    structureSignals.push({ signal: `html:${tag}`, detail: `${n} 处` });
  }
  const hero = html.match(/class=["'][^"']*(hero|landing)[^"']*["']/i);
  if (hero) structureSignals.push({ signal: "hero-class", detail: hero[0].slice(0, 80) });
  const grid = html.match(/class=["'][^"']*grid[^"']*["']/i);
  if (grid) structureSignals.push({ signal: "grid-class", detail: grid[0].slice(0, 80) });

  return {
    url,
    title,
    fonts: fonts.slice(0, 8),
    colors: colors.slice(0, 12),
    spacing: [...spacingSet].sort((a, b) => a - b).slice(0, 12),
    structureSignals: structureSignals.slice(0, 15),
    cssNote: cssFetched > 0 ? `已抓取 ${cssFetched} 个外链 CSS` : "未抓到外链 CSS（可能全部内联）",
  };
}

/** 简单健康检查：确认本模块可加载 */
export function dnaSelfTest(): boolean {
  return typeof fetchDna === "function";
}

export type { AuditFile };
