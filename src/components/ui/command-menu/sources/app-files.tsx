// Vault file listing. Flattens `useFileStore.fileTree` recursively; the
// source re-registers on every tree mutation because `useFileStore` is a
// Zustand store and the selector returns a fresh array reference whenever
// the tree changes.
//
// Files don't get usage tracking — opening the same file repeatedly
// shouldn't pollute Recent.

import { useMemo } from "react";
import { FileText } from "lucide-react";
import { useFileStore } from "@/stores/useFileStore";
import type { FileEntry } from "@/lib/host";
import { getFileName } from "@/lib/utils";
import type { CommandItem } from "@/stores/useCommandMenu";

interface FileItem {
  path: string;
  name: string;
}

const flattenFiles = (entries: FileEntry[]): FileItem[] => {
  const result: FileItem[] = [];
  const walk = (nodes: FileEntry[]) => {
    for (const entry of nodes) {
      if (entry.is_dir && entry.children) {
        walk(entry.children);
      } else if (!entry.is_dir) {
        result.push({ path: entry.path, name: getFileName(entry.name) });
      }
    }
  };
  walk(entries);
  return result;
};

const tokenize = (name: string) =>
  name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .split(/[^a-z0-9一-鿿]+/i)
    .filter(Boolean);

export function useAppFilesSource(): CommandItem[] {
  const fileTree = useFileStore((s) => s.fileTree);
  const openFile = useFileStore((s) => s.openFile);

  return useMemo<CommandItem[]>(() => {
    const files = flattenFiles(fileTree);
    return files.map((file) => ({
      id: `file:${file.path}`,
      group: "files" as const,
      title: file.name,
      description: file.path,
      icon: <FileText size={16} />,
      keywords: [file.path, ...tokenize(file.name)],
      run: () => {
        void openFile(file.path);
      },
    }));
  }, [fileTree, openFile]);
}
