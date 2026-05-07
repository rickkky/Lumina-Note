import { ViewPlugin, type ViewUpdate, type EditorView } from "@codemirror/view";
import { parseInlineMarkdown } from "@/services/markdown/markdown";

const SOURCE_ATTR = "data-lumina-md-source";

// Render inline markdown into the read-only table widgets emitted by
// codemirror-live-markdown's `tableField`. The plugin mutates cell DOM
// directly: when CM rebuilds a widget after a content change, the cells
// arrive without our marker attribute and we re-render; when the widget
// is reused (eq() returned true), our marker is still in place and we
// skip. We deliberately ignore `.cm-table-editor` cells — those are
// contentEditable and rendering would conflate source with output.
function renderTableCells(view: EditorView): void {
  const cells = view.dom.querySelectorAll<HTMLElement>(
    `.cm-table-widget td:not([${SOURCE_ATTR}]), .cm-table-widget th:not([${SOURCE_ATTR}])`,
  );
  cells.forEach((cell) => {
    const source = cell.textContent ?? "";
    cell.setAttribute(SOURCE_ATTR, source);
    if (!source) return;
    cell.innerHTML = parseInlineMarkdown(source);
  });
}

export const tableInlineMarkdownPlugin = ViewPlugin.fromClass(
  class {
    constructor(view: EditorView) {
      queueMicrotask(() => renderTableCells(view));
    }
    update(u: ViewUpdate) {
      queueMicrotask(() => renderTableCells(u.view));
    }
  },
);
