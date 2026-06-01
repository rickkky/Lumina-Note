import { useEffect } from "react";
import { useCommandMenu } from "@/stores/useCommandMenu";
import {
  useAppActionsSource,
  useAppFilesSource,
  useAppNavigationSource,
  useAppPluginsSource,
} from "./command-menu/sources";

const OPEN_COMMAND_MENU_EVENT = "open-command-menu";

/**
 * CommandMenuProvider — installs the global Cmd/Ctrl+P shortcut and
 * registers the four built-in app sources (actions, navigation, files,
 * plugins). Mount once at the App root, above any route switch.
 *
 * Other feature hooks can call `useCommandMenu.registerSource(id, items)`
 * from anywhere in the tree to add their own commands.
 */
export function CommandMenuProvider() {
  const { toggle, setOpen, registerSource, unregisterSource } =
    useCommandMenu();
  const actions = useAppActionsSource();
  const navigation = useAppNavigationSource();
  const files = useAppFilesSource();
  const plugins = useAppPluginsSource();

  // Cmd/Ctrl+P — open/close the palette.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (!isMod) return;
      if (e.key !== "p" && e.key !== "P") return;
      // Don't fire inside a text input that already handles it (e.g. the
      // editor's own Cmd+P for print).
      const target = e.target as HTMLElement | null;
      if (target?.closest?.(".cm-editor, .ProseMirror")) return;
      e.preventDefault();
      toggle();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [toggle]);

  // External open trigger (Ribbon click, future menu items).
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_COMMAND_MENU_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_COMMAND_MENU_EVENT, onOpen);
  }, [setOpen]);

  useEffect(() => {
    registerSource("app.actions", actions);
    return () => unregisterSource("app.actions");
  }, [actions, registerSource, unregisterSource]);

  useEffect(() => {
    registerSource("app.navigation", navigation);
    return () => unregisterSource("app.navigation");
  }, [navigation, registerSource, unregisterSource]);

  useEffect(() => {
    registerSource("app.files", files);
    return () => unregisterSource("app.files");
  }, [files, registerSource, unregisterSource]);

  useEffect(() => {
    registerSource("app.plugins", plugins);
    return () => unregisterSource("app.plugins");
  }, [plugins, registerSource, unregisterSource]);

  return null;
}
