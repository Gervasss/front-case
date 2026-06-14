import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LeadsPage from "../leads/Leadspage";
import { api } from "../services/api";
import type { Imovel, Lead, Status } from "../services/api";

vi.mock("../components/Navbar/NavbamarMinimal", () => ({
  NavbarMinimal: () => <nav aria-label="Navegação principal" />,
}));

vi.mock("../services/api", () => ({
  ApiError: class ApiError extends Error {},
  api: {
    statuses: { list: vi.fn() },
    leads: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
    imoveis: { list: vi.fn() },
  },
}));

const statusesMock = vi.mocked(api.statuses);
const leadsMock = vi.mocked(api.leads);
const imoveisMock = vi.mocked(api.imoveis);

const statuses: Status[] = [
  { id: "novo", name: "Novo", color: "#20b2aa", order: 1 } as Status,
  { id: "visita", name: "Visita", color: "#f59f00", order: 2 } as Status,
];

const imoveis: Imovel[] = [
  { id: "imovel-1", title: "Apartamento Centro", price: 850000 } as Imovel,
];

const leads: Lead[] = [
  {
    id: "lead-1",
    contactName: "Ana Lima",
    company: "Apartamento Centro",
    value: 850000,
    source: "Instagram",
    statusId: "novo",
    status: statuses[0],
    imovelId: "imovel-1",
    imovel: imoveis[0],
  } as Lead,
];

describe("LeadsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statusesMock.list.mockResolvedValue([...statuses]);
    leadsMock.list.mockResolvedValue([...leads]);
    leadsMock.create.mockResolvedValue(leads[0]);
    leadsMock.update.mockResolvedValue(leads[0]);
    leadsMock.remove.mockResolvedValue(leads[0]);
    imoveisMock.list.mockResolvedValue([...imoveis]);
  });

  it("cria e edita leads usando os campos da aba", async () => {
    const user = userEvent.setup();

    render(<LeadsPage />);

    expect(await screen.findByRole("heading", { name: "Leads" })).toBeInTheDocument();
    expect(await screen.findByText("Ana Lima")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Cliente"), "Bruno Reis");
    await user.selectOptions(screen.getByLabelText("Imóvel de interesse"), "imovel-1");
    await user.selectOptions(screen.getByLabelText("Status"), "visita");
    await user.click(screen.getByRole("button", { name: "Cadastrar lead" }));

    await waitFor(() => {
      expect(leadsMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          contactName: "Bruno Reis",
          company: "Apartamento Centro",
          statusId: "visita",
          imovelId: "imovel-1",
        }),
      );
    });

    await user.click(screen.getByRole("button", { name: "Editar Ana Lima" }));
    expect(screen.getByRole("heading", { name: "Editar lead" })).toBeInTheDocument();
    expect(screen.getByLabelText("Cliente")).toHaveValue("Ana Lima");
  });
});
