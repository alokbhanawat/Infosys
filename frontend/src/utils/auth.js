import { jwtDecode } from "jwt-decode";

export function getStoredToken() {
  return localStorage.getItem("token");
}

export function getStoredUserId() {
  return localStorage.getItem("userId");
}

export function setStoredSession({ token, userId }) {
  if (token) {
    localStorage.setItem("token", token);
  }

  if (userId !== undefined && userId !== null) {
    localStorage.setItem("userId", String(userId));
  }
}

export function clearStoredToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
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

  if (!isTokenValid(token)) {
    return null;
  }

  try {
    return jwtDecode(token);
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
