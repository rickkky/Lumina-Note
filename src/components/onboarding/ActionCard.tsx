import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action: {
    label?: string;
    variant: "primary" | "secondary";
    onClick: () => void;
  };
}

export function ActionCard({
  icon: Icon,
  title,
  action,
}: ActionCardProps) {
  return (
    <button
      type="button"
      aria-label={title}
      className={cn(
        "group grid min-h-[66px] w-full grid-cols-[22px_minmax(0,1fr)_18px] items-center gap-3 rounded-ui-xl px-4 text-left",
        "transition-[background-color,border-color,color,transform] duration-fast ease-out-subtle active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        action.variant === "primary"
          ? "border border-primary bg-primary text-primary-foreground hover:bg-primary/90"
          : "border border-border bg-background text-foreground hover:border-foreground/20 hover:bg-accent",
      )}
      onClick={action.onClick}
    >
      <Icon className="h-[22px] w-[22px] shrink-0" />
      <span className="min-w-0 truncate text-base font-semibold">{title}</span>
      <ChevronRight className="h-[18px] w-[18px] justify-self-end opacity-90 transition-transform duration-fast group-hover:translate-x-0.5" />
    </button>
  );
}
