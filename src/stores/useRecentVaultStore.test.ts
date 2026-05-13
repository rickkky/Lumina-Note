import { describe, expect, it, beforeEach, vi } from "vitest";

async function loadStore() {
  vi.resetModules();
  return import("./useRecentVaultStore");
}

async function flushHydration() {
  await Promise.resolve();
}

describe("useRecentVaultStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds a vault to the list", async () => {
    const { useRecentVaultStore } = await loadStore();
    useRecentVaultStore.getState().addVault("/home/user/notes");
    expect(useRecentVaultStore.getState().vaults).toHaveLength(1);
    expect(useRecentVaultStore.getState().vaults[0].path).toBe(
      "/home/user/notes",
    );
    expect(useRecentVaultStore.getState().vaults[0].name).toBe("notes");
  });

  it("moves existing vault to top when re-added", async () => {
    const { useRecentVaultStore } = await loadStore();
    useRecentVaultStore.getState().addVault("/home/user/notes1");
    useRecentVaultStore.getState().addVault("/home/user/notes2");
    useRecentVaultStore.getState().addVault("/home/user/notes1");
    expect(useRecentVaultStore.getState().vaults[0].path).toBe(
      "/home/user/notes1",
    );
    expect(useRecentVaultStore.getState().vaults).toHaveLength(2);
  });

  it("caps the list at 8 vaults", async () => {
    const { useRecentVaultStore } = await loadStore();
    for (let i = 0; i < 10; i++) {
      useRecentVaultStore.getState().addVault(`/home/user/vault${i}`);
    }
    expect(useRecentVaultStore.getState().vaults).toHaveLength(8);
    expect(useRecentVaultStore.getState().vaults[0].path).toBe(
      "/home/user/vault9",
    );
  });

  it("removes a vault by path", async () => {
    const { useRecentVaultStore } = await loadStore();
    useRecentVaultStore.getState().addVault("/home/user/notes");
    useRecentVaultStore.getState().removeVault("/home/user/notes");
    expect(useRecentVaultStore.getState().vaults).toHaveLength(0);
  });

  it("clears all vaults", async () => {
    const { useRecentVaultStore } = await loadStore();
    useRecentVaultStore.getState().addVault("/home/user/notes1");
    useRecentVaultStore.getState().addVault("/home/user/notes2");
    useRecentVaultStore.getState().clearVaults();
    expect(useRecentVaultStore.getState().vaults).toHaveLength(0);
  });

  it("hydrates persisted recent vaults on store creation", async () => {
    localStorage.setItem(
      "lumina-recent-vaults",
      JSON.stringify({
        state: {
          vaults: [
            {
              path: "/home/user/persisted",
              name: "persisted",
              openedAt: 123,
            },
          ],
        },
        version: 0,
      }),
    );

    const { useRecentVaultStore } = await loadStore();
    await flushHydration();

    expect(useRecentVaultStore.getState().vaults).toEqual([
      {
        path: "/home/user/persisted",
        name: "persisted",
        openedAt: 123,
      },
    ]);
  });
});
