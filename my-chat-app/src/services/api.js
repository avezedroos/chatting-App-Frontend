import axios from "axios";

const API_BASE = "https://chatting-app-backend-ofme.onrender.com/api";
// const API_BASE = "http://192.168.1.4:5000/api";

export const api = axios.create({
  baseURL: API_BASE,
});

export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
};
