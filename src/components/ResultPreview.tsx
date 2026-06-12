"use client";

import type { AnalysisResult, VideoInfo } from "@/types";

interface Props {
  videoInfo: VideoInfo;
  analysis: AnalysisResult;
  onSendToNotion: () => void;
  isLoading: boolean;
  pageUrl?: string;
}

export default function ResultPreview({ videoInfo, analysis, onSendToNotion, isLoading, pageUrl }: Props) {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 space-y-6">
      <div>
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">{videoInfo.channelName}</p>
        <h2 className="text-xl font-bold text-white">{videoInfo.title}</h2>
        <a
          href={videoInfo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-violet-400 hover:underline"
        >
          {videoInfo.url}
        </a>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-white/60 uppercase mb-2">5줄 요약</h3>
        <ul className="space-y-1">
          {analysis.summary.map((line, i) => (
            <li key={i} className="flex gap-2 text-white">
              <span className="text-violet-400 font-bold">{i + 1}.</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-white/60 uppercase mb-2">타임라인</h3>
        <ul className="space-y-2">
          {analysis.timeline.map((item, i) => (
            <li key={i} className="flex gap-3 text-white">
              <span className="shrink-0 rounded-md bg-violet-900/50 px-2 py-0.5 text-xs font-mono text-violet-300">
                {item.timestamp}
              </span>
              <span className="text-sm">{item.content}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-white/60 uppercase mb-2">주요 키워드</h3>
        <div className="flex flex-wrap gap-2">
          {analysis.keywords.map((kw, i) => (
            <span
              key={i}
              className="rounded-full bg-violet-800/40 border border-violet-500/30 px-3 py-1 text-sm text-violet-200"
            >
              {kw}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-white/60 uppercase mb-2">액션 아이템</h3>
        <ul className="space-y-1">
          {analysis.actionItems.map((item, i) => (
            <li key={i} className="flex gap-2 text-white text-sm">
              <span className="text-violet-400">☐</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex items-center gap-4 pt-2 border-t border-white/10">
        <button
          onClick={onSendToNotion}
          disabled={isLoading}
          aria-label="노션으로 전송"
          className="rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 font-semibold text-white transition-colors"
        >
          {isLoading ? "전송 중..." : "노션으로 전송"}
        </button>

        {pageUrl && (
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            노션에서 열기 →
          </a>
        )}
      </div>
    </div>
  );
}
