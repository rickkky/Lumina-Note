import { motion } from "framer-motion";
import { Folder, X } from "lucide-react";
import type { RecentVault } from "@/stores/useRecentVaultStore";
import { useLocaleStore } from "@/stores/useLocaleStore";

interface RecentVaultListProps {
  vaults: RecentVault[];
  onSelect: (path: string) => void;
  onRemove: (path: string) => void;
  onClear: () => void;
}

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.24, ease: [0.2, 0.9, 0.1, 1] as const },
  },
};

export function RecentVaultList({
  vaults,
  onSelect,
  onRemove,
  onClear,
}: RecentVaultListProps) {
  const { t } = useLocaleStore();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 px-6 pt-6 pb-4">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {t.welcome.recentVaults}
        </h2>
        {vaults.length > 0 && (
          <button
            onClick={onClear}
            className="rounded-ui-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            {t.welcome.clearHistory}
          </button>
        )}
      </div>

      {vaults.length === 0 ? (
        <div className="px-6 text-sm text-muted-foreground/70">
          {t.welcome.noRecentVaults}
        </div>
      ) : (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 overflow-y-auto px-4"
        >
          {vaults.map((vault) => (
            <motion.div
              key={vault.path}
              variants={itemVariants}
              className="group relative flex cursor-pointer items-center gap-2 rounded-ui-md px-2 py-2 transition-colors duration-fast hover:bg-background"
              onClick={() => onSelect(vault.path)}
            >
              <Folder className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate">
                  {vault.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {vault.path}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(vault.path);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-background transition-opacity duration-100"
                aria-label={`Remove ${vault.name}`}
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
