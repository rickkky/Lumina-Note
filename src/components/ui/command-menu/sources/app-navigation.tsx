// Sidebar toggles. Lives in its own source so its group header reads
// "Navigation" rather than getting lost in the Actions list.

import { useMemo } from "react";
import { PanelLeft, PanelRight } from "lucide-react";
import { useLocaleStore } from "@/stores/useLocaleStore";
import { useUIStore } from "@/stores/useUIStore";
import type { CommandItem } from "@/stores/useCommandMenu";

export function useAppNavigationSource(): CommandItem[] {
  const { t } = useLocaleStore();
  const toggleLeftSidebar = useUIStore((s) => s.toggleLeftSidebar);
  const toggleRightSidebar = useUIStore((s) => s.toggleRightSidebar);

  return useMemo<CommandItem[]>(
    () => [
      {
        id: "toggle-left-sidebar",
        group: "navigation",
        title: t.commandMenu.toggleLeftSidebar,
        description: t.commandMenu.toggleLeftSidebarDesc,
        icon: <PanelLeft size={16} />,
        shortcut: "Ctrl+B",
        keywords: ["sidebar", "left", "navigation", "explorer", "files"],
        run: () => toggleLeftSidebar(),
      },
      {
        id: "toggle-right-sidebar",
        group: "navigation",
        title: t.commandMenu.toggleRightSidebar,
        description: t.commandMenu.toggleRightSidebarDesc,
        icon: <PanelRight size={16} />,
        keywords: ["sidebar", "right", "outline", "backlinks", "ai"],
        run: () => toggleRightSidebar(),
      },
    ],
    [t, toggleLeftSidebar, toggleRightSidebar],
  );
}
