/**
 * @jest-environment node
 */

const mockCreateNotionPage = jest.fn();

jest.mock("@/lib/notion", () => ({
  createNotionPage: mockCreateNotionPage,
}));

import { POST } from "@/app/api/notion/route";
import { NextRequest } from "next/server";
import type { NotionSendRequest } from "@/types";

const mockPayload: NotionSendRequest = {
  videoInfo: {
    videoId: "dQw4w9WgXcQ",
    title: "테스트 영상",
    channelName: "테스트 채널",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  analysis: {
    summary: ["요약1", "요약2", "요약3"],
    timeline: [{ timestamp: "00:00", startSeconds: 0, content: "시작" }],
    keywords: ["키워드1"],
    actionItems: ["액션1"],
  },
};

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/notion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── POST /api/notion ─────────────────────────────────────────────────────────

describe("POST /api/notion", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = {
      ...OLD_ENV,
      NOTION_TOKEN: "secret_test",
      NOTION_DATABASE_ID: "test-db-id",
    };
    mockCreateNotionPage.mockReset();
    mockCreateNotionPage.mockResolvedValue({
      id: "mock-page-id",
      url: "https://notion.so/mock-page-id",
    });
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it("유효한 페이로드로 요청 시 200과 노션 페이지 URL을 반환한다", async () => {
    const req = makeRequest(mockPayload);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.pageUrl).toContain("notion.so");
  });

  it("videoInfo 없이 요청 시 400을 반환한다", async () => {
    const { videoInfo: _, ...withoutVideoInfo } = mockPayload;
    const req = makeRequest(withoutVideoInfo);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("환경 변수 미설정 시 500을 반환한다", async () => {
    delete process.env.NOTION_TOKEN;

    const req = makeRequest(mockPayload);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
  });

  it("Notion API 실패 시 500을 반환한다", async () => {
    mockCreateNotionPage.mockRejectedValueOnce(new Error("Notion Error"));

    const req = makeRequest(mockPayload);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
  });
});
