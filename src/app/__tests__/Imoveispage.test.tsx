import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ImoveisPage from "../imoveis/Imoveispage";
import { api } from "../services/api";
import type { Imovel } from "../services/api";

vi.mock("../components/Navbar/NavbamarMinimal", () => ({
  NavbarMinimal: () => <nav aria-label="Navegação principal" />,
}));

vi.mock("../services/api", () => ({
  ApiError: class ApiError extends Error {},
  api: {
    imoveis: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
  },
}));

const imoveisMock = vi.mocked(api.imoveis);

const imoveis: Imovel[] = [
  {
    id: "imovel-1",
    title: "Apartamento Centro",
    propertyType: "Apartamento",
    address: "Rua A, 100",
    city: "Sao Paulo",
    state: "SP",
    price: 850000,
    bedrooms: 2,
  } as Imovel,
];

describe("ImoveisPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    imoveisMock.list.mockResolvedValue([...imoveis]);
    imoveisMock.create.mockResolvedValue(imoveis[0]);
    imoveisMock.update.mockResolvedValue(imoveis[0]);
    imoveisMock.remove.mockResolvedValue(imoveis[0]);
  });

  it("cria, edita e apaga imóveis na aba", async () => {
    const user = userEvent.setup();

    render(<ImoveisPage />);

    expect(await screen.findByRole("heading", { name: "Imóveis" })).toBeInTheDocument();
    expect(await screen.findByText("Apartamento Centro")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Título"), "Casa Jardim");
    await user.type(screen.getByLabelText("Tipo"), "Casa");
    await user.type(screen.getByLabelText("Valor"), "920000");
    await user.type(screen.getByLabelText("Endereço"), "Rua B, 200");
    await user.type(screen.getByLabelText("Cidade"), "Campinas");
    await user.type(screen.getByLabelText("Estado"), "sp");
    expect(screen.getByLabelText("Estado")).toHaveValue("SP");
    await user.click(screen.getByRole("button", { name: "Cadastrar imóvel" }));

    await waitFor(() => {
      expect(imoveisMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Casa Jardim",
          type: "Casa",
          city: "Campinas",
          state: "SP",
          value: 920000,
        }),
      );
    });

    await user.click(screen.getByRole("button", { name: "Editar Apartamento Centro" }));
    expect(screen.getByRole("heading", { name: "Editar imóvel" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Apagar Apartamento Centro" }));
    await waitFor(() => {
      expect(imoveisMock.remove).toHaveBeenCalledWith("imovel-1");
    });
  });
});
