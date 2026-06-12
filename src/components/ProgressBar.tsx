"use client";

import type { ProgressStep } from "@/types";

interface Props {
  step: ProgressStep;
  errorMessage?: string;
}

const STEP_CONFIG: Record<Exclude<ProgressStep, "idle" | "error">, { label: string; percent: number }> = {
  validating: { label: "URL 검사 중...", percent: 20 },
  extracting: { label: "자막 추출 중...", percent: 45 },
  analyzing:  { label: "AI 분석 중...", percent: 70 },
  sending:    { label: "노션 전송 중...", percent: 90 },
  done:       { label: "완료!", percent: 100 },
};

export default function ProgressBar({ step, errorMessage }: Props) {
  if (step === "idle") return null;

  if (step === "error") {
    return (
      <div className="w-full rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
        <p>{errorMessage ?? "오류가 발생했습니다."}</p>
      </div>
    );
  }

  const { label, percent } = STEP_CONFIG[step];

  return (
    <div className="w-full space-y-2">
      <p className="text-sm text-white/70">{label}</p>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-white/10"
      >
        <div
          className="h-full rounded-full bg-violet-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
