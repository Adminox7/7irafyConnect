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
  specialties: Array.isArray(b.specialties) ? b.specialties : undefined,
  specialty_description: b.specialtyDescription ?? b.specialty_description ?? b.bio,
  bio: b.bio ?? b.specialtyDescription ?? undefined,
  is_premium: typeof b.isPremium === "boolean" ? b.isPremium : undefined,
  avatar_url: b.avatarUrl ?? b.avatar_url ?? undefined,
  national_id_front_url: b.nationalIdFrontUrl ?? b.national_id_front_url ?? undefined,
  national_id_back_url: b.nationalIdBackUrl ?? b.national_id_back_url ?? undefined,
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

const mapTechProfilePayload = (b) => ({
  full_name: b.fullName ?? b.full_name ?? undefined,
  city: b.city ?? undefined,
  phone: b.phone ?? undefined,
  bio: b.bio ?? undefined,
  specialties: Array.isArray(b.specialties) ? b.specialties : undefined,
  is_premium: typeof b.isPremium === "boolean" ? b.isPremium : undefined,
  avatarUrl: b.avatarUrl ?? b.avatar_url ?? undefined,
});

const mapMessagePayload = (payload) => {
  if (typeof payload === "string") {
    const text = payload.trim();
    return {
      text,
      body: text,
      message: text,
    };
  }
  const rawText =
    payload?.text ??
    payload?.body ??
    payload?.message ??
    payload?.content ??
    payload?.textBody ??
    "";
  const normalized =
    typeof rawText === "string" ? rawText : rawText != null ? String(rawText) : "";
  const trimmed = normalized.trim();
  const finalText = trimmed || normalized;
  return {
    ...(payload || {}),
    text: payload?.text ?? finalText,
    body: payload?.body ?? finalText,
    message: payload?.message ?? finalText,
  };
};

export const Api = {
  /* AUTH */
  register: (body) => http.post("/auth/register", mapRegisterPayload(body)).then(unwrap),
  login:    (body) => http.post("/auth/login", body).then(unwrap),
  me:              (config) => http.get("/auth/me", config).then(unwrap),
  updateProfile:   (body)   => http.patch("/auth/me", body).then(unwrap),

    /* ADMIN (يطابق /routes/api.php بالضبط) */
    getAdminMetrics:     ()         => http.get("/admin/metrics").then(unwrap),
    getAdminStats:       ()         => http.get("/admin/stats").then(unwrap),
    getAdminTechnicians: (params)   => http.get("/admin/technicians", { params }).then(unwrap),
    getPendingTechnicians: ()       =>
      http.get("/admin/technicians", { params: { status: "pending" } }).then(unwrap),
    approveTechnician:   (id)       => http.patch(`/admin/technicians/${id}/verify`).then(unwrap),
    rejectTechnician:    (id, body) => http.post(`/admin/technicians/${id}/reject`, body).then(unwrap),
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
  updateMyTechProfile:  (body)                => http.patch(`/tech/me`, mapTechProfilePayload(body)).then(unwrap),
  createMyService:      (body)                => http.post(`/tech/me/services`, mapServicePayload(body)).then(unwrap),
  updateMyService:      (sid, body)           => http.patch(`/tech/me/services/${sid}`, mapServicePayload(body)).then(unwrap),
  deleteMyService:      (sid)                 => http.delete(`/tech/me/services/${sid}`).then(unwrap),
  getMyPortfolio:       ()                    => http.get(`/tech/me/portfolio`).then(unwrap),
  uploadToMyPortfolio:  (body)                => http.post(`/tech/me/portfolio`, body).then(unwrap),
  deleteFromMyPortfolio:(imgId)               => http.delete(`/tech/me/portfolio/${imgId}`).then(unwrap),

    /* CHAT */
    getChatThreads:    (params)   => http.get("/chat/threads", { params }).then(unwrap),
    getThreadMessages: (threadId) => http.get(`/chat/threads/${threadId}/messages`).then(unwrap),
    sendMessage:       (threadId, body) =>
      http.post(`/chat/threads/${threadId}/messages`, mapMessagePayload(body)).then(unwrap),
    createThread:      (peerUserId, extra = {}) =>
      http
        .post(`/chat/threads`, { peerUserId, userId: peerUserId, ...extra })
        .then(unwrap),
    markMessageRead:   (messageId)     => http.post(`/messages/${messageId}/read`).then(unwrap),

  /* UPLOAD */
  upload: (fileOrName, options = {}) => {
    const skipAuth = options.skipAuth === true;
    if (typeof File !== "undefined" && fileOrName instanceof File) {
      const fd = new FormData();
      fd.append("file", fileOrName);
      return http
        .post(`/upload`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
          skipAuth,
        })
        .then(unwrap);
    }
    return http.post(`/upload`, { name: String(fileOrName || "img") }, { skipAuth }).then(unwrap);
  },
};
