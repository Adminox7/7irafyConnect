import { http } from "./http";

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

  /**
   * إنشاء طلب خدمة جديد
   * @param {{ title: string, city: string, description: string, technicianId?: number }} body
   * @returns {Promise<ServiceRequest>}
   */
  createRequest: (body) => http.post("requests", body).then((r) => r.data),

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
  acceptRequest: (id) => http.post(`tech/requests/${id}/accept`).then((r) => r.data),
  startRequest: (id) => http.post(`tech/requests/${id}/start`).then((r) => r.data),
  completeRequest: (id) => http.post(`tech/requests/${id}/complete`).then((r) => r.data),
  cancelRequest: (id) => http.post(`tech/requests/${id}/cancel`).then((r) => r.data),
};
