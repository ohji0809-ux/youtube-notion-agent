/**
 * @jest-environment node
 */

const mockValidateYoutubeUrl = jest.fn();
const mockExtractVideoId = jest.fn();
const mockGetTranscript = jest.fn();
const mockAnalyzeTranscript = jest.fn();

jest.mock("@/lib/youtube", () => ({
  validateYoutubeUrl: mockValidateYoutubeUrl,
  extractVideoId: mockExtractVideoId,
  getTranscript: mockGetTranscript,
}));

jest.mock("@/lib/ai", () => ({
  analyzeTranscript: mockAnalyzeTranscript,
}));

import { POST } from "@/app/api/analyze/route";
import { NextRequest } from "next/server";

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockAnalysisResult = {
  summary: ["요약1", "요약2", "요약3"],
  timeline: [{ timestamp: "00:00", startSeconds: 0, content: "시작" }],
  keywords: ["키워드1"],
  actionItems: ["액션1"],
};

// ─── POST /api/analyze ────────────────────────────────────────────────────────

describe("POST /api/analyze", () => {
  beforeEach(() => {
    process.env.GROQ_API_KEY = "test-key";
    mockValidateYoutubeUrl.mockReset();
    mockExtractVideoId.mockReset();
    mockGetTranscript.mockReset();
    mockAnalyzeTranscript.mockReset();

    mockValidateYoutubeUrl.mockReturnValue(true);
    mockExtractVideoId.mockReturnValue("dQw4w9WgXcQ");
    mockGetTranscript.mockResolvedValue([{ text: "테스트 자막", start: 0, duration: 5 }]);
    mockAnalyzeTranscript.mockResolvedValue(mockAnalysisResult);
  });

  it("유효한 URL로 분석 요청 시 200과 분석 결과를 반환한다", async () => {
    const req = makeRequest({ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.analysis).toBeDefined();
    expect(data.analysis.summary).toHaveLength(3);
  });

  it("URL 없이 요청 시 400을 반환한다", async () => {
    const req = makeRequest({});
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it("유효하지 않은 URL로 요청 시 400을 반환한다", async () => {
    mockValidateYoutubeUrl.mockReturnValue(false);

    const req = makeRequest({ url: "https://vimeo.com/123" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("분석 실패 시 500을 반환한다", async () => {
    mockAnalyzeTranscript.mockRejectedValueOnce(new Error("AI Error"));

    const req = makeRequest({ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
  });
});
