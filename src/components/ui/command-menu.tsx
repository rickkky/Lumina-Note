import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Kbd } from "./kbd";
import { Row } from "./row";
import { useLocaleStore } from "@/stores/useLocaleStore";
import {
  filterAndRankCommands,
  useCommandMenu,
  type CommandGroupId,
  type CommandItem,
} from "@/stores/useCommandMenu";
import { FEATURED_COMMAND_IDS, readUsage } from "@/lib/commandPaletteUsage";

/**
 * CommandMenu — the app-wide Cmd/Ctrl+P overlay.
 *
 * Mount ONCE (in App root). Reads open/query state + registered commands
 * from useCommandMenu; individual features call `registerSource(sourceId,
 * items)` to contribute commands. Keyboard shortcut handling lives in
 * <CommandMenuProvider/> below so the overlay itself has no side effects
 * other than showing.
 */

const GROUP_ORDER: CommandGroupId[] = [
  "actions",
  "navigation",
  "sessions",
  "skills",
  "files",
];

const RECENT_LIMIT = 4;

type SectionLabel = "discover" | "recent" | "all";

interface OrderedGroup {
  group: CommandGroupId;
  items: CommandItem[];
  /** When set, overrides the group header with a section label (used to
   *  split the actions group into Discover / Recent / All on empty query). */
  sectionLabel?: SectionLabel;
}

