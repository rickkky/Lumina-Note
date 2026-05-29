import { describe, expect, it, vi } from "vitest";

import { handleDirtyWindowClose } from "./window-close.js";

describe("handleDirtyWindowClose", () => {
  it("does not intercept clean window closes", () => {
    const event = { preventDefault: vi.fn() };
    const forceClose = vi.fn();

    handleDirtyWindowClose(event, {
      getDirtyFileCount: () => 0,
      showDiscardDialog: vi.fn(),
      clearDirtyFileCount: vi.fn(),
      forceClose,
    });

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(forceClose).not.toHaveBeenCalled();
  });

  it("keeps dirty windows open when the user cancels", () => {
    const event = { preventDefault: vi.fn() };
    const forceClose = vi.fn();

    handleDirtyWindowClose(event, {
      getDirtyFileCount: () => 2,
      showDiscardDialog: vi.fn(() => 0),
      clearDirtyFileCount: vi.fn(),
      forceClose,
    });

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(forceClose).not.toHaveBeenCalled();
  });

  it("forces close after the user chooses to discard changes", () => {
    const event = { preventDefault: vi.fn() };
    const clearDirtyFileCount = vi.fn();
    const forceClose = vi.fn();

    handleDirtyWindowClose(event, {
      getDirtyFileCount: () => 1,
      showDiscardDialog: vi.fn(() => 1),
      clearDirtyFileCount,
      forceClose,
    });

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(clearDirtyFileCount).toHaveBeenCalledTimes(1);
    expect(forceClose).toHaveBeenCalledTimes(1);
  });
});
