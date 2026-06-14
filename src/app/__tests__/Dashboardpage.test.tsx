import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DashboardPage from "../dashboard/Dashboardpage";
import { api } from "../services/api";
import type { Imovel, KanbanColumn, Lead, Status } from "../services/api";

vi.mock("../components/Navbar/NavbamarMinimal", () => ({
  NavbarMinimal: () => <nav aria-label="Navegação principal" />,
}));

vi.mock("../services/api", () => ({
  ApiError: class ApiError extends Error {},
  api: {
    statuses: { list: vi.fn() },
    leads: { kanban: vi.fn(), move: vi.fn() },
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

const kanban: KanbanColumn[] = [
  { id: "novo", name: "Novo", color: "#20b2aa", order: 1, leads },
  { id: "visita", name: "Visita", color: "#f59f00", order: 2, leads: [] },
];

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statusesMock.list.mockResolvedValue([...statuses]);
    leadsMock.kanban.mockResolvedValue([...kanban]);
    leadsMock.move.mockResolvedValue(leads[0]);
    imoveisMock.list.mockResolvedValue([...imoveis]);
  });

  it("carrega o dashboard e move um lead de status", async () => {
    const user = userEvent.setup();

    render(<DashboardPage />);

    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(await screen.findByText("Ana Lima")).toBeInTheDocument();
    expect(screen.getByText("Leads ativos")).toBeInTheDocument();
    expect(screen.getByText("Solte leads aqui.")).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), "visita");

    await waitFor(() => {
      expect(leadsMock.move).toHaveBeenCalledWith("lead-1", { statusId: "visita" });
    });
  });
});
