export interface SessionData {
  id: string;
  name: string;
  role?: string;
  token: string;
  refreshToken: string;
}

export function saveSession(session: SessionData): void {
  localStorage.setItem("userId", session.id);
  localStorage.setItem("token", session.token);
  localStorage.setItem("refreshToken", session.refreshToken);
  localStorage.setItem("userName", session.name);
  if (session.role) {
    localStorage.setItem("userRole", session.role);
  }
}

export function saveTokens(token: string, refreshToken: string): void {
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
}

export function clearSession(): void {
  localStorage.removeItem("userId");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userName");
  localStorage.removeItem("userRole");
}

export function getAccessToken(): string | null {
  return localStorage.getItem("token");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refreshToken");
}
