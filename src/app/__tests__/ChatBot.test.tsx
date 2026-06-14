import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatBot } from "../components/ChatBot/ChatBot";
import { api } from "../services/api";
import { setTestPathname } from "../../test/setup";

vi.mock("../services/api", () => {
  class ApiError extends Error {
    status: number;
    data: unknown;

    constructor(status: number, message: string, data?: unknown) {
      super(message);
      this.status = status;
      this.data = data;
    }
  }

  return {
    ApiError,
    api: {
      ai: {
        chat: vi.fn(),
      },
    },
  };
});

const chatMock = vi.mocked(api.ai.chat);

describe("ChatBot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setTestPathname("/dashboard");
  });

  it("oculta no login e conversa com a API nas demais abas", async () => {
    const user = userEvent.setup();
    chatMock.mockResolvedValueOnce({
      reply: "Priorize Ana Lima pelo follow-up de hoje.",
      suggestions: ["Abrir lead Ana Lima"],
    });

    setTestPathname("/LoginPage");
    const { rerender } = render(<ChatBot />);

    expect(screen.queryByRole("button", { name: "Abrir chatbot SI" })).not.toBeInTheDocument();

    setTestPathname("/leads");
    rerender(<ChatBot />);

    await user.click(screen.getByRole("button", { name: "Abrir chatbot SI" }));
    await user.type(screen.getByLabelText("Mensagem para o assistente"), "Quem priorizar?");
    await user.click(screen.getByRole("button", { name: "Enviar mensagem" }));

    await waitFor(() => {
      expect(screen.getByText("Priorize Ana Lima pelo follow-up de hoje.")).toBeInTheDocument();
    });
    expect(chatMock).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "user", content: "Quem priorizar?" }),
        ]),
      }),
    );
  });
});
