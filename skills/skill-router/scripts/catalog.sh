#!/bin/bash
# ============================================================
# skill-router · catalog.sh —— 本机技能运行时扫描器（唯一数据源）
#
# 用法：
#   catalog.sh <平台>            列出该平台全部可见技能（分类）
#   catalog.sh <平台> --check    管理台账模式：同名检测 + 同类冲突预警 + 结构统计
#   catalog.sh all               列出所有平台技能数概览
#
# 平台：pi / workbuddy / codex / claude / trae-ide / trae-work
#   （trae-ide / trae-work 映射已预留，Trae 系列处理时激活）
#
# 设计原则（见 SKILL.md）：
#   - 运行时现扫，不缓存 —— 清单永远与磁盘一致
#   - 软链跟随（[ -f ] 穿透），共享层技能自动出现在各平台清单
#   - 分类用 name 规则 + description 关键词，新技能自动归类
# ============================================================

set -u
H="$HOME"

# ---------- 目录映射（本机实际路径） ----------
# bash 3.2（macOS 默认）不支持关联数组，用函数返回
platform_dirs() {
	case "$1" in
	pi)
		echo "$H/.pi/agent/skills"
		echo "$H/.agents/skills"
		;;
	workbuddy) echo "$H/.workbuddy/skills" ;;
	codex) echo "$H/.codex/skills" ;;
	claude) echo "$H/.claude/skills" ;;
	trae-ide) echo "$H/.trae-cn/skills" ;;
	trae-work)
		# 自动探测：本机 Trae Work 实际位置二选一
		if [ -d "$H/.trae/skills" ]; then
			echo "$H/.trae/skills"
		else
			echo "$H/Library/Application Support/TRAE SOLO CN/ModularData/ai-agent/skills"
		fi
		;;
	*) echo "" ;;
	esac
}

# ---------- 分类规则：name 精确/前缀优先，fallback 描述关键词 ----------
classify() {
	local name="$1" desc="$2"
	case "$name" in
	lark-*)
		echo "飞书"
		return
		;;
	ask-matt | code-review | codebase-design | diagnosing-bugs | domain-modeling | grill-with-docs | implement | improve-codebase-architecture | prototype | research | resolving-merge-conflicts | setup-matt-pocock-skills | tdd | to-spec | to-tickets | triage | wayfinder | wizard)
		echo "工程流"
		return
		;;
	grill-me | grilling | handoff | teach | to-questionnaire | wait-what | writing-for-agents)
		echo "生产力"
		return
		;;
	claude-handoff | loop-me | setup-ts-deep-modules | writing-beats | writing-fragments | writing-shape)
		echo "实验"
		return
		;;
	git-guardrails-claude-code | migrate-to-shoehorn | scaffold-exercises | setup-pre-commit)
		echo "工程杂项"
		return
		;;
	obsidian*)
		echo "知识管理"
		return
		;;
	excalidraw-diagram | mermaid-visualizer | json-canvas)
		echo "绘图"
		return
		;;
	hyperframes*)
		echo "视频/音频"
		return
		;;
	ego-browser)
		echo "浏览器自动化"
		return
		;;
	using-coze-cli | coze-agent-collaboration)
		echo "平台接入"
		return
		;;
	esac
	# description 关键词 fallback（name 未命中时）
	case "$desc" in
	*design* | *mockup* | *原型* | *wireframe* | *landing* | *illustration* | *插画* | *image* | *图像*)
		echo "设计/图像"
		return
		;;
	*[Pp][Pp][Tt]* | *slide* | *演示文稿* | *docx* | *xlsx* | *resume* | *排版* | *pdf*)
		echo "文档/PPT"
		return
		;;
	*browser* | *Playwright* | *浏览器* | *网页自动化*)
		echo "浏览器自动化"
		return
		;;
	*search* | *搜索* | *查找* | *documentation* | *文档检索* | *"web research"*)
		echo "搜索/调研"
		return
		;;
	*video* | *视频* | *animation* | *动画* | *tts* | *speech*)
		echo "视频/音频"
		return
		;;
	*review* | *audit* | *审查* | *扫描* | *收尾* | *closeout*)
		echo "审查/收尾"
		return
		;;
	*knowledge* | *知识* | *learning* | *学习*)
		echo "知识管理"
		return
		;;
	*) echo "其他" ;;
	esac
}

# ---------- 读取 frontmatter 字段 ----------
get_frontmatter() {
	local file="$1" field="$2"
	awk -v f="$field" '
    $0 ~ "^" f ":" {
      v=$0; sub("^" f ": *", "", v);
      # 块标量（> 或 |）取后续缩进行
      if (v == ">" || v == ">-" || v == "|" || v == "|-") {
        v=""; getline;
        while ($0 ~ /^[ \t]/) { v=v " " $0; getline }
      }
      sub(/^[ \t]+/, "", v); sub(/[ \t]+$/, "", v);
      gsub(/^"|"$/, "", v); gsub(/^'"'"'|'"'"'$/, "", v);
      print v; exit
    }' "$file"
}

