export type { AppUser } from "@/services/authService";

export type AuthApiError = {
  error: string;
  details?: unknown;
};
