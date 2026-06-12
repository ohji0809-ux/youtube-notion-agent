"use client";

import { useState, KeyboardEvent } from "react";
import { validateYoutubeUrl } from "@/lib/youtube";

interface Props {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function UrlInput({ onSubmit, isLoading }: Props) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!url.trim()) return;

    if (!validateYoutubeUrl(url.trim())) {
      setError("유효한 유튜브 링크를 입력해 주세요.");
      return;
    }

    setError("");
    onSubmit(url.trim());
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder="유튜브 링크를 붙여넣으세요"
          disabled={isLoading}
          className="flex-1 rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 font-semibold text-white transition-colors"
        >
          {isLoading ? "분석 중..." : "분석 및 전송"}
        </button>
      </div>
      {error && (
        <p className="text-red-400 text-sm pl-1">{error}</p>
      )}
    </div>
  );
}
