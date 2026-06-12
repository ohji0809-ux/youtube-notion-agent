import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResultPreview from "@/components/ResultPreview";
import type { AnalysisResult, VideoInfo } from "@/types";

const mockVideoInfo: VideoInfo = {
  videoId: "dQw4w9WgXcQ",
  title: "TypeScript 완전 정복",
  channelName: "코딩채널",
  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
};

const mockAnalysis: AnalysisResult = {
  summary: ["TypeScript 기초를 다룬다.", "실무 예제 중심이다.", "다음 편은 제네릭이다."],
  timeline: [
    { timestamp: "00:00", startSeconds: 0, content: "TypeScript 소개" },
    { timestamp: "05:30", startSeconds: 330, content: "타입 예제" },
  ],
  keywords: ["TypeScript", "타입", "제네릭"],
  actionItems: ["TypeScript 설치하기", "첫 번째 파일 작성하기"],
};

describe("ResultPreview", () => {
  const mockOnSendToNotion = jest.fn();

  beforeEach(() => {
    mockOnSendToNotion.mockClear();
  });

  it("영상 제목을 표시한다", () => {
    render(
      <ResultPreview videoInfo={mockVideoInfo} analysis={mockAnalysis} onSendToNotion={mockOnSendToNotion} isLoading={false} />
    );
    expect(screen.getByText("TypeScript 완전 정복")).toBeInTheDocument();
  });

  it("3줄 요약을 모두 표시한다", () => {
    render(
      <ResultPreview videoInfo={mockVideoInfo} analysis={mockAnalysis} onSendToNotion={mockOnSendToNotion} isLoading={false} />
    );
    mockAnalysis.summary.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it("타임라인 항목을 표시한다", () => {
    render(
      <ResultPreview videoInfo={mockVideoInfo} analysis={mockAnalysis} onSendToNotion={mockOnSendToNotion} isLoading={false} />
    );
    expect(screen.getByText("TypeScript 소개")).toBeInTheDocument();
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  it("키워드 태그를 표시한다", () => {
    render(
      <ResultPreview videoInfo={mockVideoInfo} analysis={mockAnalysis} onSendToNotion={mockOnSendToNotion} isLoading={false} />
    );
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("타입")).toBeInTheDocument();
  });

  it("액션 아이템을 표시한다", () => {
    render(
      <ResultPreview videoInfo={mockVideoInfo} analysis={mockAnalysis} onSendToNotion={mockOnSendToNotion} isLoading={false} />
    );
    expect(screen.getByText("TypeScript 설치하기")).toBeInTheDocument();
  });

  it("'노션으로 전송' 버튼 클릭 시 onSendToNotion이 호출된다", async () => {
    const user = userEvent.setup();
    render(
      <ResultPreview videoInfo={mockVideoInfo} analysis={mockAnalysis} onSendToNotion={mockOnSendToNotion} isLoading={false} />
    );
    await user.click(screen.getByRole("button", { name: /노션으로 전송/i }));
    expect(mockOnSendToNotion).toHaveBeenCalled();
  });

  it("isLoading이 true이면 전송 버튼이 비활성화된다", () => {
    render(
      <ResultPreview videoInfo={mockVideoInfo} analysis={mockAnalysis} onSendToNotion={mockOnSendToNotion} isLoading={true} />
    );
    expect(screen.getByRole("button", { name: /노션으로 전송/i })).toBeDisabled();
  });

  it("pageUrl이 있으면 '노션에서 열기' 링크를 표시한다", () => {
    render(
      <ResultPreview
        videoInfo={mockVideoInfo}
        analysis={mockAnalysis}
        onSendToNotion={mockOnSendToNotion}
        isLoading={false}
        pageUrl="https://notion.so/mock-page"
      />
    );
    const link = screen.getByRole("link", { name: /노션에서 열기/i });
    expect(link).toHaveAttribute("href", "https://notion.so/mock-page");
  });
});
