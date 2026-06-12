"use client";

import { useState } from "react";
import UrlInput from "@/components/UrlInput";
import ProgressBar from "@/components/ProgressBar";
import ResultPreview from "@/components/ResultPreview";
import type { ProgressStep, AnalysisResult, VideoInfo } from "@/types";

export default function Home() {
  const [step, setStep] = useState<ProgressStep>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [pageUrl, setPageUrl] = useState<string | undefined>(undefined);

  async function handleAnalyze(url: string) {
    setStep("validating");
    setErrorMessage("");
    setVideoInfo(null);
    setAnalysis(null);
    setPageUrl(undefined);

    try {
      setStep("extracting");
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      setStep("analyzing");
      const analyzeData = await analyzeRes.json();

      if (!analyzeData.success) {
        throw new Error(analyzeData.error ?? "분석에 실패했습니다.");
      }

      setVideoInfo(analyzeData.videoInfo);
      setAnalysis(analyzeData.analysis);
      setStep("done");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      setStep("error");
    }
  }

  async function handleSendToNotion() {
    if (!videoInfo || !analysis) return;

    setStep("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoInfo, analysis }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error ?? "노션 전송에 실패했습니다.");
      }

      setPageUrl(data.pageUrl);
      setStep("done");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "노션 전송 중 오류가 발생했습니다.");
      setStep("error");
    }
  }

  const isLoading = ["validating", "extracting", "analyzing", "sending"].includes(step);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div
        className="fixed inset-0 -z-10 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, #7c3aed, transparent)",
        }}
      />

      <div className="mx-auto max-w-3xl px-4 py-16 space-y-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">
            YouTube → Notion
          </h1>
          <p className="text-white/50 mt-1 text-sm">
            영상 링크 하나로 AI 요약 + 노션 자동 저장
          </p>
        </header>

        <UrlInput onSubmit={handleAnalyze} isLoading={isLoading} />

        {step !== "idle" && (
          <ProgressBar step={step} errorMessage={errorMessage} />
        )}

        {step === "done" && videoInfo && analysis && (
          <ResultPreview
            videoInfo={videoInfo}
            analysis={analysis}
            onSendToNotion={handleSendToNotion}
            isLoading={isLoading}
            pageUrl={pageUrl}
          />
        )}
      </div>
    </main>
  );
}
