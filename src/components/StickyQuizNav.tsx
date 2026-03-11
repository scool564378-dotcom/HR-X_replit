import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StickyQuizNavProps {
  onBack: () => void;
  onHint: () => void;
  onNext: () => void;
  disableBack?: boolean;
  disableNext?: boolean;
  nextLabel?: string;
}

export const StickyQuizNav = ({
  onBack,
  onHint,
  onNext,
  disableBack,
  disableNext,
  nextLabel = "Дальше",
}: StickyQuizNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur-sm md:sticky md:mt-8 md:rounded-card md:border md:px-4 md:py-4">
      <div className="mx-auto flex max-w-5xl items-center gap-2">
        <Button variant="soft" onClick={onBack} disabled={disableBack} className="shrink-0">
          Назад
        </Button>
        <Button
          variant="outline"
          onClick={onHint}
          className="aspect-square shrink-0 px-0"
          title="Подсказка"
          data-testid="button-hint"
        >
          <MessageCircle size={20} />
        </Button>
        <Button variant="hero" onClick={onNext} disabled={disableNext} className="min-w-0 flex-1 truncate">
          {nextLabel}
        </Button>
      </div>
    </div>
  );
};
