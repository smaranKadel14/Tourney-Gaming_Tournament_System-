import axios from "axios";

// I am keeping backend URL here so I don't repeat it everywhere
export const BASE_URL = "http://localhost:5000";

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

