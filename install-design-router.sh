#!/bin/bash
# install-design-router.sh — design-router extension 一键安装
#
# 用法：
#   ./install-design-router.sh              默认：装 pi 平台（extension + 自动补 design-references）
#   ./install-design-router.sh --with-hallmark   同时安装 hallmark skill（第三方，需显式确认）
#   ./install-design-router.sh --all-platforms    design-references 分发到全部已登记平台
#
# 依赖策略（讨论结论）：
#   - extension：必装（8 工具独立工作，不依赖任何 skill）
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
# 统一布局：真身放共享层 ~/.agents/skills（pi 与 DSH 共读），pi 侧软链。
# 禁止往 ~/.pi/agent/skills 复制第二份实体 —— 会与 DSH 在共享层的副本同名冲突（pi 启动报 collision）。
SHARED_DR="$HOME/.agents/skills/design-references"
PI_DR="$HOME/.pi/agent/skills/design-references"
mkdir -p "$HOME/.agents/skills"
if [ -d "$SHARED_DR" ] || [ -L "$PI_DR" ] || [ -f "$PI_DR/SKILL.md" ]; then
  echo "   ✓ 已装，收敛到统一布局（真身共享层 + pi 软链）"
  rm -rf "$PI_DR"   # 旧实体/旧软链一并清除（实体只存在于共享层）
else
  echo "   → 未装，安装到共享层（源码 $SRC/skills/design-references/）"
fi
rsync -a --delete "$SRC/skills/design-references/" "$SHARED_DR/"
ln -sfn ../../../.agents/skills/design-references "$PI_DR"
echo "   ✓ 共享层：$SHARED_DR"
echo "   ✓ pi 软链：$PI_DR -> ~/.agents/skills/design-references"
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
# 同样收敛到共享层 + pi 软链，避免与 DSH 共享层副本同名冲突
HALLMARK_SHARED="$HOME/.agents/skills/hallmark"
HALLMARK_PI="$HOME/.pi/agent/skills/hallmark"
HALLMARK_SKILL="$HALLMARK_PI/SKILL.md"
if [ -f "$HALLMARK_SKILL" ]; then
  ver=$(grep -m1 '^version:' "$HALLMARK_SKILL" | awk '{print $2}' || echo "?")
  echo "   ✓ 已安装（v${ver}）——注入功能完整"
elif [ "$WITH_HALLMARK" = "1" ]; then
  echo "   → --with-hallmark：从 nutlope/hallmark 安装（共享层 + pi 软链）"
  TMP=$(mktemp -d)
  git clone --depth 1 https://github.com/nutlope/hallmark "$TMP/hallmark" 2>/dev/null
  rm -rf "$HALLMARK_PI"
  mkdir -p "$HOME/.agents/skills"
  cp -R "$TMP/hallmark/skills/hallmark/." "$HALLMARK_SHARED/"
  ln -sfn ../../../.agents/skills/hallmark "$HALLMARK_PI"
  rm -rf "$TMP"
  echo "   ✓ hallmark 已安装（v$(grep -m1 '^version:' "$HALLMARK_SKILL" | awk '{print $2}')）"
else
  echo "   ⚠️ 未安装（第三方上游，不默认装）。"
  echo "     影响：注入只含归位映射（inject-map.md），跳过 hallmark 规则；8 个工具不受影响。"
  echo "     要装：$0 --with-hallmark，或手动复制 nutlope/hallmark 的 skills/hallmark/ 到共享层 ~/.agents/skills/hallmark/ 并建 pi 软链"
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
