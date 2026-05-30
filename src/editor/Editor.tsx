import { useEffect, useCallback, useRef, useState, useLayoutEffect, type RefObject } from "react";
import { useFileStore } from "@/stores/useFileStore";
import { useNoteHoverPreview } from "@/lib/useWikiLinkHover";
import { NoteHoverPreview } from "@/components/wiki/WikiLinkHoverCard";
import { useShallow } from "zustand/react/shallow";
import { useUIStore, EditorMode } from "@/stores/useUIStore";
import { useLocaleStore } from "@/stores/useLocaleStore";
import { MainAIChatShell } from "@/components/layout/MainAIChatShell";
import { PanelErrorBoundary } from "@/components/system/PanelErrorBoundary";
import { LocalGraph } from "@/components/effects/LocalGraph";
import { debounce } from "@/lib/utils";
import {
  CodeMirrorEditor,
  type CodeMirrorEditorRef,
  ViewMode,
} from "./CodeMirrorEditor";
import { SelectionToolbar } from "@/components/toolbar/SelectionToolbar";
import { SelectionContextMenu } from "@/components/toolbar/SelectionContextMenu";
import { Network, X } from "lucide-react";
import {
  EDITOR_MODE_CHANGE_EVENT,
  type EditorModeChangeDetail,
} from "./editorModeEvents";

function isEditorMode(value: unknown): value is EditorMode {
  return value === "reading" || value === "live" || value === "source";
}

// 局部图谱展开状态（组件外部以保持状态）
let localGraphExpandedState = false;

type ModeScrollSnapshot = {
  mode: EditorMode;
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  maxScrollTop: number;
  ratio: number;
};

function getMaxScrollTop(element: HTMLElement) {
  return Math.max(0, element.scrollHeight - element.clientHeight);
}

function clampScrollTop(value: number, maxScrollTop: number) {
  return Math.min(maxScrollTop, Math.max(0, value));
}

function captureModeScrollSnapshot(
  element: HTMLElement,
  mode: EditorMode,
): ModeScrollSnapshot {
  const maxScrollTop = getMaxScrollTop(element);
  const scrollTop = clampScrollTop(element.scrollTop, maxScrollTop);
  return {
    mode,
    scrollTop,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
    maxScrollTop,
    ratio: maxScrollTop > 0 ? scrollTop / maxScrollTop : 0,
  };
}

function restoreModeScrollSnapshot(
  element: HTMLElement,
  snapshot: ModeScrollSnapshot,
) {
  const maxScrollTop = getMaxScrollTop(element);
  const targetTop =
    snapshot.maxScrollTop > 0 && maxScrollTop > 0
      ? snapshot.ratio * maxScrollTop
      : snapshot.scrollTop;
  const scrollTop = clampScrollTop(targetTop, maxScrollTop);
  element.scrollTop = scrollTop;
  return { scrollTop, maxScrollTop };
}

/**
 * Wires `useWikiLinkHover` against the live-editor wrapper so hovers
 * over CodeMirror's [[wikilink]] decorations open the same preview
 * card the reading view uses. Kept as its own component so the hook
 * call remains conditional on the wrapper actually being mounted.
 */
function LiveEditorWikiHover({ hostRef }: { hostRef: RefObject<HTMLDivElement | null> }) {
  const { anchor, path, label, close } = useNoteHoverPreview(hostRef);
  return <NoteHoverPreview anchor={anchor} path={path} label={label} onClose={close} />;
}

