#!/bin/bash
# my-pi-skills 一键安装
# 用法: ./install.sh [目标skills目录]
# 默认目标: ~/.pi/agent/skills（可传其他平台目录，如 ~/.workbuddy/skills）
set -e
cd "$(dirname "$0")"

SKILLS_DIR="${1:-$HOME/.pi/agent/skills}"
mkdir -p "$SKILLS_DIR" "$HOME/resources" "$HOME/Documents" "$HOME/.local/bin"

# 1. 技能
cp -R skills/* "$SKILLS_DIR/"
echo "✓ skills → $SKILLS_DIR"

# 2. 外部资源（design-references 的素材台账）
cp resources/design-references.md "$HOME/resources/"
echo "✓ resources/design-references.md → ~/resources/"

# 3. 规范源模板（仅当目标不存在时，不覆盖本机已有台账）
[ -f "$HOME/Documents/skill-sync-map.md" ] || cp docs/skill-sync-map.md "$HOME/Documents/"
echo "✓ docs/skill-sync-map.md → ~/Documents/（已存在则跳过）"

# 4. vision-cli（读图转文字）
cp resources/vision-cli "$HOME/.local/bin/vision-cli"
chmod +x "$HOME/.local/bin/vision-cli"
echo "✓ vision-cli → ~/.local/bin/"

echo "完成。重启 agent 后生效。"
