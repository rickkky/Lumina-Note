import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FolderOpen } from "lucide-react";
import { ActionCard } from "./ActionCard";

describe("ActionCard", () => {
  it("renders the action row", () => {
    render(
      <ActionCard
        icon={FolderOpen}
        title="Open Folder"
        action={{ label: "Open", variant: "primary", onClick: vi.fn() }}
      />,
    );
    expect(screen.getByText("Open Folder")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open Folder" }),
    ).toBeInTheDocument();
  });

  it("calls onClick when the row is clicked", () => {
    const onClick = vi.fn();
    render(
      <ActionCard
        icon={FolderOpen}
        title="Open Folder"
        action={{ label: "Open", variant: "primary", onClick }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open Folder" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
