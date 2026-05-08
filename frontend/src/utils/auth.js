import { jwtDecode } from "jwt-decode";

export function getStoredToken() {
  return localStorage.getItem("token");
}

export function getStoredUserId() {
  return localStorage.getItem("userId");
}

export function getStoredRole() {
  return localStorage.getItem("role");
}

export function setStoredSession({ token, userId, role }) {
  if (token) {
    localStorage.setItem("token", token);
  }

  if (userId !== undefined && userId !== null) {
    localStorage.setItem("userId", String(userId));
  }

  if (role) {
    localStorage.setItem("role", role);
  }
}

export function clearStoredToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
}

export function isTokenValid(token = getStoredToken()) {
  if (!token) {
    return false;
  }

  try {
    const decodedToken = jwtDecode(token);

    if (!decodedToken?.exp) {
      return true;
    }

    return decodedToken.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function getCurrentUser() {
  const token = getStoredToken();
  const storedRole = getStoredRole();

  if (!isTokenValid(token)) {
    return null;
  }

  try {
    const decodedToken = jwtDecode(token);

    if (!decodedToken?.role && storedRole) {
      return {
        ...decodedToken,
        role: storedRole,
      };
    }

    return decodedToken;
  } catch {
    return null;
  }
}

export function getHomeRoute(user = getCurrentUser()) {
  if (!user) {
    return "/login";
  }

  return user.role === "ADMIN" ? "/admin" : "/products";
}
