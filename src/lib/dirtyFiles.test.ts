import { describe, expect, it } from "vitest";

import { getDirtyFileCount } from "./dirtyFiles";

describe("getDirtyFileCount", () => {
  it("does not double-count the active file dirty flag and tab dirty flag", () => {
    expect(
      getDirtyFileCount({
        currentFile: "/notes/a.md",
        isDirty: true,
        tabs: [
          {
            id: "/notes/a.md",
            path: "/notes/a.md",
            type: "file",
            isDirty: true,
          },
        ],
      }),
    ).toBe(1);
  });

  it("counts dirty inactive file tabs", () => {
    expect(
      getDirtyFileCount({
        currentFile: "/notes/a.md",
        isDirty: false,
        tabs: [
          {
            id: "/notes/a.md",
            path: "/notes/a.md",
            type: "file",
            isDirty: false,
          },
          {
            id: "/notes/b.md",
            path: "/notes/b.md",
            type: "file",
            isDirty: true,
          },
        ],
      }),
    ).toBe(1);
  });

  it("ignores non-file dirty tabs", () => {
    expect(
      getDirtyFileCount({
        currentFile: null,
        isDirty: false,
        tabs: [
          {
            id: "chat",
            path: "",
            type: "ai-chat",
            isDirty: true,
          },
        ],
      }),
    ).toBe(0);
  });
});
