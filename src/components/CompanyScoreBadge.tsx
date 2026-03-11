import { Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import type { CompanyScore } from "@/types/hrx";

interface CompanyScoreBadgeProps {
  score: CompanyScore;
}

const levelConfig = {
  trusted: {
    label: "Надёжная",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    Icon: ShieldCheck,
  },
  normal: {
    label: "Обычная",
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    Icon: Shield,
  },
  suspicious: {
    label: "Сомнительная",
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    Icon: ShieldQuestion,
  },
  risky: {
    label: "Рискованная",
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    Icon: ShieldAlert,
  },
};

export const CompanyScoreBadge = ({ score }: CompanyScoreBadgeProps) => {
  const config = levelConfig[score.level];
  const { Icon } = config;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${config.className}`}
      data-testid={`badge-company-score-${score.level}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label} ({score.total})
    </span>
  );
};
