import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthGate } from "@/features/auth/AuthGate";
import { LoginScreen } from "@/features/auth/LoginScreen";
import { useSignOut } from "@/features/auth/sign-out";
import { errorResponse, okResponse, renderWithProviders } from "@/i18n/test-utils";
import { Auth } from "@/sdk/generated";
import { loadCsrfToken, setCsrfToken } from "@/sdk/session";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/sdk/generated", () => ({
  Auth: { authMe: vi.fn(), authLogin: vi.fn(), authLogout: vi.fn(), authCsrf: vi.fn() },
}));
vi.mock("@/sdk/session", () => ({ loadCsrfToken: vi.fn(), setCsrfToken: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

const USER = { username: "author", first_name: "", last_name: "", email: "" };

describe("sign-in", () => {
  it("loads the CSRF token, logs in, then keeps the token the login returns", async () => {
    vi.mocked(loadCsrfToken).mockResolvedValue(undefined);
    vi.mocked(Auth.authLogin).mockResolvedValue(
      okResponse({ csrf_token: "new-token", user: USER }) as never,
    );
    renderWithProviders(<LoginScreen />);

    await userEvent.type(screen.getByLabelText("Username"), "author");
    await userEvent.type(screen.getByLabelText("Password"), "secret");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(setCsrfToken).toHaveBeenCalledWith("new-token"));
    expect(vi.mocked(loadCsrfToken).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(Auth.authLogin).mock.invocationCallOrder[0],
    );
    expect(Auth.authLogin).toHaveBeenCalledWith(
      expect.objectContaining({ body: { username: "author", password: "secret" } }),
    );
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("says so, and goes nowhere, when the credentials are wrong", async () => {
    vi.mocked(loadCsrfToken).mockResolvedValue(undefined);
    vi.mocked(Auth.authLogin).mockResolvedValue(errorResponse(401) as never);
    renderWithProviders(<LoginScreen />);

    await userEvent.type(screen.getByLabelText("Username"), "author");
    await userEvent.type(screen.getByLabelText("Password"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid username or password.")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    expect(setCsrfToken).not.toHaveBeenCalled();
  });

  it("speaks Persian when the interface language is Persian", () => {
    renderWithProviders(<LoginScreen />, { language: "fa" });

    expect(screen.queryByRole("button", { name: "Sign in" })).not.toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});

describe("the gate", () => {
  it("shows its children to a signed-in author", async () => {
    vi.mocked(Auth.authMe).mockResolvedValue(okResponse(USER) as never);
    renderWithProviders(
      <AuthGate>
        <p>secret page</p>
      </AuthGate>,
    );

    expect(await screen.findByText("secret page")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("sends a signed-out visitor to /login and shows nothing", async () => {
    vi.mocked(Auth.authMe).mockResolvedValue(errorResponse(403) as never);
    renderWithProviders(
      <AuthGate>
        <p>secret page</p>
      </AuthGate>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText("secret page")).not.toBeInTheDocument();
  });
});

describe("sign-out", () => {
  function Harness() {
    const signOut = useSignOut();
    return <button onClick={signOut}>out</button>;
  }

  it("ends the session, forgets the token and goes to /login", async () => {
    vi.mocked(Auth.authLogout).mockResolvedValue(okResponse({}) as never);
    renderWithProviders(<Harness />);

    await userEvent.click(screen.getByRole("button", { name: "out" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(Auth.authLogout).toHaveBeenCalled();
    expect(setCsrfToken).toHaveBeenCalledWith(null);
  });
});
