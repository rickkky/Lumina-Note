import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

const mocks = vi.hoisted(() => ({
  runSlashAIAction: vi.fn(),
}));

const translations = {
  common: {
    close: "Close",
    cancel: "Cancel",
  },
  editor: {
    slashMenu: {
      categories: {
        ai: "AI",
        heading: "Heading",
        list: "List",
        block: "Block",
        insert: "Insert",
      },
      commands: {
        aiChat: "AI Chat",
        aiChatDesc: "Open AI assistant chat",
        aiChatPrompt: "Tell AI what to write",
      },
      noCommands: "No commands",
      inlineAI: {
        optionalGuidance: "Add optional guidance",
        promptRequired: "Prompt required",
        genericError: "Something went wrong",
        previewTitle: "Preview",
        generating: "Generating",
        insert: "Insert",
        regenerate: "Regenerate",
        retry: "Retry",
        progressTitle: "Progress",
        errorTitle: "Error",
        stages: {
          understanding: "Understanding",
          "reading-context": "Reading context",
          "preparing-context": "Preparing context",
          generating: "Generating",
          ready: "Ready",
        },
      },
    },
  },
};

const fileStoreState = {
  activeTabIndex: 0,
  currentFile: "/tmp/vault/current.md",
  tabs: [
    {
      id: "tab-1",
      path: "/tmp/vault/current.md",
      type: "file",
    },
  ],
};

const slashInlineStoreState = {
  tasks: {},
};

vi.mock("@/stores/useLocaleStore", () => ({
  useLocaleStore: () => ({ t: translations }),
}));

vi.mock("@/stores/useFileStore", () => {
  const useFileStore = (selector: (state: typeof fileStoreState) => unknown) =>
    selector(fileStoreState);
  useFileStore.getState = () => fileStoreState;
  return { useFileStore };
});

vi.mock("@/stores/useSlashAIInlineStore", () => {
  const useSlashAIInlineStore = (
    selector: (state: typeof slashInlineStoreState) => unknown,
  ) => selector(slashInlineStoreState);
  return {
    cancelSlashAIInlineTask: vi.fn(),
    finishSlashAIInlineTask: vi.fn(),
    getSlashAIInlineTask: vi.fn(() => null),
    removeSlashAIInlineTask: vi.fn(),
    startSlashAIInlineTask: vi.fn(),
    updateSlashAIInlineTask: vi.fn(),
    useSlashAIInlineStore,
  };
});

vi.mock("../extensions/slashCommand", async () => {
  const actual = await vi.importActual<typeof import("../extensions/slashCommand")>(
    "../extensions/slashCommand",
  );
  return {
    ...actual,
    runSlashAIAction: mocks.runSlashAIAction,
  };
});

import { SlashMenu } from "./SlashMenu";
import {
  showSlashMenu,
  slashMenuField,
} from "../extensions/slashCommand";

function createView() {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  const view = new EditorView({
    state: EditorState.create({
      doc: "/",
      selection: { anchor: 1 },
      extensions: [slashMenuField],
    }),
    parent,
  });
  view.dispatch({ effects: showSlashMenu.of({ pos: 0, filter: "" }) });
  return {
    view,
    cleanup: () => {
      view.destroy();
      parent.remove();
    },
  };
}

describe("SlashMenu", () => {
  beforeEach(() => {
    mocks.runSlashAIAction.mockReset();
    mocks.runSlashAIAction.mockResolvedValue({
      text: "Generated text",
      from: 0,
      to: 0,
    });
  });

  it("does not submit the AI prompt while IME composition is active", () => {
    const { view, cleanup } = createView();
    render(<SlashMenu view={view} />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent("slash-menu-show", {
          detail: { x: 32, y: 32, pos: 0 },
        }),
      );
      window.dispatchEvent(
        new CustomEvent("slash-menu-state", {
          detail: { active: true, filter: "" },
        }),
      );
    });

    fireEvent.click(screen.getByText("AI Chat"));

    const textarea = screen.getByPlaceholderText("Tell AI what to write");
    fireEvent.change(textarea, { target: { value: "ni" } });
    fireEvent.keyDown(textarea, { key: "Enter", keyCode: 229 });

    expect(mocks.runSlashAIAction).not.toHaveBeenCalled();

    cleanup();
  });
});
