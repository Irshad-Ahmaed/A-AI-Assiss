import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const correlationId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  config.headers["x-correlation-id"] = correlationId;

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.error || "An unexpected error occurred";
      if (typeof message === "string") toast.error(message);
      else if (Array.isArray(message)) toast.error(message[0]?.message || "Validation error");

      if (error.response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } else {
      toast.error("Network error. Please try again.");
    }
    return Promise.reject(error);
  }
);
