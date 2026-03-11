import type { JobMatchStatus } from "@/types/hrx";

interface StatusBadgeProps {
  status: JobMatchStatus;
}

const statusMap: Record<JobMatchStatus, { label: string; className: string }> = {
  fit: { label: "Подходит", className: "bg-primary/10 text-primary border-primary/30" },
  review: { label: "Спорно", className: "bg-accent/20 text-foreground border-accent/40" },
  not_recommended: { label: "Не рекомендовано", className: "bg-destructive/10 text-destructive border-destructive/30" },
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const current = statusMap[status];
  return <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${current.className}`}>{current.label}</span>;
};
