"use client";

import { useState, useEffect } from "react";
import type { NotionConfig } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: NotionConfig) => void;
  initialConfig?: NotionConfig;
}

export default function SettingsModal({ isOpen, onClose, onSave, initialConfig }: Props) {
  const [token, setToken] = useState(initialConfig?.token ?? "");
  const [databaseId, setDatabaseId] = useState(initialConfig?.databaseId ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialConfig) {
      setToken(initialConfig.token);
      setDatabaseId(initialConfig.databaseId);
    }
  }, [initialConfig]);

  if (!isOpen) return null;

  function handleSave() {
    if (!token.trim() || !databaseId.trim()) {
      setError("필수 항목을 모두 입력해 주세요.");
      return;
    }
    setError("");
    onSave({ token: token.trim(), databaseId: databaseId.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Notion 설정</h2>
          <button
            onClick={onClose}
            aria-label="모달 닫기"
            className="rounded-lg p-1 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="notion-token" className="block text-sm font-medium text-white/70">
              API Token
            </label>
            <input
              id="notion-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="secret_..."
              className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="notion-db" className="block text-sm font-medium text-white/70">
              Database ID
            </label>
            <input
              id="notion-db"
              type="text"
              value={databaseId}
              onChange={(e) => setDatabaseId(e.target.value)}
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
          >
            닫기
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
