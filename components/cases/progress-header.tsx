import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { getIntakeSteps, getStepLabel, type IntakeStepId } from "@/lib/intake-steps";
import type { CaseCategory } from "@prisma/client";

type ProgressHeaderProps = {
  currentStep: IntakeStepId;
  category?: CaseCategory;
};

export function ProgressHeader({ currentStep, category }: ProgressHeaderProps) {
  const steps = getIntakeSteps(category);
  const currentIndex = steps.indexOf(currentStep);
  const progressValue =
    currentIndex >= 0
      ? Math.round(((currentIndex + 1) / steps.length) * 100)
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 text-sm">
        <p className="font-medium text-foreground">
          Step {currentIndex + 1} of {steps.length}
        </p>
        <p className="text-muted-foreground">{getStepLabel(currentStep)}</p>
      </div>

      <Progress value={progressValue}>
        <ProgressTrack className="h-1.5">
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>

      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const isActive = step === currentStep;
          const isComplete = index < currentIndex;

          return (
            <span
              key={step}
              className={[
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isComplete
                    ? "bg-muted text-foreground"
                    : "bg-muted/50 text-muted-foreground",
              ].join(" ")}
            >
              {getStepLabel(step)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
