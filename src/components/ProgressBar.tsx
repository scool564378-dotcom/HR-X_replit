interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar = ({ current, total }: ProgressBarProps) => {
  return (
    <div className="flex gap-1.5 w-full" data-testid="progress-bar">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
            i < current ? "bg-primary" : "bg-secondary"
          }`}
          data-testid={`progress-segment-${i + 1}`}
        />
      ))}
    </div>
  );
};
