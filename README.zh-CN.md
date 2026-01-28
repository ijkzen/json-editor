# JSON Editor（树状视图）

[English](README.md) | [简体中文](README.zh-CN.md)

一个轻量的 JSON 文本编辑 + 树状展示小工具，基于 Angular 21（standalone）、Angular Material 与 Tailwind CSS。

## 功能

- 文本编辑器带“高亮层”，当 JSON 解析失败时，会对错误位置字符进行背景高亮（若能从错误信息中提取 position）。
- 一键格式化 JSON（仅在 JSON 有效时可用）。
- 当 JSON 无效时，树状视图会保持稳定，展示“上一次正确解析结果”。
- 编辑器面板可一键隐藏/显示。
- 内置示例 JSON（可一键重置）。
- 递归树状视图，支持展开/折叠（默认只展开根节点第一层）。
- 类型着色：`string | number | boolean | null | array | object`。
- 长字符串会在树上截断展示；点击可弹窗查看完整内容。
- 智能标签识别：
  - `time`：识别 Unix 时间戳（秒/毫秒）与 ISO 8601 时间字符串；可选在值旁展示格式化时间。
  - `link`：识别 `http(s)://...`（以及 `www.` 开头）并新标签页打开。
  - `email`：识别邮箱并通过 `mailto:` 打开。
  - `phone`：识别手机号/电话样式的字符串或数字。
  - `color`：识别常见 CSS 颜色格式：`#RGB/#RGBA/#RRGGBB/#RRGGBBAA`、`rgb()/rgba()`、`hsl()/hsla()`、以及 `0xAARRGGBB`。
    - 说明：以 `#` 开头的 8 位 hex 可能存在歧义；可在设置中选择按 RGBA（`#RRGGBBAA`）或 ARGB（`#AARRGGBB`）解释。
- 设置弹窗（暗色模式 + 标签开关）；偏好会持久化到 `localStorage`。

## 技术栈

- Angular 21（standalone components）
- Angular Material
- Tailwind CSS
- 单元测试：Angular builder + Vitest

## 快速开始

环境要求：Node.js（LTS）与 `pnpm`（本仓库固定 `pnpm@10`，见 `package.json#packageManager`）。

```bash
pnpm i
pnpm start
```

打开 `http://localhost:4200/` 即可。

## 常用命令

```bash
pnpm start   # 启动开发服务器
pnpm test    # 运行单元测试
pnpm build   # 构建生产包
pnpm watch   # 开发构建（watch 模式）
```

## 代码结构速览

- JSON 解析与错误高亮：`src/app/lib/json-parse.ts`
- App 状态（signals）与示例 JSON：`src/app/app.ts`
- 编辑器叠层高亮：`src/app/components/json-text-editor/`
- 树状渲染组件：`src/app/components/json-tree/`
- 智能标签识别：`src/app/lib/string-tags.ts`
- 标签开关持久化：`src/app/lib/recognition-settings.service.ts`
- 暗色模式持久化：`src/app/lib/theme-settings.service.ts`
