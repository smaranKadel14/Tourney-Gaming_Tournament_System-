// roles used in whole project
export type Role = "player" | "organizer" | "admin";

// full user info coming from backend
export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
};

// localStorage keys
const USER_KEY = "tourney_user";
const TOKEN_KEY = "tourney_token";

// save user + token after login/signup
export function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
}

// get logged in user
export function getAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

// get JWT token
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// logout
export function clearAuthUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

// helper → redirect based on role
export function roleHomePath(role: Role) {
  if (role === "organizer") return "/organizer";
  if (role === "admin") return "/admin";
  return "/player";
}
