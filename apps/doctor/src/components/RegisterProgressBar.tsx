'use client';

interface RegisterProgressBarProps {
  currentStep: number;
  steps: string[];
}

export default function RegisterProgressBar({ currentStep, steps }: RegisterProgressBarProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isFuture = stepNumber > currentStep;

          return (
            <div key={step} className="relative flex flex-col items-center z-10">
              {/* Circle */}
              <div
                className={`size-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <span className="material-symbols-outlined text-lg">check</span>
                ) : (
                  stepNumber
                )}
              </div>

              {/* Label */}
              <span
                className={`absolute top-12 text-xs font-medium whitespace-nowrap transition-colors ${
                  isCurrent ? 'text-primary font-bold' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Progress Text */}
      <div className="mt-12 md:hidden text-center">
        <p className="text-sm text-slate-500">
          Etapa <span className="font-bold text-primary">{currentStep}</span> de {steps.length}
        </p>
      </div>
    </div>
  );
}
