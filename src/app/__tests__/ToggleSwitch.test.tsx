import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ToggleSwitch from "../components/ToggleSwitch/ToggleSwitch";

describe("ToggleSwitch", () => {
  it("envia o estado oposto ao clicar", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ToggleSwitch checked={false} onChange={onChange} label="Tema" />);

    await user.click(screen.getByRole("switch", { name: "Ativar modo escuro" }));

    expect(onChange).toHaveBeenCalledWith(true);
  });
});
