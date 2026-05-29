interface DirtyFileTab {
  id: string;
  path: string;
  type: string;
  isDirty: boolean;
}

export function getDirtyFileCount(input: {
  tabs: DirtyFileTab[];
  currentFile: string | null;
  isDirty: boolean;
}): number {
  const dirtyPaths = new Set<string>();

  for (const tab of input.tabs) {
    if (tab.type === "file" && tab.isDirty) {
      dirtyPaths.add(tab.path || tab.id);
    }
  }

  if (input.isDirty) {
    dirtyPaths.add(input.currentFile || "__active_file__");
  }

  return dirtyPaths.size;
}
