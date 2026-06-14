import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import StatusPage from "../status/Statuspage";
import { api } from "../services/api";
import type { Status } from "../services/api";

vi.mock("../components/Navbar/NavbamarMinimal", () => ({
  NavbarMinimal: () => <nav aria-label="Navegação principal" />,
}));

vi.mock("../services/api", () => ({
  ApiError: class ApiError extends Error {},
  api: {
    statuses: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
  },
}));

const statusesMock = vi.mocked(api.statuses);

const statuses: Status[] = [
  { id: "novo", name: "Novo", color: "#20b2aa", order: 1, _count: { leads: 1 } } as Status,
  { id: "visita", name: "Visita", color: "#f59f00", order: 2, _count: { leads: 0 } } as Status,
];

describe("StatusPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    statusesMock.list.mockResolvedValue([...statuses]);
    statusesMock.create.mockResolvedValue(statuses[0]);
    statusesMock.update.mockResolvedValue(statuses[0]);
    statusesMock.remove.mockResolvedValue(statuses[0]);
  });

  it("ordena, cria, edita e apaga status na aba", async () => {
    const user = userEvent.setup();

    render(<StatusPage />);

    expect(await screen.findByRole("heading", { name: "Status" })).toBeInTheDocument();
    expect(await screen.findByText("Novo")).toBeInTheDocument();
    const list = screen.getByText("Status do dashboard").closest("section");
    expect(list).not.toBeNull();
    expect(within(list as HTMLElement).getByText("Novo")).toBeInTheDocument();
    expect(within(list as HTMLElement).getByText("Visita")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Nome"));
    await user.type(screen.getByLabelText("Nome"), "Proposta");
    await user.clear(screen.getByLabelText("Ordem"));
    await user.type(screen.getByLabelText("Ordem"), "3");
    await user.click(screen.getByRole("button", { name: "Criar status" }));

    await waitFor(() => {
      expect(statusesMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Proposta",
          order: 3,
        }),
      );
    });

    await user.click(screen.getByRole("button", { name: "Editar Novo" }));
    expect(screen.getByRole("heading", { name: "Editar status" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Apagar Novo" }));
    await waitFor(() => {
      expect(statusesMock.remove).toHaveBeenCalledWith("novo");
    });
  });
});
