#!/bin/bash
# ============================================================
# skill-router · catalog.sh —— 本机技能运行时扫描器（唯一数据源）
#
# 用法：
#   catalog.sh <平台>            列出该平台全部可见技能（分类）
#   catalog.sh <平台> --check    管理台账模式：同名检测 + 同类冲突预警 + 结构统计
#   catalog.sh all               列出所有平台技能数概览（已登记 + 自动发现）
#
# 平台：
#   已登记：pi / workbuddy / codex / claude / trae-ide / trae-work
#   自动发现：catalog.sh 每次运行先扫描 $HOME 下所有含 SKILL.md 的隐藏 skills 目录
#   （.qwen / .roo / .tabnine/agent 等），发现的平台名均可直接查询
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

# ---------- 自动发现本机 agent 平台 ----------
# 探测前置：扫描 $HOME 下所有隐藏目录的 skills 位置（惰性扫描先发现，再查台账）
# 一层 ~/.<name>/skills，两层 ~/.<name>/agent/skills（如 pi、tabnine）
# 输出: 平台名<TAB>目录（已排除已登记平台与噪音路径）
discover_platforms() {
	local known
	known=$(platform_dirs pi; platform_dirs workbuddy; platform_dirs codex; platform_dirs claude; platform_dirs trae-ide; platform_dirs trae-work)
	{
		local d
		for d in "$H"/.[a-zA-Z0-9_-]*/skills; do
			[ -d "$d" ] || continue
			# 仅当含 SKILL.md 才算平台（-L 跟随软链，滤掉空目录/纯资源目录）
			[ -n "$(find "$d" -maxdepth 2 -name SKILL.md 2>/dev/null | head -1)" ] || continue
			echo "$d"
		done
		for d in "$H"/.[a-zA-Z0-9_-]*/agent/skills; do
			[ -d "$d" ] || continue
			[ -n "$(find "$d" -maxdepth 2 -name SKILL.md 2>/dev/null | head -1)" ] || continue
			echo "$d"
		done
	} | sort -u | while IFS= read -r d; do
		# 跳过已登记平台目录（pi/.agents/workbuddy/codex/claude/trae-cn/trae）
		echo "$known" | grep -qxF "$d" && continue
		local name
		name=$(printf '%s' "$d" | sed "s|^$H/||; s|/agent/skills$||; s|/skills$||" | tr -d '.')
		printf '%s\t%s\n' "$name" "$d"
	done
}

# ---------- 目录解析：先查已登记映射，再查自动发现 ----------
resolve_dirs() {
	local plat="$1" dirs
	dirs=$(platform_dirs "$plat")
	if [ -z "$dirs" ]; then
		dirs=$(printf '%s\n' "$DISCOVERED" | awk -F'\t' -v p="$plat" '$1==p{print $2}')
	fi
	echo "$dirs"
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
	dirs=$(resolve_dirs "$plat")
	if [ -z "$dirs" ]; then
		echo "未知平台: ${plat}（已登记: pi/workbuddy/codex/claude/trae-ide/trae-work；或跑 catalog.sh all 看自动发现平台）" >&2
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
	done < <(resolve_dirs "$plat")
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
	dirs=$(resolve_dirs "$plat")
	local ent=0 lnk=0 dead=0 d
	while IFS= read -r d; do
		[ -z "$d" ] && continue
		[ -d "$d" ] || continue
		ent=$((ent + $(find "$d" -maxdepth 1 -type d ! -type l | wc -l | tr -d ' ')))
		lnk=$((lnk + $(find "$d" -maxdepth 1 -type l | wc -l | tr -d ' ')))
		dead=$((dead + $(find "$d" -maxdepth 1 -type l ! -exec test -e {} \; | wc -l | tr -d ' ')))
	done < <(resolve_dirs "$plat")
	echo "结构: 实体 $ent | 软链 $lnk | 死链 $dead"
}

# ---------- 单技能在某平台的版本 ----------
# 返回 frontmatter version；无 version 字段则返回 SKILL.md 哈希前 6 位（用于漂移检测）
platform_skill_version() {
	local plat="$1" name="$2"
	local dirs d f
	dirs=$(resolve_dirs "$plat")
	while IFS= read -r d; do
		[ -z "$d" ] && continue
		f="$d/$name/SKILL.md"
		[ -f "$f" ] || continue
		local v
		v=$(get_frontmatter "$f" version)
		if [ -n "$v" ]; then
			echo "$v"
		else
			md5 -q "$f" 2>/dev/null | cut -c1-6
		fi
		return
	done <<< "$dirs"
	echo ""
}

# ---------- 技能路由矩阵（sync 用）：技能 × 平台（版本） ----------
# 输出 markdown 表格到 stdout；✗ = 该平台无此技能
build_matrix() {
	# 真实平台：已登记 + 自动发现（去重）
	local platlist
	platlist=$(printf '%s\n' pi workbuddy codex claude trae-ide trae-work)
	if [ -n "$DISCOVERED" ]; then
		platlist=$(printf '%s\n%s\n' "$platlist" "$(printf '%s\n' "$DISCOVERED" | cut -f1)")
	fi
	platlist=$(printf '%s\n' "$platlist" | sort -u | tr '\n' ' ')

	# 所有技能名（跨平台 union）
	local names p
	names=$(for p in $platlist; do
		scan_platform "$p" 2>/dev/null | cut -f1
	done | sort -u)

	# 表头
	printf '| 技能 |'
	for p in $platlist; do printf ' %s |' "$p"; done
	echo ""
	printf '%s' '|---|'
	for p in $platlist; do printf '%s' '---|'; done
	echo ""

	# 每技能一行
	local name row ver
	while IFS= read -r name; do
		[ -z "$name" ] && continue
		row="| $name |"
		for p in $platlist; do
			ver=$(platform_skill_version "$p" "$name")
			[ -z "$ver" ] && ver="✗"
			row="$row $ver |"
		done
		echo "$row"
	done <<< "$names"
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

# 探测前置：自动发现本机实际存在的 agent 平台（一次扫描，供查询/all 复用）
DISCOVERED="$(discover_platforms)"

case "${PLAT:-}" in
"")
	echo "用法: catalog.sh <平台> [--check] | all"
	echo "平台: 已登记(pi workbuddy codex claude trae-ide trae-work) + 自动发现平台; all 列出全部"
	exit 1
	;;
"all")
	echo "== 已登记平台 =="
	for p in pi workbuddy codex claude trae-ide trae-work; do
		n=$(scan_platform "$p" 2>/dev/null | wc -l | tr -d ' ')
		printf '  %-12s %s\n' "$p:" "$n 技能"
	done
	echo ""
	nd=$(printf '%s\n' "$DISCOVERED" | grep -c .)
	echo "== 自动发现平台（$nd 个） =="
	if [ "$nd" = "0" ]; then
		echo "  （未发现新平台）"
	else
		while IFS=$'\t' read -r name dir; do
			n=$(scan_platform "$name" 2>/dev/null | wc -l | tr -d ' ')
			printf '  %-12s %s\n' "$name:" "$n 技能"
		done <<< "$DISCOVERED"
	fi
	;;
"matrix")
	build_matrix
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
