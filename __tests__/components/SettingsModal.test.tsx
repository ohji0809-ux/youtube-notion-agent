import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsModal from "@/components/SettingsModal";

const mockOnSave = jest.fn();
const mockOnClose = jest.fn();

describe("SettingsModal", () => {
  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnClose.mockClear();
  });

  it("isOpen이 true이면 모달이 렌더링된다", () => {
    render(<SettingsModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.getByText(/Notion 설정/i)).toBeInTheDocument();
  });

  it("isOpen이 false이면 모달이 렌더링되지 않는다", () => {
    render(<SettingsModal isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.queryByText(/Notion 설정/i)).not.toBeInTheDocument();
  });

  it("API Token 입력창과 Database ID 입력창을 렌더링한다", () => {
    render(<SettingsModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.getByLabelText(/API Token/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Database ID/i)).toBeInTheDocument();
  });

  it("값을 입력하고 저장하면 onSave가 호출된다", async () => {
    const user = userEvent.setup();
    render(<SettingsModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    await user.type(screen.getByLabelText(/API Token/i), "secret_test_token");
    await user.type(screen.getByLabelText(/Database ID/i), "test-db-id");
    await user.click(screen.getByRole("button", { name: /저장/i }));

    expect(mockOnSave).toHaveBeenCalledWith({
      token: "secret_test_token",
      databaseId: "test-db-id",
    });
  });

  it("필드 미입력 상태에서 저장 시 에러 메시지를 표시한다", async () => {
    const user = userEvent.setup();
    render(<SettingsModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    await user.click(screen.getByRole("button", { name: /저장/i }));

    expect(await screen.findByText(/필수 항목/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("닫기 버튼 클릭 시 onClose가 호출된다", async () => {
    const user = userEvent.setup();
    render(<SettingsModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    await user.click(screen.getByRole("button", { name: "닫기" }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("초기값이 있으면 입력창에 채워진다", () => {
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialConfig={{ token: "existing_token", databaseId: "existing-db" }}
      />
    );
    expect(screen.getByLabelText(/API Token/i)).toHaveValue("existing_token");
    expect(screen.getByLabelText(/Database ID/i)).toHaveValue("existing-db");
  });
});
