'use client';

import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex justify-center gap-2 px-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-1.5 rounded-full flex-1 transition-all duration-300 max-w-24",
            index < currentStep 
              ? "bg-primary" 
              : index === currentStep 
                ? "bg-primary/70" 
                : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}