# ---------- 单平台扫描：输出 name<TAB>cat<TAB>desc ----------
scan_platform() {
	local plat="$1"
	local dirs
	dirs=$(platform_dirs "$plat")
	if [ -z "$dirs" ]; then
		echo "未知平台: $plat（可用: pi workbuddy codex claude trae-ide trae-work all）" >&2
		return 1
	fi
	local found=0
	local d
	while IFS= read -r d; do
		[ -z "$d" ] && continue
		[ -d "$d" ] || continue
		local f
		for f in "$d"/*/SKILL.md; do
			[ -f "$f" ] || continue
			local name desc cat
			name=$(basename "$(dirname "$f")")
			desc=$(get_frontmatter "$f" description)
			cat=$(classify "$name" "$desc")
			printf '%s\t%s\t%s\n' "$name" "$cat" "$desc"
			found=$((found + 1))
		done
	done < <(platform_dirs "$plat")
	# pi install 安装的技能在 ~/.pi/agent/git/github.com/<owner>/<repo>/skills/（多级结构）
	if [ "$plat" = "pi" ] && [ -d "$H/.pi/agent/git/github.com" ]; then
		local f
		for f in "$H/.pi/agent/git/github.com"/*/*/skills/*/SKILL.md; do
			[ -f "$f" ] || continue
			local name desc cat
			name=$(basename "$(dirname "$f")")
			desc=$(get_frontmatter "$f" description)
			cat=$(classify "$name" "$desc")
			printf '%s\t%s\t%s\n' "$name" "$cat" "$desc"
			found=$((found + 1))
		done
	fi
	return 0
}

# ---------- 结构统计 ----------
stats() {
	local plat="$1"
	local dirs
	dirs=$(platform_dirs "$plat")
	local ent=0 lnk=0 dead=0 d
	while IFS= read -r d; do
		[ -z "$d" ] && continue
		[ -d "$d" ] || continue
		ent=$((ent + $(find "$d" -maxdepth 1 -type d ! -type l | wc -l | tr -d ' ')))
		lnk=$((lnk + $(find "$d" -maxdepth 1 -type l | wc -l | tr -d ' ')))
		dead=$((dead + $(find "$d" -maxdepth 1 -type l ! -exec test -e {} \; | wc -l | tr -d ' ')))
	done < <(platform_dirs "$plat")
	echo "结构: 实体 $ent | 软链 $lnk | 死链 $dead"
}

# ---------- 管理台账模式：--check ----------
check_mode() {
	local plat="$1"
	local tmp
	tmp=$(mktemp)
	scan_platform "$plat" >"$tmp"
	local total
	total=$(wc -l <"$tmp" | tr -d ' ')
	echo "== $plat 平台技能台账 =="
	echo "技能总数: $total"
	stats "$plat"
	echo ""

	# 1. 同名检测（frontmatter name 重复）
	echo "--- [1] 同名检测 ---"
	awk -F'\t' '{print $1}' "$tmp" | sort | uniq -d | while read -r n; do
		echo "  ⚠️ 重复: $n ($(grep -c "^$n$(printf '\t')" "$tmp") 处)"
	done
	[ "$(awk -F'\t' '{print $1}' "$tmp" | sort | uniq -d | wc -l | tr -d ' ')" = "0" ] && echo "  ✓ 无同名"

	# 2. 同类冲突预警
	echo ""
	echo "--- [2] 同类技能分布（>1 需人工确认区分） ---"
	awk -F'\t' '{print $2}' "$tmp" | sort | uniq -c | sort -rn | while read -r cnt cat; do
		if [ "$cnt" -gt 1 ]; then
			echo "  🟡 $cat ($cnt 个): $(awk -F'\t' -v c="$cat" '$2==c{printf "%s ", $1}' "$tmp")"
		fi
	done

	# 3. 摘要
	echo ""
	echo "--- [3] 摘要 ---"
	awk -F'\t' '{print $2}' "$tmp" | sort | uniq -c | sort -rn | awk '{printf "  %s×%s ", $2, $1}'
	echo ""
	rm -f "$tmp"
}

# ---------- 主流程 ----------
MODE="list"
PLAT="${1:-}"
[ "${2:-}" = "--check" ] && MODE="check"

case "${PLAT:-}" in
"")
	echo "用法: catalog.sh <平台> [--check] | all"
	echo "平台: pi workbuddy codex claude trae-ide trae-work"
	exit 1
	;;
"all")
	for p in pi workbuddy codex claude trae-ide trae-work; do
		n=$(scan_platform "$p" 2>/dev/null | wc -l | tr -d ' ')
		printf '  %-10s %s\n' "$p:" "$n 技能"
	done
	;;
*)
	if [ "$MODE" = "check" ]; then
		check_mode "$PLAT"
	else
		echo "== $PLAT 平台技能清单（$(scan_platform "$PLAT" | wc -l | tr -d ' ') 个） =="
		scan_platform "$PLAT" | sort -t$'\t' -k2,2 -k1,1 | while IFS=$'\t' read -r name cat desc; do
			printf '  [%s] %s — %s\n' "$cat" "$name" "${desc:0:70}"
		done
		echo ""
		stats "$PLAT"
	fi
	;;
esac
