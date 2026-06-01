// Built-in command palette actions (new note, theme, graph, workspace, …).
//
// The only source that participates in usage tracking. Each `run` writes to
// the shared usage map on click, which:
//   1. counts toward "Recent",
//   2. clears the featured "New" badge after first use,
//   3. pings other panes (Ribbon's "unseen featured" dot) via the storage
//      event that `writeUsage` dispatches.
//
// Re-renders when usage changes (via `COMMAND_USAGE_EVENT`) so the badge
// clears and the Recent section updates without a Cmd+P reload.

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Sun,
  Moon,
  Network,
  FolderOpen,
  Search,
  Settings as SettingsIcon,
  MessageSquarePlus,
} from "lucide-react";
import { useLocaleStore } from "@/stores/useLocaleStore";
import { useUIStore } from "@/stores/useUIStore";
import { useFileStore } from "@/stores/useFileStore";
import { useOpencodeAgent } from "@/stores/useOpencodeAgent";
import {
  COMMAND_USAGE_EVENT,
  readUsage,
  writeUsage,
} from "@/lib/commandPaletteUsage";
import type { CommandItem } from "@/stores/useCommandMenu";

const makeTrackedRun = (id: string, action: () => void) => () => {
  const usage = readUsage();
  writeUsage({
    ...usage,
    [id]: {
      count: (usage[id]?.count ?? 0) + 1,
      lastUsed: Date.now(),
    },
  });
  action();
};

export function useAppActionsSource(): CommandItem[] {
  const { t } = useLocaleStore();

  const isDarkMode = useUIStore((s) => s.isDarkMode);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const setSkillManagerOpen = useUIStore((s) => s.setSkillManagerOpen);

  const createNewFile = useFileStore((s) => s.createNewFile);
  const openGraphTab = useFileStore((s) => s.openGraphTab);
  const clearVault = useFileStore((s) => s.clearVault);
  const vaultPath = useFileStore((s) => s.vaultPath);
  const tabs = useFileStore((s) => s.tabs);
  const isGraphOpen = tabs.some((tab) => tab.type === "graph");

  const newSession = useOpencodeAgent((s) => s.newSession);

  // Bump a counter when the shared usage map changes, so the memo below
  // recomputes and the host re-registers. We don't need the usage value
  // here — `readUsage` is called fresh at click time.
  const [usageVersion, setUsageVersion] = useState(0);
  useEffect(() => {
    const onUpdate = () => setUsageVersion((v) => v + 1);
    window.addEventListener(COMMAND_USAGE_EVENT, onUpdate);
    return () => window.removeEventListener(COMMAND_USAGE_EVENT, onUpdate);
  }, []);

  return useMemo<CommandItem[]>(
    () => [
      {
        id: "new-note",
        group: "actions",
        title: t.commandMenu.newNote,
        description: t.commandMenu.newNoteDesc,
        icon: <Plus size={16} />,
        shortcut: "Ctrl+N",
        keywords: ["new", "note", "create", "markdown", "file"],
        run: makeTrackedRun("new-note", () => {
          void createNewFile();
        }),
      },
      {
        id: "new-chat",
        group: "actions",
        title: t.commandMenu.newChat,
        description: t.commandMenu.newChatDesc,
        icon: <MessageSquarePlus size={16} />,
        keywords: ["new", "chat", "ai", "agent", "session", "conversation"],
        run: makeTrackedRun("new-chat", () => {
          void newSession();
        }),
      },
      {
        id: "open-skill-manager",
        group: "actions",
        title: t.commandMenu.openSkillManager,
        description: t.commandMenu.openSkillManagerDesc,
        icon: <SettingsIcon size={16} />,
        keywords: ["skill", "manager", "settings"],
        run: makeTrackedRun("open-skill-manager", () => {
          setSkillManagerOpen(true);
        }),
      },
      {
        id: "toggle-theme",
        group: "actions",
        title: isDarkMode ? t.commandMenu.toggleToLight : t.commandMenu.toggleToDark,
        description: t.commandMenu.toggleThemeDesc,
        icon: isDarkMode ? <Sun size={16} /> : <Moon size={16} />,
        keywords: ["theme", "dark", "light", "mode", "appearance"],
        run: makeTrackedRun("toggle-theme", () => {
          toggleTheme();
        }),
      },
      {
        id: "show-graph",
        group: "actions",
        title: isGraphOpen ? t.commandMenu.switchToGraph : t.commandMenu.openGraph,
        description: t.commandMenu.graphDesc,
        icon: <Network size={16} />,
        keywords: ["graph", "view", "connections", "links"],
        run: makeTrackedRun("show-graph", () => {
          openGraphTab();
        }),
      },
      {
        id: "switch-workspace",
        group: "actions",
        title: t.commandMenu.switchWorkspace,
        description: `${t.commandMenu.current}: ${vaultPath ? vaultPath.split(/[\/\\]/).pop() : t.commandMenu.notSelected}`,
        icon: <FolderOpen size={16} />,
        keywords: ["workspace", "vault", "folder", "switch", "open"],
        run: makeTrackedRun("switch-workspace", () => {
          clearVault();
        }),
      },
      {
        id: "global-search",
        group: "actions",
        title: t.commandMenu.globalSearch,
        description: t.commandMenu.globalSearchDesc,
        icon: <Search size={16} />,
        shortcut: "Ctrl+Shift+F",
        keywords: ["search", "find", "global", "all", "content"],
        run: makeTrackedRun("global-search", () => {
          window.dispatchEvent(new CustomEvent("open-global-search"));
        }),
      },
    ],
    [
      t,
      isDarkMode,
      toggleTheme,
      setSkillManagerOpen,
      createNewFile,
      openGraphTab,
      clearVault,
      vaultPath,
      isGraphOpen,
      newSession,
      usageVersion,
    ],
  );
}
