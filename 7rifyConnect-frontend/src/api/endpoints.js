// src/api/endpoints.js
import { http } from "./http";

/* helpers */
const unwrap = (r) => (r?.data?.data ?? r?.data ?? r);
const toArray = (payload) => {
  const p = payload?.data ?? payload;
  if (Array.isArray(p)) return p;
  if (Array.isArray(p?.items)) return p.items;
  if (Array.isArray(p?.results)) return p.results;
  if (Array.isArray(p?.technicians)) return p.technicians;
  if (Array.isArray(p?.services)) return p.services;
  return Array.isArray(payload) ? payload : [];
};

const mapRegisterPayload = (b) => ({
  role: b.role,
  full_name: b.fullName ?? b.full_name ?? b.name,
  email: b.email,
  password: b.password,
  city: b.city ?? null,
  phone: b.phone ?? null,
});

const mapServicePayload = (b) => ({
  title: b.title,
  short_desc: b.shortDesc ?? b.short_desc ?? undefined,
  price_from: b.priceFrom ?? b.price_from ?? undefined,
  price_to: b.priceTo ?? b.price_to ?? undefined,
});

const mapRequestPayload = (b) => ({
  title: b.title,
  city: b.city,
  description: b.description ?? undefined,
  technician_id: b.technicianId ?? b.technician_id ?? undefined,
});

export const Api = {
  /* AUTH */
  register: (body) => http.post("/auth/register", mapRegisterPayload(body)).then(unwrap),
  login:    (body) => http.post("/auth/login", body).then(unwrap),
  me:              () => http.get("/auth/me").then(unwrap),

  /* ADMIN (يطابق /routes/api.php بالضبط) */
  getAdminMetrics:     ()         => http.get("/admin/metrics").then(unwrap),
  getAdminStats:       ()         => http.get("/admin/stats").then(unwrap),
  getAdminTechnicians: (params)   => http.get("/admin/technicians", { params }).then(unwrap),
  verifyTechnician:    (id)       => http.patch(`/admin/technicians/${id}/verify`).then(unwrap),
  updateTechnician:    (id, body) => http.patch(`/admin/technicians/${id}`, body).then(unwrap),
  getAdminRequests:    ()         => http.get("/admin/requests").then(unwrap),

  /* PUBLIC TECHS */
  searchTechnicians:   (params)   => http.get("/technicians", { params }).then((r) => toArray(unwrap(r))),
  getTechnician:       (id)       => http.get(`/technicians/${id}`).then(unwrap),
  getTechnicianReviews:(id)       => http.get(`/technicians/${id}/reviews`).then(unwrap),
  getTechnicianServices:(id)      => http.get(`/technicians/${id}/services`).then(unwrap),
  getTopTechnicians:   ()         => http.get("/technicians/top").then((r) => toArray(unwrap(r))),
  getTopServices:      ()         => http.get("/services/top").then((r) => toArray(unwrap(r))),

  /* REQUESTS (client) */
  createRequest: (body) => http.post("/requests", mapRequestPayload(body)).then(unwrap),
  getMyRequests: ()     => http.get("/requests/me").then(unwrap),

  /* TECH DASHBOARD (طابق الراوتس ديالك) */
  // ملاحظة: ما كاينش /tech/dashboard فـ routes ⇒ حيدناه
  getTechRequests: (params) => http.get("/tech/requests", { params }).then(unwrap),
  acceptRequest:   (id)     => http.post(`/tech/requests/${id}/accept`).then(unwrap),
  startRequest:    (id)     => http.post(`/tech/requests/${id}/start`).then(unwrap),
  completeRequest: (id)     => http.post(`/tech/requests/${id}/complete`).then(unwrap),
  cancelRequest:   (id)     => http.post(`/tech/requests/${id}/cancel`).then(unwrap),

  // تحديث بروفايل الحرفي الذاتي والخدمات/البورتفوليو ⇒ حسب routes: /tech/me/...
  updateMyTechProfile:  (body)                => http.patch(`/tech/me`, body).then(unwrap),
  createMyService:      (body)                => http.post(`/tech/me/services`, mapServicePayload(body)).then(unwrap),
  updateMyService:      (sid, body)           => http.patch(`/tech/me/services/${sid}`, mapServicePayload(body)).then(unwrap),
  deleteMyService:      (sid)                 => http.delete(`/tech/me/services/${sid}`).then(unwrap),
  getMyPortfolio:       ()                    => http.get(`/tech/me/portfolio`).then(unwrap),
  uploadToMyPortfolio:  (body)                => http.post(`/tech/me/portfolio`, body).then(unwrap),
  deleteFromMyPortfolio:(imgId)               => http.delete(`/tech/me/portfolio/${imgId}`).then(unwrap),

  /* CHAT */
  getChatThreads:    (me)       => http.get("/chat/threads", { params: { me } }).then(unwrap),
  getThreadMessages: (threadId) => http.get(`/chat/threads/${threadId}/messages`).then(unwrap),
  sendMessage:       (threadId, body) => http.post(`/chat/threads/${threadId}/messages`, body).then(unwrap),
  createThread:      (peerUserId)     => http.post(`/chat/threads`, { peerUserId }).then(unwrap),

  /* UPLOAD */
  upload: (fileOrName) => {
    if (typeof File !== "undefined" && fileOrName instanceof File) {
      const fd = new FormData();
      fd.append("file", fileOrName);
      return http.post(`/upload`, fd, { headers: { "Content-Type": "multipart/form-data" } }).then(unwrap);
    }
    return http.post(`/upload`, { name: String(fileOrName || "img") }).then(unwrap);
  },
};
