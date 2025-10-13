import axios from "axios";
export const http = axios.create({
  baseURL: "/api/v1", // من بعد نبدلوها ل Laravel
});
