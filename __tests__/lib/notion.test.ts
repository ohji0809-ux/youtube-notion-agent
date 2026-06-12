/**
 * @jest-environment node
 */
import type { VideoInfo, AnalysisResult, NotionConfig } from "@/types";

const mockPagesCreate = jest.fn();
const mockDatabasesRetrieve = jest.fn();

jest.mock("@notionhq/client", () => ({
  Client: jest.fn().mockImplementation(() => ({
    pages: { create: mockPagesCreate },
    databases: { retrieve: mockDatabasesRetrieve },
  })),
}));

import { createNotionPage, testNotionConnection } from "@/lib/notion";

const mockConfig: NotionConfig = {
  token: "secret_test_token",
  databaseId: "test-database-id",
};

const mockVideoInfo: VideoInfo = {
  videoId: "dQw4w9WgXcQ",
  title: "TypeScript 완전 정복",
  channelName: "코딩채널",
  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
};

const mockAnalysis: AnalysisResult = {
  summary: ["TypeScript 기초 개념을 다룬다.", "실무 예제 중심으로 설명한다.", "다음 편에서 제네릭을 다룬다."],
  timeline: [
    { timestamp: "00:00", startSeconds: 0, content: "TypeScript 소개" },
    { timestamp: "05:30", startSeconds: 330, content: "타입 시스템 예제" },
  ],
  keywords: ["TypeScript", "타입", "제네릭"],
  actionItems: ["TypeScript 설치하기", "첫 번째 .ts 파일 작성하기"],
};

// ─── createNotionPage ─────────────────────────────────────────────────────────

describe("createNotionPage", () => {
  beforeEach(() => {
    mockPagesCreate.mockReset();
  });

  it("노션 페이지를 생성하고 pageId와 pageUrl을 반환한다", async () => {
    mockPagesCreate.mockResolvedValueOnce({
      id: "mock-page-id",
      url: "https://notion.so/mock-page-id",
    });

    const result = await createNotionPage(mockVideoInfo, mockAnalysis, mockConfig);

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("url");
    expect(typeof result.id).toBe("string");
    expect(typeof result.url).toBe("string");
  });

  it("Notion API 실패 시 에러를 throw한다", async () => {
    mockPagesCreate.mockRejectedValueOnce(new Error("Notion API Error"));

    await expect(
      createNotionPage(mockVideoInfo, mockAnalysis, mockConfig)
    ).rejects.toThrow("Notion API Error");
  });
});

// ─── testNotionConnection ─────────────────────────────────────────────────────

describe("testNotionConnection", () => {
  beforeEach(() => {
    mockDatabasesRetrieve.mockReset();
  });

  it("유효한 토큰과 DB ID면 true를 반환한다", async () => {
    mockDatabasesRetrieve.mockResolvedValueOnce({ id: "test-db", object: "database" });

    const result = await testNotionConnection(mockConfig);
    expect(result).toBe(true);
  });

  it("잘못된 토큰이면 false를 반환한다", async () => {
    mockDatabasesRetrieve.mockRejectedValueOnce(new Error("Unauthorized"));

    const result = await testNotionConnection({ token: "invalid", databaseId: "invalid" });
    expect(result).toBe(false);
  });
});
