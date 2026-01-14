import { motion } from 'framer-motion';
import { cn } from '../components/ui';

interface Option {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  return (
    <div className={cn("flex p-1 bg-[var(--bg0)] rounded-lg border border-[var(--border)]", className)}>
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all z-10",
              isActive ? "text-[var(--primary)]" : "text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="segmented-bg"
                className="absolute inset-0 bg-white shadow-sm rounded-md border border-[var(--border)] -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
