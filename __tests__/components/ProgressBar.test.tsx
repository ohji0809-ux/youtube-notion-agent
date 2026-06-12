import React from "react";
import { render, screen } from "@testing-library/react";
import ProgressBar from "@/components/ProgressBar";
import type { ProgressStep } from "@/types";

describe("ProgressBar", () => {
  it("idle 상태에서는 아무것도 렌더링하지 않는다", () => {
    const { container } = render(<ProgressBar step="idle" />);
    expect(container.firstChild).toBeNull();
  });

  it("validating 상태 메시지를 표시한다", () => {
    render(<ProgressBar step="validating" />);
    expect(screen.getByText(/URL 검사/i)).toBeInTheDocument();
  });

  it("extracting 상태 메시지를 표시한다", () => {
    render(<ProgressBar step="extracting" />);
    expect(screen.getByText(/자막 추출/i)).toBeInTheDocument();
  });

  it("analyzing 상태 메시지를 표시한다", () => {
    render(<ProgressBar step="analyzing" />);
    expect(screen.getByText(/AI 분석/i)).toBeInTheDocument();
  });

  it("sending 상태 메시지를 표시한다", () => {
    render(<ProgressBar step="sending" />);
    expect(screen.getByText(/노션 전송/i)).toBeInTheDocument();
  });

  it("done 상태에서 완료 메시지를 표시한다", () => {
    render(<ProgressBar step="done" />);
    expect(screen.getByText(/완료/i)).toBeInTheDocument();
  });

  it("error 상태에서 에러 메시지를 표시한다", () => {
    render(<ProgressBar step="error" errorMessage="API 오류가 발생했습니다" />);
    expect(screen.getByText(/API 오류가 발생했습니다/i)).toBeInTheDocument();
  });

  const steps: ProgressStep[] = ["validating", "extracting", "analyzing", "sending", "done"];
  it.each(steps)("%s 상태에서 progress bar가 렌더링된다", (step) => {
    render(<ProgressBar step={step} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
