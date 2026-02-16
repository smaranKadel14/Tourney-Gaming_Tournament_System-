export type Role = "player" | "organizer" | "admin";

export type AuthUser = {
  email: string;
  role: Role;
};

const KEY = "tourney_user";

// save user data after login/signup
export function setAuthUser(user: AuthUser) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

// get logged-in user
export function getAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

// logout
export function clearAuthUser() {
  localStorage.removeItem(KEY);
}
