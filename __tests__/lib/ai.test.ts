/**
 * @jest-environment node
 */
import type { TranscriptSegment, AnalysisResult } from "@/types";

const mockCreate = jest.fn();

jest.mock("groq-sdk", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  })),
}));

import { analyzeTranscript, buildAnalysisPrompt } from "@/lib/ai";

const mockSegments: TranscriptSegment[] = [
  { text: "오늘은 TypeScript에 대해 알아보겠습니다.", start: 0, duration: 5 },
  { text: "TypeScript는 JavaScript의 슈퍼셋입니다.", start: 5, duration: 5 },
  { text: "정적 타입 시스템을 제공합니다.", start: 10, duration: 5 },
  { text: "이를 통해 버그를 사전에 방지할 수 있습니다.", start: 15, duration: 5 },
  { text: "다음 시간에는 제네릭에 대해 알아보겠습니다.", start: 20, duration: 5 },
];

const mockAnalysisResult: AnalysisResult = {
  summary: ["TypeScript는 JavaScript 슈퍼셋이다.", "정적 타입으로 버그를 예방한다.", "제네릭 학습이 다음 주제이다.", "타입스크립트는 대규모 프로젝트에 유리하다.", "IDE 자동완성 기능이 강화된다."],
  timeline: [
    { timestamp: "00:00", startSeconds: 0, content: "TypeScript 소개" },
    { timestamp: "00:10", startSeconds: 10, content: "정적 타입 시스템 설명" },
  ],
  keywords: ["TypeScript", "JavaScript", "정적 타입", "제네릭"],
  actionItems: ["TypeScript 공식 문서 읽기", "간단한 TypeScript 프로젝트 만들어보기"],
};

// ─── buildAnalysisPrompt ──────────────────────────────────────────────────────

describe("buildAnalysisPrompt", () => {
  it("트랜스크립트 세그먼트로 분석 프롬프트를 생성한다", () => {
    const prompt = buildAnalysisPrompt(mockSegments);
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("프롬프트에 자막 텍스트가 포함된다", () => {
    const prompt = buildAnalysisPrompt(mockSegments);
    expect(prompt).toContain("TypeScript");
  });

  it("프롬프트에 3줄 요약 지시가 포함된다", () => {
    const prompt = buildAnalysisPrompt(mockSegments);
    expect(prompt).toContain("요약");
  });

  it("프롬프트에 타임라인 분석 지시가 포함된다", () => {
    const prompt = buildAnalysisPrompt(mockSegments);
    expect(prompt).toContain("타임라인");
  });

  it("프롬프트에 액션 아이템 지시가 포함된다", () => {
    const prompt = buildAnalysisPrompt(mockSegments);
    expect(prompt).toContain("액션");
  });
});

// ─── analyzeTranscript ────────────────────────────────────────────────────────

describe("analyzeTranscript", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("Groq API를 호출해 AnalysisResult 형태의 응답을 반환한다", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(mockAnalysisResult) } }],
    });

    const result = await analyzeTranscript(mockSegments);

    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("timeline");
    expect(result).toHaveProperty("keywords");
    expect(result).toHaveProperty("actionItems");
    expect(Array.isArray(result.summary)).toBe(true);
  });

  it("summary는 5개 항목을 가진다", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(mockAnalysisResult) } }],
    });

    const result = await analyzeTranscript(mockSegments);
    expect(result.summary).toHaveLength(5);
  });

  it("API 오류 시 에러를 throw한다", async () => {
    mockCreate.mockRejectedValueOnce(new Error("API Error"));
    await expect(analyzeTranscript(mockSegments)).rejects.toThrow("API Error");
  });
});