export function Editor() {
  const { t } = useLocaleStore();

  const {
    tabs,
    activeTabIndex,
    currentFile,
    currentContent,
    updateContent,
    save,
    isDirty,
    goBack,
    goForward,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useFileStore(
    useShallow((state) => ({
      tabs: state.tabs,
      activeTabIndex: state.activeTabIndex,
      currentFile: state.currentFile,
      currentContent: state.currentContent,
      updateContent: state.updateContent,
      save: state.save,
      isDirty: state.isDirty,
      goBack: state.goBack,
      goForward: state.goForward,
      undo: state.undo,
      redo: state.redo,
      canUndo: state.canUndo,
      canRedo: state.canRedo,
    })),
  );

  const {
    editorMode,
    setEditorMode,
  } = useUIStore();

  const editorRef = useRef<CodeMirrorEditorRef>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const liveEditorHostRef = useRef<HTMLDivElement>(null);
  const pendingModeScrollSnapshotRef = useRef<ModeScrollSnapshot | null>(null);
  const lastOuterScrollTraceAtRef = useRef(0);
  const editorScrollFadeTimerRef = useRef<number | null>(null);
  const [_isEditorScrollActive, setIsEditorScrollActive] = useState(false);

  const getLineFromScrollPosition = useCallback(
    (container: HTMLElement): number => {
      const scrollTop = container.scrollTop;
      const lineHeight = 28;
      const estimatedLine = Math.floor(scrollTop / lineHeight) + 1;
      const lines = currentContent.split("\n").length;
      return Math.min(Math.max(1, estimatedLine), lines);
    },
    [currentContent],
  );

  const activeTab = activeTabIndex >= 0 ? tabs[activeTabIndex] : null;

  const markEditorTrace = useCallback(
    (type: string, payload: Record<string, unknown> = {}) => {
      if (typeof window === "undefined") return;
      (window as any).__luminaEditorTrace?.mark?.(type, payload);
    },
    [],
  );

  const getScrollContainerForMode = useCallback((_mode: EditorMode) => {
    const editorHandle = editorRef.current as
      | CodeMirrorEditorRef
      | HTMLElement
      | null;
    if (
      editorHandle &&
      "getScrollDOM" in editorHandle &&
      typeof editorHandle.getScrollDOM === "function"
    ) {
      return editorHandle.getScrollDOM();
    }
    return editorHandle instanceof HTMLElement ? editorHandle : null;
  }, []);

  // 局部图谱展开/收起状态
  const [localGraphExpanded, setLocalGraphExpanded] = useState(
    localGraphExpandedState,
  );
  const toggleLocalGraph = useCallback(() => {
    setLocalGraphExpanded((prev) => {
      localGraphExpandedState = !prev;
      return !prev;
    });
  }, []);

  useLayoutEffect(() => {
    const container = getScrollContainerForMode(editorMode);
    scrollContainerRef.current = container;

    const snapshot = pendingModeScrollSnapshotRef.current;
    if (!container || !snapshot) return;

    const initialRestore = restoreModeScrollSnapshot(container, snapshot);
    markEditorTrace("editor-mode-scroll-restored", {
      fromMode: snapshot.mode,
      mode: editorMode,
      phase: "layout",
      sourceScrollTop: snapshot.scrollTop,
      sourceMaxScrollTop: snapshot.maxScrollTop,
      targetScrollTop: initialRestore.scrollTop,
      targetMaxScrollTop: initialRestore.maxScrollTop,
    });

    let firstFrame = 0;
    let secondFrame = 0;
    firstFrame = window.requestAnimationFrame(() => {
      restoreModeScrollSnapshot(container, snapshot);
      secondFrame = window.requestAnimationFrame(() => {
        const finalRestore = restoreModeScrollSnapshot(container, snapshot);
        markEditorTrace("editor-mode-scroll-restored", {
          fromMode: snapshot.mode,
          mode: editorMode,
          phase: "raf-2",
          sourceScrollTop: snapshot.scrollTop,
          sourceMaxScrollTop: snapshot.maxScrollTop,
          targetScrollTop: finalRestore.scrollTop,
          targetMaxScrollTop: finalRestore.maxScrollTop,
        });
        if (pendingModeScrollSnapshotRef.current === snapshot) {
          pendingModeScrollSnapshotRef.current = null;
        }
      });
    });

    return () => {
      if (firstFrame) window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [editorMode, getScrollContainerForMode, markEditorTrace]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    let lastOuterPointerMoveTraceAt = 0;
    const summarizePointerTarget = (target: EventTarget | null) => {
      const element = target instanceof HTMLElement ? target : null;
      return {
        tag: element?.tagName.toLowerCase() || "unknown",
        className: element?.className || "",
        text: (element?.textContent || "").slice(0, 120),
      };
    };
    const handleOuterScroll = () => {
      setIsEditorScrollActive(true);
      if (editorScrollFadeTimerRef.current !== null) {
        window.clearTimeout(editorScrollFadeTimerRef.current);
      }
      editorScrollFadeTimerRef.current = window.setTimeout(() => {
        setIsEditorScrollActive(false);
        editorScrollFadeTimerRef.current = null;
      }, 720);
      const now = Date.now();
      if (now - lastOuterScrollTraceAtRef.current < 80) return;
      lastOuterScrollTraceAtRef.current = now;
      markEditorTrace("editor-outer-scroll", {
        mode: editorMode,
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
        clientHeight: container.clientHeight,
        estimatedLine: getLineFromScrollPosition(container),
      });
    };
    const handleOuterWheel = (event: WheelEvent) => {
      markEditorTrace("editor-outer-wheel", {
        mode: editorMode,
        x: event.clientX,
        y: event.clientY,
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaMode: event.deltaMode,
        ...summarizePointerTarget(event.target),
      });
    };
    const handleOuterPointerDown = (event: PointerEvent) => {
      markEditorTrace("editor-outer-pointerdown", {
        mode: editorMode,
        x: event.clientX,
        y: event.clientY,
        button: event.button,
        buttons: event.buttons,
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        ...summarizePointerTarget(event.target),
      });
    };
    const handleOuterPointerMove = (event: PointerEvent) => {
      const now = Date.now();
      if (event.buttons === 0 && now - lastOuterPointerMoveTraceAt < 120)
        return;
      if (event.buttons !== 0 && now - lastOuterPointerMoveTraceAt < 60) return;
      lastOuterPointerMoveTraceAt = now;
      markEditorTrace("editor-outer-pointermove", {
        mode: editorMode,
        x: event.clientX,
        y: event.clientY,
        buttons: event.buttons,
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        ...summarizePointerTarget(event.target),
      });
    };
    const handleOuterPointerUp = (event: PointerEvent) => {
      markEditorTrace("editor-outer-pointerup", {
        mode: editorMode,
        x: event.clientX,
        y: event.clientY,
        button: event.button,
        buttons: event.buttons,
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        ...summarizePointerTarget(event.target),
      });
    };
    const handleOuterClick = (event: MouseEvent) => {
      markEditorTrace("editor-outer-click", {
        mode: editorMode,
        x: event.clientX,
        y: event.clientY,
        detail: event.detail,
        button: event.button,
        buttons: event.buttons,
        ...summarizePointerTarget(event.target),
      });
    };
    container.addEventListener("scroll", handleOuterScroll, { passive: true });
    container.addEventListener("wheel", handleOuterWheel, { passive: true });
    container.addEventListener("pointerdown", handleOuterPointerDown);
    container.addEventListener("pointermove", handleOuterPointerMove);
    container.addEventListener("pointerup", handleOuterPointerUp);
    container.addEventListener("click", handleOuterClick);
    return () => {
      if (editorScrollFadeTimerRef.current !== null) {
        window.clearTimeout(editorScrollFadeTimerRef.current);
        editorScrollFadeTimerRef.current = null;
      }
      container.removeEventListener("scroll", handleOuterScroll);
      container.removeEventListener("wheel", handleOuterWheel);
      container.removeEventListener("pointerdown", handleOuterPointerDown);
      container.removeEventListener("pointermove", handleOuterPointerMove);
      container.removeEventListener("pointerup", handleOuterPointerUp);
      container.removeEventListener("click", handleOuterClick);
    };
  }, [editorMode, getLineFromScrollPosition, markEditorTrace]);

  const handleModeChange = useCallback(
    (mode: EditorMode) => {
      if (mode === editorMode) return;
      const scrollContainer = getScrollContainerForMode(editorMode);
      const scrollSnapshot = scrollContainer
        ? captureModeScrollSnapshot(scrollContainer, editorMode)
        : null;
      pendingModeScrollSnapshotRef.current = scrollSnapshot;
      markEditorTrace("editor-mode-change-requested", {
        previousMode: editorMode,
        mode,
        activeTabType: activeTab?.type || "unknown",
        outerScrollTop: scrollSnapshot?.scrollTop ?? null,
        outerMaxScrollTop: scrollSnapshot?.maxScrollTop ?? null,
      });
      setEditorMode(mode);
    },
    [
      activeTab?.type,
      editorMode,
      getScrollContainerForMode,
      markEditorTrace,
      setEditorMode,
    ],
  );

  useEffect(() => {
    const handleEditorModeRequest = (event: Event) => {
      const detail = (event as CustomEvent<EditorModeChangeDetail>).detail;
      if (!isEditorMode(detail?.mode)) return;

      event.preventDefault();
      handleModeChange(detail.mode);
    };

    window.addEventListener(EDITOR_MODE_CHANGE_EVENT, handleEditorModeRequest);
    return () => {
      window.removeEventListener(
        EDITOR_MODE_CHANGE_EVENT,
        handleEditorModeRequest,
      );
    };
  }, [handleModeChange]);

  // 全局键盘快捷键
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;

      const isMod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      const active = document.activeElement as HTMLElement | null;
      const inCodeMirror = !!active?.closest(".cm-editor");
      const inTextInput =
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.isContentEditable);

      // Ctrl+Z: undo (unless in another text input)
      if (isMod && key === "z" && !e.shiftKey) {
        if (!inCodeMirror && inTextInput) return;

        e.preventDefault();
        if (canUndo()) {
          undo();
        }
        return;
      }

      // Ctrl+Y or Ctrl+Shift+Z: redo
      if (isMod && (key === "y" || (key === "z" && e.shiftKey))) {
        if (!inCodeMirror && inTextInput) return;

        e.preventDefault();
        if (canRedo()) {
          redo();
        }
        return;
      }

      // Alt + 左/右箭头: 导航历史
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        goBack();
        return;
      }
      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        goForward();
        return;
      }

    },
    [undo, redo, canUndo, canRedo, goBack, goForward],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const handleBeforeInput = (e: InputEvent) => {
      const inputType = e.inputType;
      if (inputType !== "historyUndo" && inputType !== "historyRedo") return;

      const target = e.target as HTMLElement | null;
      const inCodeMirror = !!target?.closest?.(".cm-editor");
      if (!inCodeMirror) return;

      e.preventDefault();
      e.stopPropagation();

      if (inputType === "historyUndo") {
        if (canUndo()) {
          undo();
        }
        return;
      }

      if (canRedo()) {
        redo();
      }
    };

    document.addEventListener(
      "beforeinput",
      handleBeforeInput as EventListener,
      true,
    );
    return () => {
      document.removeEventListener(
        "beforeinput",
        handleBeforeInput as EventListener,
        true,
      );
    };
  }, [undo, redo, canUndo, canRedo]);

  // Debounced save (1000ms after user stops typing, matching VS Code default)
  const debouncedSaveRef = useRef<ReturnType<typeof debounce> | null>(null);
  useEffect(() => {
    debouncedSaveRef.current = debounce(() => save(), 1000);
    return () => {
      debouncedSaveRef.current?.cancel();
    };
  }, [save]);

  // Save on window blur (when user switches to another app)
  useEffect(() => {
    const handleBlur = () => {
      if (isDirty && activeTab?.type !== "ai-chat") {
        save();
      }
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [isDirty, save, activeTab?.type]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-popover dark:bg-background transition-colors duration-300">
      {/* Main content area */}
      {activeTab?.type === "ai-chat" ? (
        // 主视图区 AI 聊天视图
        <PanelErrorBoundary label="AI Chat">
          <MainAIChatShell />
        </PanelErrorBoundary>
      ) : (
        // 普通笔记编辑视图
        <div className="flex-1 overflow-hidden relative">
          {/* 局部知识图谱 - 悬浮在右上角，可收起 */}
          {currentFile?.endsWith(".md") &&
            (localGraphExpanded ? (
              <div className="absolute top-3 right-3 w-80 h-56 bg-popover border border-border rounded-ui-lg shadow-elev-2 z-20 overflow-hidden animate-pop-in">
                <button
                  onClick={toggleLocalGraph}
                  className="absolute top-1.5 right-1.5 p-1 rounded hover:bg-accent/80 text-muted-foreground hover:text-foreground z-10 transition-colors"
                  title={t.common.collapse}
                >
                  <X size={14} />
                </button>
                <LocalGraph className="w-full h-full" />
              </div>
            ) : (
              <button
                onClick={toggleLocalGraph}
                className="absolute top-3 right-3 p-2.5 bg-popover border border-border rounded-ui-lg shadow-elev-2 z-20 text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors duration-fast ease-out-subtle"
                title={t.common.localGraph}
              >
                <Network size={18} />
              </button>
            ))}

          {/* Selection Toolbar - Add to Chat */}
          <SelectionToolbar containerRef={scrollContainerRef} />
          {/* Selection Context Menu - Right Click */}
          <SelectionContextMenu
            containerRef={scrollContainerRef}
            onFormatText={(format, text) => {
              window.dispatchEvent(
                new CustomEvent("editor-format-text", {
                  detail: { format, text },
                }),
              );
            }}
          />

          {/* CodeMirror stays visible in all three modes so reading/live/source
              share the same scroll container, line boxes, and text column. */}
          <div
            ref={liveEditorHostRef}
            className="h-full"
          >
            <CodeMirrorEditor
              ref={editorRef}
              content={currentContent}
              onChange={(newContent, selection) => {
                updateContent(newContent, "user", undefined, selection);
                debouncedSaveRef.current?.();
              }}
              viewMode={editorMode as ViewMode}
              filePath={currentFile}
            />
          </div>
          <LiveEditorWikiHover hostRef={liveEditorHostRef} />
        </div>
      )}
    </div>
  );
}
