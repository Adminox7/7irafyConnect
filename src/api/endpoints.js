import { http } from "./http";

/** ===== Helpers: normalize payloads ===== */
const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.technicians)) return payload.technicians;
  if (Array.isArray(payload?.services)) return payload.services;
  return [];
};

/**
 * @typedef {Object} Technician
 * @property {number} id
 * @property {string} fullName
 * @property {string} city
 * @property {string[]} specialties
 * @property {boolean} isPremium
 * @property {number} averageRating
 * @property {number} lat
 * @property {number} lng
 */

/**
 * @typedef {('all'|'new'|'accepted'|'in_progress'|'done'|'cancelled')} RequestStatus
 */

/**
 * @typedef {Object} ServiceRequest
 * @property {number} id
 * @property {string} title
 * @property {string} city
 * @property {RequestStatus} status
 * @property {number=} price
 * @property {string=} client
 * @property {string} createdAt
 * @property {string=} description
 * @property {number=} technicianId
 */

/**
 * @typedef {Object} DashboardKPI
 * @property {number} newC
 * @property {number} accC
 * @property {number} progC
 * @property {number} doneC
 * @property {number} revenue
 */

/**
 * @typedef {Object} WeeklyPoint
 * @property {string} date
 * @property {number} requests
 */

/**
 * @typedef {Object} TechDashboard
 * @property {DashboardKPI} kpi
 * @property {ServiceRequest[]} recent
 * @property {WeeklyPoint[]} weekly
 */

export const Api = {
  // ========== AUTH ==========
  register: (body) => http.post("auth/register", body).then((r) => r.data),
  login: (body) => http.post("auth/login", body).then((r) => r.data),
  me: () => http.get("auth/me").then((r) => r.data),

  // ========== ADMIN ==========
  getAdminMetrics: () => http.get("admin/metrics").then((r) => r.data),
  getAdminStats: () => http.get("admin/stats").then((r) => r.data),
  getAdminTechnicians: (params) =>
    http.get("admin/technicians", { params }).then((r) => r.data),
  verifyTechnician: (id) =>
    http.patch(`admin/technicians/${id}/verify`).then((r) => r.data),
  updateTechnician: (id, body) =>
    http.patch(`admin/technicians/${id}`, body).then((r) => r.data),
  getAdminRequests: () => http.get("admin/requests").then((r) => r.data),

  /**
   * البحث عن الحرفيين
   * @param {{ city?: string, q?: string }} params
   * @returns {Promise<Technician[]>}
   */
  searchTechnicians: (params) =>
    http.get("technicians", { params }).then((r) => r.data),

  /**
   * جلب تفاصيل الحرفي
   * @param {number|string} id
   * @returns {Promise<Technician>}
   */
  getTechnician: (id) => http.get(`technicians/${id}`).then((r) => r.data),
  getTechnicianReviews: (id) =>
    http.get(`technicians/${id}/reviews`).then((r) => r.data),
  getTechnicianServices: (id) =>
    http.get(`technicians/${id}/services`).then((r) => r.data),
  // Portfolio
  getTechnicianPortfolio: (id) =>
    http.get(`technicians/${id}/portfolio`).then((r) => r.data),

  /** ✅ ديما Array */
  getTopTechnicians: () =>
    http.get("technicians/top").then((r) => toArray(r.data)),

  /** ✅ ديما Array */
  getTopServices: () =>
    http.get("services/top").then((r) => toArray(r.data)),

  /**
   * إنشاء طلب خدمة جديد
   * @param {{ title: string, city: string, description: string, technicianId?: number }} body
   * @returns {Promise<ServiceRequest>}
   */
  createRequest: (body) =>
    http.post("requests", body).then((r) => r.data),

  /**
   * طلباتي (الزبون)
   * @returns {Promise<ServiceRequest[]>}
   */
  getMyRequests: () => http.get("requests/me").then((r) => r.data),

  /**
   * لوحة الحرفي (KPIs + recent + weekly)
   * @returns {Promise<TechDashboard>}
   */
  getTechDashboard: () => http.get("tech/dashboard").then((r) => r.data),

  /**
   * جميع الطلبات الخاصة بالحرفي حسب الحالة
   * @param {{ status?: RequestStatus }} params
   * @returns {Promise<ServiceRequest[]>}
   */
  getTechRequests: (params) =>
    http.get("tech/requests", { params }).then((r) => r.data),

  /**
   * عمليات الحالة على طلبات الحرفي
   * @param {number|string} id
   * @returns {Promise<ServiceRequest>}
   */
  acceptRequest: (id) =>
    http.post(`tech/requests/${id}/accept`).then((r) => r.data),
  startRequest: (id) =>
    http.post(`tech/requests/${id}/start`).then((r) => r.data),
  completeRequest: (id) =>
    http.post(`tech/requests/${id}/complete`).then((r) => r.data),
  cancelRequest: (id) =>
    http.post(`tech/requests/${id}/cancel`).then((r) => r.data),

  // ========== CHAT ==========
  getChatThreads: (me) =>
    http.get("chat/threads", { params: { me } }).then((r) => r.data),
  getThreadMessages: (threadId) =>
    http.get(`chat/threads/${threadId}/messages`).then((r) => r.data),
  sendMessage: (threadId, body) =>
    http.post(`chat/threads/${threadId}/messages`, body).then((r) => r.data),
  createThread: (peerUserId) =>
    http.post(`chat/threads`, { peerUserId }).then((r) => r.data),

  // ========== TECH (SELF) ==========
  updateTechnicianProfile: (id, body) =>
    http.patch(`technicians/${id}`, body).then((r) => r.data),
  createTechnicianService: (id, body) =>
    http.post(`technicians/${id}/services`, body).then((r) => r.data),
  updateTechnicianService: (id, serviceId, body) =>
    http.patch(`technicians/${id}/services/${serviceId}`, body).then((r) => r.data),
  deleteTechnicianService: (id, serviceId) =>
    http.delete(`technicians/${id}/services/${serviceId}`).then((r) => r.data),
  addPortfolioImage: (id, body) =>
    http.post(`technicians/${id}/portfolio`, body).then((r) => r.data),
  deletePortfolioImage: (id, imageId) =>
    http.delete(`technicians/${id}/portfolio/${imageId}`).then((r) => r.data),

  // Upload helper
  upload: (fileOrName) => {
    if (fileOrName instanceof File) {
      const fd = new FormData();
      fd.append("file", fileOrName);
      return http.post("upload", fd, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
    }
    return http.post("upload", { name: String(fileOrName || "img") }).then((r) => r.data);
  },
};
