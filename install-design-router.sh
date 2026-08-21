#!/bin/bash
# install-design-router.sh — design-router extension 一键安装
#
# 用法：
#   ./install-design-router.sh              默认：装 pi 平台（extension + 自动补 design-references）
#   ./install-design-router.sh --with-hallmark   同时安装 hallmark skill（第三方，需显式确认）
#   ./install-design-router.sh --all-platforms    design-references 分发到全部已登记平台
#
# 依赖策略（讨论结论）：
#   - extension：必装（4 工具独立工作，不依赖任何 skill）
#   - design-references skill：自己的资产，缺则自动补装
#   - hallmark skill：第三方上游（nutlope/hallmark），默认只检测提示，装需 --with-hallmark
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="$HOME/.pi/agent/extensions/design-router"
PLATFORMS=(pi workbuddy codex claude trae-ide trae-work)

WITH_HALLMARK=0
ALL_PLATFORMS=0
for a in "$@"; do
  case "$a" in
    --with-hallmark) WITH_HALLMARK=1 ;;
    --all-platforms) ALL_PLATFORMS=1 ;;
    *) echo "未知参数: $a"; exit 1 ;;
  esac
done

echo "== 1/4 分发 extension → $DEST"
mkdir -p "$(dirname "$DEST")"
rsync -a --delete --exclude 'tests/' "$SRC/extensions/design-router/" "$DEST/"
echo "   ✓ $(find "$DEST" -name '*.ts' -o -name '*.mjs' -o -name '*.json' -o -name '*.md' | wc -l | tr -d ' ') 个文件"

echo "== 2/4 design-references skill（自己的资产，自动补装）"
if [ -d "$HOME/.pi/agent/skills/design-references" ]; then
  echo "   ✓ pi 已有（$([ -f "$HOME/.pi/agent/skills/design-references/SKILL.md" ] && echo SKILL.md 就绪 || echo 缺 SKILL.md)）"
else
  echo "   → pi 未装，自动补装（源码 $SRC/skills/design-references/）"
  rsync -a --delete "$SRC/skills/design-references/" "$HOME/.pi/agent/skills/design-references/"
  echo "   ✓ 已补装"
fi
if [ "$ALL_PLATFORMS" = "1" ]; then
  for p in workbuddy codex claude trae-ide trae-work; do
    dst="$HOME/.$([ "$p" = "trae-ide" ] && echo trae-cn || echo $p)/skills"
    [ "$p" = "trae-work" ] && dst="$HOME/.trae/skills"
    if [ -d "$dst" ]; then
      rsync -a --delete "$SRC/skills/design-references/" "$dst/design-references/"
      echo "   ✓ 分发到 $p"
    fi
  done
fi

echo "== 3/4 hallmark skill（第三方软依赖）"
HALLMARK_SKILL="$HOME/.pi/agent/skills/hallmark/SKILL.md"
if [ -f "$HALLMARK_SKILL" ]; then
  ver=$(grep -m1 '^version:' "$HALLMARK_SKILL" | awk '{print $2}' || echo "?")
  echo "   ✓ 已安装（v${ver}）——注入功能完整"
elif [ "$WITH_HALLMARK" = "1" ]; then
  echo "   → --with-hallmark：从 nutlope/hallmark 安装"
  TMP=$(mktemp -d)
  git clone --depth 1 https://github.com/nutlope/hallmark "$TMP/hallmark" 2>/dev/null
  mkdir -p "$HOME/.pi/agent/skills/hallmark"
  cp -R "$TMP/hallmark/skills/hallmark/." "$HOME/.pi/agent/skills/hallmark/"
  rm -rf "$TMP"
  echo "   ✓ hallmark 已安装（v$(grep -m1 '^version:' "$HALLMARK_SKILL" | awk '{print $2}')）"
else
  echo "   ⚠️ 未安装（第三方上游，不默认装）。"
  echo "     影响：注入只含归位映射（inject-map.md），跳过 hallmark 规则；4 个工具不受影响。"
  echo "     要装：$0 --with-hallmark，或手动复制 nutlope/hallmark 的 skills/hallmark/ 到 ~/.pi/agent/skills/hallmark/"
fi

echo "== 4/4 自检"
if node "$DEST/tests/self-test.ts" >/dev/null 2>&1 || [ ! -f "$DEST/tests/self-test.ts" ]; then
  if [ -f "$SRC/extensions/design-router/tests/self-test.ts" ]; then
    node "$SRC/extensions/design-router/tests/self-test.ts" && echo "   ✓ 自检通过"
  fi
else
  echo "   ⚠️ 自检失败，见上方输出"
fi

echo ""
echo "✅ 安装完成。在 pi 内 /reload 或重启生效。"
echo "   验证：pi 里说'帮我做个落地页'（触发注入），或 /design-router status 看状态与版本配套。"
