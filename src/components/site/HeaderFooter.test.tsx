import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Footer } from "./Footer";
import { Header } from "./Header";

function renderHeader() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Header onSearchClick={() => {}} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("mobile header and footer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows current temperature and opens the mobile menu", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ current: { temperature: 19.2 } }),
    }));

    renderHeader();

    await waitFor(() =>
      expect(
        screen.getAllByLabelText("Trenutna temperatura i vremenska prognoza za Miloševac")[0],
      ).toHaveTextContent("19°"),
    );

    expect(screen.getByLabelText("Naslovna strana")).toBeInTheDocument();
    expect(screen.getByLabelText("FK Posavina")).toBeInTheDocument();
    expect(screen.getByLabelText("Prekidi struje")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Pretraži vijesti").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Otvori meni" }));

    expect(screen.queryByText("Vrijeme")).not.toBeInTheDocument();
    expect(screen.queryByText("Sport")).not.toBeInTheDocument();
    expect(screen.getAllByText("Obavještenja").length).toBeGreaterThan(0);
  });

  it("does not show the Miloševac wordmark in the header", () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }));

    renderHeader();

    expect(screen.queryByRole("link", { name: "Miloševac - naslovna strana" })).not.toBeInTheDocument();
  });

  it("uses centered portal links and real social profiles without removed categories", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Miloševac na Facebooku" })).toHaveAttribute(
      "href",
      "https://www.facebook.com/milosevac.official",
    );
    expect(screen.getByRole("link", { name: "Miloševac na Instagramu" })).toHaveAttribute(
      "href",
      "https://www.instagram.com/milosevac.official/",
    );
    expect(screen.queryByText("Projekti")).not.toBeInTheDocument();
    expect(screen.queryByText("Slike")).not.toBeInTheDocument();
  });
});
