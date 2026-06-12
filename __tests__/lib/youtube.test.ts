/**
 * @jest-environment node
 */

const mockFetchTranscript = jest.fn();

jest.mock("youtube-transcript", () => ({
  YoutubeTranscript: {
    fetchTranscript: mockFetchTranscript,
  },
}));

import {
  validateYoutubeUrl,
  extractVideoId,
  formatTimestamp,
  getTranscript,
} from "@/lib/youtube";

// ─── validateYoutubeUrl ───────────────────────────────────────────────────────

describe("validateYoutubeUrl", () => {
  it("표준 유튜브 URL을 유효하다고 판단한다", () => {
    expect(validateYoutubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
  });

  it("단축 youtu.be URL을 유효하다고 판단한다", () => {
    expect(validateYoutubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
  });

  it("http 프로토콜 URL도 유효하다고 판단한다", () => {
    expect(validateYoutubeUrl("http://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
  });

  it("임베드 URL을 유효하다고 판단한다", () => {
    expect(validateYoutubeUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(true);
  });

  it("빈 문자열은 유효하지 않다고 판단한다", () => {
    expect(validateYoutubeUrl("")).toBe(false);
  });

  it("유튜브가 아닌 URL은 유효하지 않다고 판단한다", () => {
    expect(validateYoutubeUrl("https://vimeo.com/123456")).toBe(false);
  });

  it("일반 텍스트는 유효하지 않다고 판단한다", () => {
    expect(validateYoutubeUrl("not a url")).toBe(false);
  });

  it("video id 없는 유튜브 URL은 유효하지 않다고 판단한다", () => {
    expect(validateYoutubeUrl("https://www.youtube.com/watch")).toBe(false);
  });
});

// ─── extractVideoId ───────────────────────────────────────────────────────────

describe("extractVideoId", () => {
  it("표준 URL에서 video id를 추출한다", () => {
    expect(extractVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("단축 URL에서 video id를 추출한다", () => {
    expect(extractVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("쿼리 파라미터가 추가된 URL에서도 video id를 추출한다", () => {
    expect(extractVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s")).toBe("dQw4w9WgXcQ");
  });

  it("유효하지 않은 URL이면 null을 반환한다", () => {
    expect(extractVideoId("https://vimeo.com/123")).toBeNull();
  });
});

// ─── formatTimestamp ──────────────────────────────────────────────────────────

describe("formatTimestamp", () => {
  it("초를 HH:MM:SS 형식으로 변환한다", () => {
    expect(formatTimestamp(3661)).toBe("01:01:01");
  });

  it("1시간 미만이면 MM:SS 형식으로 변환한다", () => {
    expect(formatTimestamp(90)).toBe("01:30");
  });

  it("0초는 00:00으로 변환한다", () => {
    expect(formatTimestamp(0)).toBe("00:00");
  });
});

// ─── getTranscript ────────────────────────────────────────────────────────────

describe("getTranscript", () => {
  beforeEach(() => {
    mockFetchTranscript.mockReset();
  });

  it("자막이 있는 영상에서 트랜스크립트를 반환한다", async () => {
    mockFetchTranscript.mockResolvedValueOnce([
      { text: "Hello world", offset: 0, duration: 5000 },
      { text: "This is a test", offset: 5000, duration: 5000 },
    ]);

    const result = await getTranscript("dQw4w9WgXcQ");
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe("Hello world");
    expect(result[0].start).toBe(0);
  });

  it("자막이 없으면 에러를 throw한다", async () => {
    mockFetchTranscript.mockRejectedValueOnce(new Error("No transcript available"));

    await expect(getTranscript("NO_CAPTION_ID")).rejects.toThrow("No transcript available");
  });
});
