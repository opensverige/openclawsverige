import { Children, cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";

type StepsProps = {
  children: React.ReactNode;
  className?: string;
};

export function Steps({ children, className }: StepsProps) {
  const withIndex = Children.map(children, (child, i) =>
    isValidElement(child)
      ? cloneElement(child, { stepNumber: i + 1 } as Partial<StepProps>)
      : child
  );
  return (
    <div className={cn("my-8", className)} role="list">
      {withIndex}
    </div>
  );
}

type StepProps = {
  title?: string;
  stepNumber?: number;
  children: React.ReactNode;
  className?: string;
};

export function Step({ title, stepNumber = 0, children, className }: StepProps) {
  return (
    <div
      className={cn(
        "relative flex gap-4 pb-8 last:pb-0",
        "before:absolute before:left-[11px] before:top-6 before:bottom-0 before:w-px before:bg-border last:before:hidden",
        className
      )}
      role="listitem"
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500/60 bg-emerald-500/10 text-xs font-semibold text-emerald-400"
        aria-hidden
      >
        {stepNumber}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        {title && (
          <h4 className="mb-2 text-base font-semibold tracking-tight">{title}</h4>
        )}
        <div className="text-muted-foreground [&>p]:mt-2 [&>p:first-child]:mt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
