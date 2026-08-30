import type { AuthUser } from "../context/AuthContext";

interface LoginResponse {
  user: AuthUser;
  csrfToken: string;
}

interface CsrfResponse {
  csrfToken: string;
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const res = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error?.message || "Login failed");
  }

  return res.json();
}

export async function logoutRequest(csrfToken: string): Promise<void> {
  const res = await fetch("/api/v1/auth/logout", {
    method: "POST",
    headers: { "X-CSRF-Token": csrfToken },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }
}

export async function meRequest(): Promise<AuthUser> {
  const res = await fetch("/api/v1/auth/me", {
    method: "GET",
    credentials: "include",
  });

  if (res.status === 401) {
    throw new Error("UNAUTHENTICATED");
  }
  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return res.json();
}

export async function csrfRequest(): Promise<string> {
  const res = await fetch("/api/v1/auth/csrf", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch CSRF token");
  }

  const data: CsrfResponse = await res.json();
  return data.csrfToken;
}

export async function forgotPasswordRequest(email: string): Promise<void> {
  const res = await fetch("/api/v1/auth/password-reset/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error("Request failed");
  }
}

export async function resetPasswordRequest(
  token: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch("/api/v1/auth/password-reset/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, newPassword }),
  });

  if (!res.ok) {
    throw new Error("Password reset failed");
  }
}
