import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionCardProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onClick: () => void;
  "data-testid"?: string;
}

export const OptionCard = ({ title, subtitle, selected, onClick, "data-testid": testId }: OptionCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={cn(
        "flex min-h-[56px] w-full items-center justify-between gap-3 rounded-card border bg-card px-4 py-3 text-left transition-all duration-200 ease-in-out hover:border-primary/50",
        selected && "border-2 border-primary bg-primary/15 shadow-md shadow-primary/10",
      )}
    >
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {selected ? <Check className="h-6 w-6 text-primary" /> : null}
    </button>
  );
};
