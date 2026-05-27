<div align="center">

<img src="build-resources/icon.png" alt="Lumina Note Logo" width="120" height="120" />

# Lumina Note

**本地优先的 Markdown 知识库 AI 工作台**

Lumina Note 把本地 Markdown 笔记库、`[[WikiLinks]]`、知识图谱和基于 opencode 的 Agent 放在同一个桌面应用里。Agent 可以在你允许的范围内读取、编辑、整理和研究你的笔记。

[![GitHub Release](https://img.shields.io/github/v/release/blueberrycongee/Lumina-Note?style=flat-square)](https://github.com/blueberrycongee/Lumina-Note/releases)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=flat-square)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-41-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![CI](https://img.shields.io/github/actions/workflow/status/blueberrycongee/Lumina-Note/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/blueberrycongee/Lumina-Note/actions/workflows/ci.yml)
[![Security Audit](https://img.shields.io/github/actions/workflow/status/blueberrycongee/Lumina-Note/security-audit.yml?branch=main&style=flat-square&label=Security%20Audit)](https://github.com/blueberrycongee/Lumina-Note/actions/workflows/security-audit.yml)
[![Downloads](https://img.shields.io/github/downloads/blueberrycongee/Lumina-Note/total?style=flat-square)](https://github.com/blueberrycongee/Lumina-Note/releases)
[![GitHub Stars](https://img.shields.io/github/stars/blueberrycongee/Lumina-Note?style=flat-square)](https://github.com/blueberrycongee/Lumina-Note/stargazers)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square)

**语言**： [English](./README.md) · 简体中文（维护版） · [繁體中文](./README.zh-TW.md) · [日本語](./README.ja.md) · [한국어](./README.ko.md) · [Español](./README.es.md) · [Français](./README.fr.md) · [Deutsch](./README.de.md) · [Italiano](./README.it.md) · [Português (Brasil)](./README.pt-BR.md) · [Русский](./README.ru.md)

</div>

---

## 为什么选择 Lumina Note

Lumina 面向的是希望用 AI 辅助知识工作，但又不想把整个笔记库交给云端平台的人。

- **本地优先的笔记库**：笔记是磁盘上的普通文件。是否发送给模型服务商、同步服务或云功能，由你决定。
- **围绕知识工作流设计**：Markdown、`[[WikiLinks]]`、反向链接、局部图谱、全局图谱、PDF、批注和闪卡在同一个工作区里。
- **能行动的 Agent**：AI 不只是聊天。它可以查看相关笔记、编辑文件、运行技能、使用工具，并把执行过程展示出来。
- **模型由你选择**：支持 OpenAI、Anthropic Claude、Google Gemini、DeepSeek、Moonshot Kimi、智谱 GLM、MiMo、通过兼容通道接入的 Qwen、Groq、OpenRouter、Ollama，以及任意 OpenAI-compatible endpoint。

## 界面预览

<p align="center">
  <img src="docs/screenshots/ai-agent.png" alt="AI Agent" width="800" />
</p>

<p align="center">
  <img src="docs/screenshots/knowledge-graph.png" alt="知识图谱" width="800" />
</p>

<p align="center">
  <img src="docs/screenshots/editor-latex.png" alt="支持 LaTeX 的 Markdown 编辑器" width="800" />
</p>

## 核心功能

### AI 工作区

- Agent 模式支持编辑、规划、研究和任务自动化。
- 内置 opencode 运行时：Electron main 进程启动进程内 opencode HTTP/WS server，renderer 通过 `@opencode-ai/sdk/client` 与它通信。
- Provider 配置桥接：Lumina 会把 provider、model、API key、base URL 和许可证相关配置映射进隔离的 opencode runtime。
- 支持文件编辑、图片生成、技能和后续 Agent 扩展所需的工具与权限流程。
- 可选 Lumina Cloud provider：适合不想自己配置模型 API key 的许可证用户。

### 笔记与知识图谱

- Markdown 源码、实时预览和阅读模式。
- `[[WikiLinks]]`、反向链接、悬停预览和笔记补全。
- 全局知识图谱，以及围绕当前笔记的局部图谱。
- LaTeX、Mermaid、代码高亮、图片和 PDF 阅读。
- PDF 高亮、下划线和批注，并可把批注保存为 Markdown。

### 工作流工具

- 全库搜索和图片管理。
- 选中文本工具栏、对话导出和自定义 slash command。
- 闪卡生成与复习。
- 实时语音输入。
- 15 套内置主题和自定义外观能力。
- WebDAV 同步、同局域网移动端配对，以及可选自部署中继同步。

### 扩展生态

- 开发者预览阶段的插件运行时，支持 workspace、user 和 built-in 三类插件目录。
- 插件能力的运行时权限模型。
- Slash command、命令面板、Ribbon、状态栏、编辑器、渲染、主题、存储、网络和定时器 API。
- 支持 workspace / user / built-in 位置的 Agent skills。

## 下载

从 [Releases](https://github.com/blueberrycongee/Lumina-Note/releases) 获取最新版本。

| 平台 | 安装包 |
| --- | --- |
| Windows | `.exe` NSIS 安装包 |
| macOS Apple Silicon / Intel | `.dmg` / `.zip` |
| Linux x64 | `.AppImage` |

## 快速开始

1. 从 Releases 安装 Lumina Note。
2. 选择一个本地文件夹作为 vault。
3. 打开 **Settings -> AI** 配置模型服务商。你可以使用自己的 API key、Ollama、OpenAI-compatible endpoint，或已持有的 Lumina Cloud 许可证。
4. 创建笔记，用 `[[WikiLinks]]` 建立连接，然后打开图谱查看关系。
5. 打开 AI 面板，让 Agent 帮你处理某篇笔记、某个文件夹或具体写作任务。

## 从源码构建

环境要求：

- Node.js 22+
- npm
- Bun，仅用于构建内置 opencode server bundle

新机器首次设置：

```bash
git clone https://github.com/blueberrycongee/Lumina-Note.git
cd Lumina-Note
npm install

# npm run dev 需要先让 virtual:opencode-server 能解析到本地 bundle。
git clone https://github.com/anomalyco/opencode thirdparty/opencode
(cd thirdparty/opencode && bun install)
npm run opencode:bundle

npm run dev
```

常用命令：

```bash
npm run typecheck
npm run test:run
npm run build
npm run stage:native
npm run dist:mac
npm run dist:win
npm run dist:linux
```

Agent runtime 的详细设置见 [`docs/agent-runtime-setup.md`](docs/agent-runtime-setup.md)。

## 技术架构

| 层级 | 实现 |
| --- | --- |
| 桌面壳 | Electron 41、Chromium、Node.js main process |
| Renderer | React 18、TypeScript、Tailwind CSS、Zustand |
| 编辑器 | CodeMirror 6，以及 Lumina 的 Markdown、WikiLink、PDF 和图谱界面 |
| Agent runtime | Electron main 内嵌 opencode server，通过 `@opencode-ai/sdk/client` 暴露给 renderer |
| Provider bridge | Lumina 设置存储 -> opencode config/auth 环境，并与用户自己的 opencode CLI 配置隔离 |
| 插件 | 第一方插件运行时，以及 `@lumina/plugin-api`、`@lumina/plugin-ui` packages |
| 移动端 | `mobile/` 下的 iOS SwiftUI 和 Android Kotlin + Jetpack Compose 原生应用 |
| 可选中继 | `server/` 下的 Rust + axum + sqlx + Yjs CRDT 服务 |

## 文档

- 用户指南：[`docs/user-flow.md`](docs/user-flow.md)
- 简体中文用户指南：[`docs/user-flow.zh-CN.md`](docs/user-flow.zh-CN.md)
- Agent runtime 设置：[`docs/agent-runtime-setup.md`](docs/agent-runtime-setup.md)
- 自部署中继：[`docs/self-host.md`](docs/self-host.md)
- 插件生态：[`docs/plugin-ecosystem.md`](docs/plugin-ecosystem.md)
- 外观插件指南：[`docs/appearance-plugin-guide.md`](docs/appearance-plugin-guide.md)
- 移动端应用：[`mobile/README.md`](mobile/README.md)

## 开源组件

- 编辑器核心：[codemirror-live-markdown](https://github.com/blueberrycongee/codemirror-live-markdown)
- Agent runtime 基础：[opencode](https://github.com/anomalyco/opencode)

## 贡献者

<a href="https://github.com/blueberrycongee/Lumina-Note/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=blueberrycongee/Lumina-Note" />
</a>

## 许可证

[Apache License 2.0](LICENSE)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=blueberrycongee/Lumina-Note&type=Date)](https://star-history.com/#blueberrycongee/Lumina-Note&Date)
