import { StrictMode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useSidebarFileOperations } from "./useSidebarFileOperations";
import { useFileStore } from "@/stores/useFileStore";
import type { FileEntry } from "@/lib/host";

function HookProbe() {
  const ops = useSidebarFileOperations();
  return <div>{ops.vaultPath ?? "no-vault"}</div>;
}

function ToggleProbe() {
  const ops = useSidebarFileOperations();
  return (
    <button onClick={() => ops.toggleExpanded("/vault/folder")}>toggle</button>
  );
}

function entry(path: string, isDir = false): FileEntry {
  return {
    name: path.split("/").pop() ?? path,
    path,
    is_dir: isDir,
    isDirectory: isDir,
    size: null,
    modified_at: null,
    created_at: null,
    children: isDir ? [] : null,
  };
}

function SelectProbe() {
  const ops = useSidebarFileOperations();
  return (
    <div>
      <div data-testid="selected-path">{ops.selectedPath ?? "none"}</div>
      <button onClick={() => ops.setSelectedPath("/vault/active.md")}>
        active
      </button>
      <button onClick={() => ops.handleSelect(entry("/vault/next.md"))}>
        select-file
      </button>
      <button onClick={() => ops.handleSelect(entry("/vault/folder", true))}>
        select-folder
      </button>
    </div>
  );
}

describe("useSidebarFileOperations", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not trigger unstable getSnapshot warnings in StrictMode", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <StrictMode>
        <HookProbe />
      </StrictMode>,
    );

    expect(screen.getByText("no-vault")).toBeInTheDocument();
    expect(
      errorSpy.mock.calls.some((args) =>
        String(args[0]).includes("The result of getSnapshot should be cached"),
      ),
    ).toBe(false);
  });

  it("loads folder children outside the expanded-path state updater", () => {
    const originalExpandDirectory = useFileStore.getState().expandDirectory;
    const expandDirectory = vi.fn(() => Promise.resolve());
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    useFileStore.setState({
      vaultPath: "/vault",
      expandDirectory,
    });

    try {
      render(<ToggleProbe />);

      fireEvent.click(screen.getByRole("button", { name: "toggle" }));

      expect(expandDirectory).toHaveBeenCalledWith("/vault/folder");
      expect(
        errorSpy.mock.calls.some((args) =>
          String(args[0]).includes("Cannot update a component"),
        ),
      ).toBe(false);
    } finally {
      useFileStore.setState({ expandDirectory: originalExpandDirectory });
    }
  });

  it("does not move primary selection before a file preview actually opens", () => {
    const originalOpenFile = useFileStore.getState().openFile;
    const openFile = vi.fn(() => Promise.resolve());
    useFileStore.setState({
      vaultPath: "/vault",
      openFile,
    });

    try {
      render(<SelectProbe />);

      fireEvent.click(screen.getByRole("button", { name: "active" }));
      expect(screen.getByTestId("selected-path")).toHaveTextContent(
        "/vault/active.md",
      );

      fireEvent.click(screen.getByRole("button", { name: "select-file" }));

      expect(openFile).toHaveBeenCalledWith("/vault/next.md", {
        preview: true,
      });
      expect(screen.getByTestId("selected-path")).toHaveTextContent(
        "/vault/active.md",
      );
    } finally {
      useFileStore.setState({ openFile: originalOpenFile });
    }
  });

  it("still selects folders immediately", () => {
    useFileStore.setState({ vaultPath: "/vault" });

    render(<SelectProbe />);

    fireEvent.click(screen.getByRole("button", { name: "select-folder" }));

    expect(screen.getByTestId("selected-path")).toHaveTextContent(
      "/vault/folder",
    );
  });
});
