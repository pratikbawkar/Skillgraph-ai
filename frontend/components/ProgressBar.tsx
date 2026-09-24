interface ProgressBarProps {
  percentage: number;
  label?: string;
}

export function ProgressBar({ percentage, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));

  return (
    <div>
      {label && (
        <div className="mb-1 flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{label}</span>
          <span className="font-medium text-brand dark:text-brand-light">{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-indigo-100 dark:bg-gray-800"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-role-python transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
