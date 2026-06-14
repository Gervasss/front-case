import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { NavbarMinimal } from "../components/Navbar/NavbamarMinimal";
import { ThemeProvider } from "../components/ThemeContext/ThemeContext";
import { setTestPathname } from "../../test/setup";

function renderNavbar() {
  return render(
    <MantineProvider>
      <ThemeProvider>
        <NavbarMinimal />
      </ThemeProvider>
    </MantineProvider>,
  );
}

describe("NavbarMinimal", () => {
  beforeEach(() => {
    setTestPathname("/dashboard");
  });

  it("marca a aba ativa conforme a rota atual", () => {
    setTestPathname("/leads");

    renderNavbar();

    expect(screen.getByRole("link", { name: "Leads" })).toHaveAttribute("data-active", "true");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("data-active");
  });
});
