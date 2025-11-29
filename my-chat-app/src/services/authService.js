import { api, setAuthToken } from "./api";

export const verifyAuthToken = async () => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) return { valid: false };

    setAuthToken(token);

    const res = await api.get("/auth/verify"); // your backend route
    return { valid: true, userdata: res.data.userdata };
  } catch {
    return { valid: false };
  }
};
