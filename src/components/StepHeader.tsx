import { quizSteps } from "@/data/quizData";
import { ProgressBar } from "@/components/ProgressBar";

interface StepHeaderProps {
  step: number;
}

export const StepHeader = ({ step }: StepHeaderProps) => {
  const title = quizSteps[step - 1];
  const total = quizSteps.length;

  return (
    <div className="space-y-3">
      <ProgressBar current={step} total={total} />
      <p className="text-sm text-muted-foreground" data-testid="text-step-indicator">
        Шаг {step} из {total}: {title}
      </p>
    </div>
  );
};
