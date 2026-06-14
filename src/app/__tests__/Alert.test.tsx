import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Alert } from "../components/Alert/Alert";

describe("Alert", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("fecha automaticamente depois do tempo configurado", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(<Alert message="Lead salvo." type="success" onClose={onClose} />);

    expect(screen.getByText("Lead salvo.")).toBeInTheDocument();
    vi.advanceTimersByTime(4000);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
