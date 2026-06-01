// Plugin-contributed commands. Subscribes to
// `lumina-plugin-commands-updated` (dispatched by PluginRuntime on
// install/uninstall/hotkey-change) so the source re-registers when the
// plugin set changes.

import { useEffect, useMemo, useState } from "react";
import { Command as CommandIcon } from "lucide-react";
import { pluginRuntime } from "@/services/plugins/runtime";
import type { CommandItem } from "@/stores/useCommandMenu";

const PLUGIN_COMMANDS_UPDATED_EVENT = "lumina-plugin-commands-updated";

export function useAppPluginsSource(): CommandItem[] {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const onUpdate = () => setVersion((v) => v + 1);
    window.addEventListener(PLUGIN_COMMANDS_UPDATED_EVENT, onUpdate);
    return () =>
      window.removeEventListener(PLUGIN_COMMANDS_UPDATED_EVENT, onUpdate);
  }, []);

  return useMemo<CommandItem[]>(() => {
    const commands = pluginRuntime.getRegisteredCommands();
    return commands.map((cmd) => {
      const descriptionParts: string[] = [];
      if (cmd.description) descriptionParts.push(cmd.description);
      if (cmd.groupTitle) descriptionParts.push(cmd.groupTitle);
      if (descriptionParts.length === 0) {
        descriptionParts.push(`Plugin command from ${cmd.pluginId}`);
      }
      return {
        id: `plugin:${cmd.id}`,
        group: "actions" as const,
        title: cmd.title,
        description: descriptionParts.join(" · "),
        icon: <CommandIcon size={16} />,
        shortcut: cmd.hotkey,
        keywords: [cmd.pluginId, ...(cmd.groupTitle ? [cmd.groupTitle] : [])],
        run: () => {
          pluginRuntime.executeCommand(cmd.id);
        },
      };
    });
  }, [version]);
}
