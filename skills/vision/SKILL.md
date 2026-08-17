---
name: vision
description: 图像识别。当前模型不具备视觉能力时，用 vision-cli 调视觉模型（mimo-v2.5 主 / agnes-2.0-flash 备）读取本地图片并返回文字描述。当任务需要看图片/截图、识别 UI 布局、OCR 提取图片文字时使用。触发词：看图、识别图片、这张图里有什么、提取图片文字、分析截图、看看这张图。
---

# Vision — 读图转文字

当前模型无视觉能力。需要分析图片时，用本地 CLI 转交给视觉模型识别：

```bash
vision-cli <图片绝对路径> [问题]
```

- **无问题**时默认要求详细描述（主体 / 文字 / 布局 / 颜色 / 风格）
- **模型路由**：`mimo-v2.5`（主）→ `agnes-2.0-flash`（备，自动回退）
- **输出**：模型返回的文字描述

## 用法

1. 先用 bash 定位图片路径（`ls` / `find` / `pwd`）
2. 调 vision-cli：

   ```bash
   vision-cli /path/to/img.png "提取图中所有文字"
   vision-cli /path/to/screenshot.png "描述界面布局和元素"
   vision-cli /path/to/photo.jpg            # 默认详细描述
   ```

3. 把返回的文字当作图片内容继续推理

## 注意

- 只支持**本地图片文件路径**（截图先保存为文件再分析）
- `.heic` 会自动转 png
- 主模型失败自动回退备模型；两者都失败会报错——检查 `~/.config/vision-cli/config.json` 的 apiKey
