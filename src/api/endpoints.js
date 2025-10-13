import { http } from "./http";

export const Api = {
  searchTechnicians: (params) =>
    http.get("/technicians", { params }).then(r => r.data),
  getTechnician: (id) =>
    http.get(`/technicians/${id}`).then(r => r.data),
  createRequest: (body) =>
    http.post("/requests", body).then(r => r.data),
};
