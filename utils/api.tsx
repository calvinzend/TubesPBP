const BASE_URL = "http://localhost:3000";

export const api = {
  base: BASE_URL,
  uploads: `${BASE_URL}/uploads`,
  getProfilePicture: (filename?: string) =>
    filename?.startsWith("http")
      ? filename
      : `${BASE_URL}/${filename || "default-profile.png"}`,
};

/**
 * Fetch with Authorization header
 */
export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem("token");
  return fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * POST with auth — supports form-data (e.g. image upload)
 */
export const postWithAuth = async (
  endpoint: string,
  body: FormData | object,
  isFormData = false
): Promise<Response> => {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    body: isFormData ? (body as FormData) : JSON.stringify(body),
    headers,
  });
};

/**
 * PUT with auth — form-data (e.g. edit post with image or text)
 */
export const putWithAuth = async (
  endpoint: string,
  body: FormData | object,
  isFormData = false
): Promise<Response> => {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    body: isFormData ? (body as FormData) : JSON.stringify(body),
    headers,
  });
};

/**
 * DELETE with auth
 */
export const deleteWithAuth = async (endpoint: string): Promise<Response> =>
  fetchWithAuth(endpoint, {
    method: "DELETE",
  });

/**
 * Login user
 */
export const login = async (
  username: string,
  password: string
): Promise<{ token: string; user: any }> => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");

  // Simpan token ke localStorage
  localStorage.setItem("token", data.token);
  return data;
};

export const register = async (formData: FormData): Promise<any> => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Register failed");
  return data;
};