export function CommandMenu() {
  const { t } = useLocaleStore();
  // Stable slice selectors — touching s.sources directly gives a ref that
  // only changes when register/unregisterSource fires. Flattening here
  // (inside useMemo, not inside the zustand selector) avoids the "selector
  // returns new array every render → infinite loop" footgun.
  const open = useCommandMenu((s) => s.open);
  const query = useCommandMenu((s) => s.query);
  const sources = useCommandMenu((s) => s.sources);
  const setOpen = useCommandMenu((s) => s.setOpen);
  const setQuery = useCommandMenu((s) => s.setQuery);
  const commands = useMemo(() => Object.values(sources).flat(), [sources]);
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Re-read usage on open + on the storage event so the Recent section +
  // "New" badges stay fresh without a Cmd+P reload.
  const [usageVersion, setUsageVersion] = useState(0);
  useEffect(() => {
    if (!open) return;
    setUsageVersion((v) => v + 1);
  }, [open]);
  useEffect(() => {
    const onUpdate = () => setUsageVersion((v) => v + 1);
    window.addEventListener("lumina-command-palette-usage-updated", onUpdate);
    return () =>
      window.removeEventListener(
        "lumina-command-palette-usage-updated",
        onUpdate,
      );
  }, []);
  const usage = useMemo(
    () => (usageVersion > 0 ? readUsage() : readUsage()),
    [usageVersion],
  );

  // Filter + order by group.
  const filtered = useMemo(
    () => filterAndRankCommands(commands, query),
    [commands, query],
  );

  // Build the visual render order.
  // - non-empty query: one block per group, in GROUP_ORDER.
  // - empty query: the actions group splits into Discover (featured) /
  //   Recent (top RECENT_LIMIT by lastUsed) / All (the rest). Other groups
  //   render as a single block.
  const grouped = useMemo<OrderedGroup[]>(() => {
    const groups = new Map<CommandGroupId, CommandItem[]>();
    for (const cmd of filtered) {
      const list = groups.get(cmd.group) ?? [];
      list.push(cmd);
      groups.set(cmd.group, list);
    }

    if (query.trim()) {
      return GROUP_ORDER.flatMap((gid) => {
        const items = groups.get(gid);
        return items?.length ? [{ group: gid, items }] : [];
      });
    }

    const featuredSet = new Set<string>(FEATURED_COMMAND_IDS);
    const ordered: OrderedGroup[] = [];
    for (const gid of GROUP_ORDER) {
      if (gid !== "actions") {
        const items = groups.get(gid);
        if (items?.length) ordered.push({ group: gid, items });
        continue;
      }
      const actions = groups.get("actions") ?? [];
      const discover = actions.filter((c) => featuredSet.has(c.id));
      const recent = actions
        .filter((c) => !featuredSet.has(c.id) && (usage[c.id]?.count ?? 0) > 0)
        .sort(
          (a, b) => (usage[b.id]?.lastUsed ?? 0) - (usage[a.id]?.lastUsed ?? 0),
        )
        .slice(0, RECENT_LIMIT);
      const recentIds = new Set(recent.map((c) => c.id));
      const all = actions.filter(
        (c) => !featuredSet.has(c.id) && !recentIds.has(c.id),
      );
      if (discover.length) {
        ordered.push({ group: gid, items: discover, sectionLabel: "discover" });
      }
      if (recent.length) {
        ordered.push({ group: gid, items: recent, sectionLabel: "recent" });
      }
      if (all.length) {
        ordered.push({ group: gid, items: all, sectionLabel: "all" });
      }
    }
    return ordered;
  }, [filtered, query, usage]);

  // Flattened command list (for keyboard nav index).
  const flatIds = useMemo(
    () => grouped.flatMap((g) => g.items.map((i) => i.id)),
    [grouped],
  );

  useEffect(() => {
    if (!open) return;
    // Reset active + focus input on open.
    setActiveIndex(0);
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (activeIndex >= flatIds.length) setActiveIndex(0);
  }, [flatIds.length, activeIndex]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((idx) =>
          flatIds.length ? (idx + 1) % flatIds.length : 0,
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((idx) =>
          flatIds.length ? (idx - 1 + flatIds.length) % flatIds.length : 0,
        );
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const cmdId = flatIds[activeIndex];
        if (!cmdId) return;
        const cmd = filtered.find((c) => c.id === cmdId);
        if (cmd) {
          void cmd.run();
          setOpen(false);
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, flatIds, activeIndex, filtered, setOpen]);

  if (typeof document === "undefined") return null;

  const sectionLabels: Record<SectionLabel, string> = {
    discover: t.commandMenu.discoverSection,
    recent: t.commandMenu.recentSection,
    all: t.commandMenu.allCommandsSection,
  };

  const featuredSet = new Set<string>(FEATURED_COMMAND_IDS);

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[15vh]"
        >
          <motion.div
            className="lumina-floating-overlay absolute inset-0 bg-foreground/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.99 }
            }
            transition={{ duration: 0.16, ease: [0.2, 0.9, 0.1, 1] }}
            className={cn(
              "relative w-full max-w-lg",
              "lumina-floating-surface rounded-ui-xl border border-border bg-popover text-popover-foreground",
              "shadow-elev-3",
              "flex max-h-[min(60vh,32rem)] flex-col overflow-hidden",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-2 border-b border-border/60 px-4">
              <Search size={16} className="shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder={t.commandMenu.placeholder}
                className={cn(
                  "flex-1 bg-transparent py-3 text-sm text-foreground",
                  "placeholder:text-muted-foreground/70",
                  "focus:outline-none",
                )}
              />
              <Kbd className="shrink-0">Esc</Kbd>
            </div>

            {/* Grouped results */}
            <div
              role="listbox"
              className="flex-1 overflow-y-auto py-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
            >
              {grouped.length === 0 ? (
                <div className="px-4 py-10 text-center text-xs text-muted-foreground">
                  {t.commandMenu.noResults}
                </div>
              ) : (
                grouped.map(({ group, items, sectionLabel }) => {
                  const headerText = sectionLabel
                    ? sectionLabels[sectionLabel]
                    : t.commandMenu.groups[group];
                  const SectionIcon =
                    sectionLabel === "discover"
                      ? Sparkles
                      : sectionLabel === "recent"
                        ? Clock
                        : null;
                  return (
                    <div
                      key={`${group}-${sectionLabel ?? "all"}`}
                      className="py-1"
                    >
                      <div className="flex items-center gap-1.5 px-3 py-1 text-ui-caption font-medium uppercase tracking-wide text-muted-foreground">
                        {SectionIcon ? (
                          <SectionIcon size={11} className="opacity-70" />
                        ) : null}
                        <span>{headerText}</span>
                      </div>
                      <div className="px-1">
                        {items.map((cmd) => {
                          const idx = flatIds.indexOf(cmd.id);
                          const selected = idx === activeIndex;
                          const isFeatured = featuredSet.has(cmd.id);
                          const showNewBadge = isFeatured && !usage[cmd.id];
                          return (
                            <Row
                              key={cmd.id}
                              icon={cmd.icon}
                              title={cmd.title}
                              description={cmd.description}
                              trailing={
                                showNewBadge ? (
                                  <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                                    {t.commandMenu.newBadge}
                                  </span>
                                ) : cmd.shortcut ? (
                                  <Kbd>{cmd.shortcut}</Kbd>
                                ) : null
                              }
                              selected={selected}
                              data-selected={selected}
                              onSelect={() => {
                                void cmd.run();
                                setOpen(false);
                              }}
                              role="option"
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-between gap-4 border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                </span>
                <span className="flex items-center gap-1">
                  <Kbd>↵</Kbd>
                </span>
              </div>
              <span className="flex items-center gap-1">
                <Kbd>⌘</Kbd>
                <Kbd>P</Kbd>
              </span>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
