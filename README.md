<div align="center">

<img src="build-resources/icon.png" alt="Lumina Note Logo" width="120" height="120" />

# Lumina Note

**Local-first AI workspace for Markdown knowledge bases**

Lumina Note combines a local Markdown vault, WikiLinks, a knowledge graph, and an opencode-backed agent that can read, write, organize, and research with your permission.

[![GitHub Release](https://img.shields.io/github/v/release/blueberrycongee/Lumina-Note?style=flat-square)](https://github.com/blueberrycongee/Lumina-Note/releases)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=flat-square)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-41-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![CI](https://img.shields.io/github/actions/workflow/status/blueberrycongee/Lumina-Note/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/blueberrycongee/Lumina-Note/actions/workflows/ci.yml)
[![Security Audit](https://img.shields.io/github/actions/workflow/status/blueberrycongee/Lumina-Note/security-audit.yml?branch=main&style=flat-square&label=Security%20Audit)](https://github.com/blueberrycongee/Lumina-Note/actions/workflows/security-audit.yml)
[![Downloads](https://img.shields.io/github/downloads/blueberrycongee/Lumina-Note/total?style=flat-square)](https://github.com/blueberrycongee/Lumina-Note/releases)
[![GitHub Stars](https://img.shields.io/github/stars/blueberrycongee/Lumina-Note?style=flat-square)](https://github.com/blueberrycongee/Lumina-Note/stargazers)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square)

**Languages**: English (canonical) · [简体中文](./README.zh-CN.md) · [繁體中文](./README.zh-TW.md) · [日本語](./README.ja.md) · [한국어](./README.ko.md) · [Español](./README.es.md) · [Français](./README.fr.md) · [Deutsch](./README.de.md) · [Italiano](./README.it.md) · [Português (Brasil)](./README.pt-BR.md) · [Русский](./README.ru.md)

</div>

---

## Why Lumina Note

Lumina is built for people who want AI help without turning their notes into someone else's database.

- **Local-first vault**: your notes are normal files on disk. You choose when model providers, sync services, or cloud features receive data.
- **Knowledge-native editing**: Markdown, `[[WikiLinks]]`, backlinks, local graph, global graph, PDFs, annotations, and flashcards live in one workspace.
- **An agent that can act**: the AI agent can inspect relevant vault files, edit notes, run skills, use tools, and keep its work visible instead of staying in a chat-only box.
- **Bring your own model**: use OpenAI, Anthropic Claude, Google Gemini, DeepSeek, Moonshot Kimi, Zhipu GLM, MiMo, Qwen through compatible routes, Groq, OpenRouter, Ollama, or any OpenAI-compatible endpoint.

## Screenshots

<p align="center">
  <img src="docs/screenshots/ai-agent.png" alt="AI Agent" width="800" />
</p>

<p align="center">
  <img src="docs/screenshots/knowledge-graph.png" alt="Knowledge Graph" width="800" />
</p>

<p align="center">
  <img src="docs/screenshots/editor-latex.png" alt="Markdown editor with LaTeX" width="800" />
</p>

## Core Features

### AI workspace

- Agent mode for editing, planning, research, and task automation.
- Embedded opencode runtime: Electron main starts an in-process opencode HTTP/WS server, and the renderer talks to it through `@opencode-ai/sdk/client`.
- Provider settings bridge: Lumina maps the provider, model, API key, base URL, and license-gated options into the isolated opencode runtime.
- Tool and permission flow for file edits, generated images, skills, and future agent extensions.
- Optional Lumina Cloud provider for licensed users who do not want to configure their own model API keys.

### Notes and knowledge graph

- Markdown source, live preview, and reading modes.
- `[[WikiLinks]]`, backlinks, hover previews, and note-aware autocomplete.
- Global knowledge graph plus local graph for the current note.
- LaTeX, Mermaid, code highlighting, images, and PDF reading.
- Highlight, underline, and annotate PDFs, then save annotations as Markdown.

### Workflow tools

- Full-vault search and image management.
- Selection toolbar actions, conversation export, and custom slash commands.
- Flashcard generation and review.
- Real-time voice input.
- 15 built-in themes plus custom appearance controls.
- WebDAV sync, same-LAN mobile pairing, and optional self-hosted relay sync.

### Extension ecosystem

- Developer-preview plugin runtime with workspace, user, and built-in plugin roots.
- Runtime permissions for plugin capabilities.
- Slash command, command palette, ribbon, status bar, editor, render, theme, storage, network, and timer APIs.
- Agent skills from workspace, user, and built-in locations.

## Download

Get the latest build from [Releases](https://github.com/blueberrycongee/Lumina-Note/releases).

| Platform | Package |
| --- | --- |
| Windows | `.exe` NSIS installer |
| macOS Apple Silicon / Intel | `.dmg` / `.zip` |
| Linux x64 | `.AppImage` |

## Quick Start

1. Install Lumina Note from Releases.
2. Choose a local folder as your vault.
3. Open **Settings -> AI** and configure a model provider. Use your own API key, Ollama, an OpenAI-compatible endpoint, or a Lumina Cloud license if you have one.
4. Create a note, link it with `[[WikiLinks]]`, and open the graph.
5. Open the AI panel and ask the agent to help with a note, a folder, or a specific writing task.

## Build from Source

Requirements:

- Node.js 22+
- npm
- Bun, only for building the embedded opencode server bundle

Fresh checkout setup:

```bash
git clone https://github.com/blueberrycongee/Lumina-Note.git
cd Lumina-Note
npm install

# Required before npm run dev can resolve virtual:opencode-server.
git clone https://github.com/anomalyco/opencode thirdparty/opencode
(cd thirdparty/opencode && bun install)
npm run opencode:bundle

npm run dev
```

Common commands:

```bash
npm run typecheck
npm run test:run
npm run build
npm run stage:native
npm run dist:mac
npm run dist:win
npm run dist:linux
```

For more detail on the agent runtime setup, see [`docs/agent-runtime-setup.md`](docs/agent-runtime-setup.md).

## Architecture

| Layer | Implementation |
| --- | --- |
| Desktop shell | Electron 41, Chromium, Node.js main process |
| Renderer | React 18, TypeScript, Tailwind CSS, Zustand |
| Editor | CodeMirror 6 plus Lumina's Markdown, WikiLink, PDF, and graph surfaces |
| Agent runtime | Embedded opencode server in Electron main, exposed to the renderer through `@opencode-ai/sdk/client` |
| Provider bridge | Lumina settings store -> opencode config/auth environment, isolated from the user's own opencode CLI config |
| Plugins | First-party plugin runtime plus `@lumina/plugin-api` and `@lumina/plugin-ui` packages |
| Mobile | Native iOS SwiftUI and Android Kotlin + Jetpack Compose apps under `mobile/` |
| Optional relay | Rust + axum + sqlx + Yjs CRDT server under `server/` |

## Documentation

- User guide: [`docs/user-flow.md`](docs/user-flow.md)
- 简体中文用户指南: [`docs/user-flow.zh-CN.md`](docs/user-flow.zh-CN.md)
- Agent runtime setup: [`docs/agent-runtime-setup.md`](docs/agent-runtime-setup.md)
- Self-hosted relay: [`docs/self-host.md`](docs/self-host.md)
- Plugin ecosystem: [`docs/plugin-ecosystem.md`](docs/plugin-ecosystem.md)
- Appearance plugin guide: [`docs/appearance-plugin-guide.md`](docs/appearance-plugin-guide.md)
- Mobile apps: [`mobile/README.md`](mobile/README.md)

## Open Source Components

- Editor core: [codemirror-live-markdown](https://github.com/blueberrycongee/codemirror-live-markdown)
- Agent runtime foundation: [opencode](https://github.com/anomalyco/opencode)

## Contributors

<a href="https://github.com/blueberrycongee/Lumina-Note/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=blueberrycongee/Lumina-Note" />
</a>

## License

[Apache License 2.0](LICENSE)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=blueberrycongee/Lumina-Note&type=Date)](https://star-history.com/#blueberrycongee/Lumina-Note&Date)
