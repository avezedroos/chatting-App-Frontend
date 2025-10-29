import axios from "axios";

const API_BASE = "https://chatting-app-backend-ofme.onrender.com/api";

export const api = axios.create({
  baseURL: API_BASE,
});

export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
};
