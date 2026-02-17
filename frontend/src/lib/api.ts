import axios from "axios";

// I am keeping backend URL here so I don't repeat it everywhere
export const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});
