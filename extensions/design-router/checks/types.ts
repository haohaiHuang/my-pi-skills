/**
 * checks/types.ts — 共享类型（纯类型，兼容 node strip-types）
 */
export interface AuditFile {
  path: string;      // 相对/显示路径
  content: string;
  kind: "html" | "css" | "js" | "tsx" | "jsx" | "vue" | "other";
}

export interface Finding {
  gate: string;           // hallmark gate 号（如 "48"）或 design-references 环节4（如 "DR-4"）
  rule: string;           // 短规则名（英文，可 grep）
  severity: "error" | "warn" | "info";
  message: string;
  location: string;       // file[:line]
}

export function loc(file: string, line?: number): string {
  return line ? `${file}:${line}` : file;
}

/** 按行扫内容，返回匹配行号（1-based） */
export function grepLines(content: string, re: RegExp): number[] {
  const out: number[] = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) out.push(i + 1);
  }
  return out;
}
