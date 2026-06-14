import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ModalLead } from "../components/ModalLead/ModalLead";
import type { Imovel, Lead } from "../services/api";

describe("ModalLead", () => {
  it("exibe detalhes do lead e fecha pelo botao", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const lead = {
      id: "lead-1",
      contactName: "Ana Lima",
      company: "Apartamento Centro",
      email: "ana@example.com",
      phone: "11999990000",
      value: 650000,
      source: "Instagram",
      statusId: "status-1",
      status: { id: "status-1", name: "Visita", color: "#20b2aa", order: 2 },
      nextFollowUp: "2026-06-20T12:00:00.000Z",
      notes: "Quer visitar no fim de semana.",
    } as Lead;
    const imovel = {
      id: "imovel-1",
      title: "Apartamento Centro",
      propertyType: "Apartamento",
      address: "Rua A, 100",
      city: "Sao Paulo",
      state: "SP",
      price: 650000,
    } as Imovel;

    render(<ModalLead lead={lead} imovel={imovel} onClose={onClose} />);

    expect(screen.getByRole("dialog", { name: "Ana Lima" })).toBeInTheDocument();
    expect(screen.getByText("Rua A, 100")).toBeInTheDocument();
    expect(screen.getByText("20/06/2026")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fechar detalhes" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
