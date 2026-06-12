import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UrlInput from "@/components/UrlInput";

describe("UrlInput", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it("입력창과 분석 버튼을 렌더링한다", () => {
    render(<UrlInput onSubmit={mockOnSubmit} isLoading={false} />);
    expect(screen.getByPlaceholderText(/유튜브/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /분석/i })).toBeInTheDocument();
  });

  it("URL을 입력하고 버튼을 클릭하면 onSubmit이 호출된다", async () => {
    const user = userEvent.setup();
    render(<UrlInput onSubmit={mockOnSubmit} isLoading={false} />);

    await user.type(
      screen.getByPlaceholderText(/유튜브/i),
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    );
    await user.click(screen.getByRole("button", { name: /분석/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  });

  it("유효하지 않은 URL 입력 시 에러 메시지를 표시한다", async () => {
    const user = userEvent.setup();
    render(<UrlInput onSubmit={mockOnSubmit} isLoading={false} />);

    await user.type(screen.getByPlaceholderText(/유튜브/i), "https://vimeo.com/123");
    await user.click(screen.getByRole("button", { name: /분석/i }));

    expect(await screen.findByText(/유효한 유튜브/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("빈 입력으로 제출 시 onSubmit이 호출되지 않는다", async () => {
    const user = userEvent.setup();
    render(<UrlInput onSubmit={mockOnSubmit} isLoading={false} />);

    await user.click(screen.getByRole("button", { name: /분석/i }));

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("isLoading이 true이면 버튼이 비활성화된다", () => {
    render(<UrlInput onSubmit={mockOnSubmit} isLoading={true} />);
    expect(screen.getByRole("button", { name: /분석/i })).toBeDisabled();
  });

  it("Enter 키 입력으로 제출할 수 있다", async () => {
    const user = userEvent.setup();
    render(<UrlInput onSubmit={mockOnSubmit} isLoading={false} />);

    await user.type(
      screen.getByPlaceholderText(/유튜브/i),
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ{enter}"
    );

    expect(mockOnSubmit).toHaveBeenCalledWith("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  });
});
