import type { AppUser } from "@/types/auth";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/validators/auth";

async function parseJson(response: Response) {
  return response.json().catch(() => ({}));
}

export async function fetchCurrentUser(): Promise<AppUser | null> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Unable to fetch user",
    );
  }

  return data.user as AppUser;
}

export async function loginRequest(input: LoginInput) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Unable to log in",
    );
  }

  return data as { user: AppUser | null };
}

export type RegisterResult = {
  user: AppUser;
  requiresLogin?: boolean;
  message?: string;
};

export async function registerRequest(
  input: RegisterInput,
): Promise<RegisterResult> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Unable to register",
    );
  }

  return data as RegisterResult;
}

export async function forgotPasswordRequest(input: ForgotPasswordInput) {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Unable to request password reset",
    );
  }

  return data as { message: string };
}

export async function resetPasswordRequest(input: ResetPasswordInput) {
  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Unable to reset password",
    );
  }

  return data as { success: boolean };
}

export async function logoutRequest() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Unable to log out",
    );
  }
}
