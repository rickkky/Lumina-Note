import type { EditorMode } from "@/stores/useUIStore";

export const EDITOR_MODE_CHANGE_EVENT = "lumina-editor-mode-change";

export interface EditorModeChangeDetail {
  mode: EditorMode;
}
