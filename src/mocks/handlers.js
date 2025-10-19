import { http, HttpResponse, delay } from "msw";

/* ==============================
   TECHNICIANS (حرفيين تجريبياً)
   ============================== */
const technicians = [
  { id: 1, fullName: "Youssef El Elec", city: "Rabat", specialties: ["كهربائي", "تركيب ثريات"], isPremium: true, averageRating: 4.8, lat: 34.02, lng: -6.83, avatarUrl: "", bio: "خبرة 8 سنوات في حلول الكهرباء المنزلية" },
  { id: 2, fullName: "Hicham Plomb", city: "Salé", specialties: ["سباكة"], isPremium: false, averageRating: 4.5, lat: 34.05, lng: -6.78, avatarUrl: "", bio: "تصليح و تركيب مواسير الماء" },
  { id: 3, fullName: "Khalid Deco", city: "Temara", specialties: ["صباغة", "ديكور"], isPremium: false, averageRating: 4.6, lat: 33.93, lng: -6.91, avatarUrl: "", bio: "ديكور و صباغة داخلية أنيقة" },
];

// Technician related mock maps
const technicianReviews = {
  1: [
    { id: "r1", author: "Amine L.", rating: 5, comment: "خدمة ممتازة و سريع", date: new Date().toISOString() },
    { id: "r2", author: "Sara B.", rating: 4, comment: "دقيق فالمواعيد", date: new Date(Date.now() - 86400000).toISOString() },
  ],
  2: [
    { id: "r3", author: "Yassine T.", rating: 5, comment: "حل المشكل فالساعة", date: new Date().toISOString() },
  ],
  3: [],
};

const technicianServices = {
  1: [
    { id: "s1", title: "تصليح كهرباء خفيفة", priceFrom: 150, priceTo: 300, unit: "خدمة", shortDesc: "إصلاح أعطال بسيطة" },
    { id: "s2", title: "تركيب ثريا", priceFrom: 200, priceTo: 400, unit: "خدمة", shortDesc: "تركيب آمن ومنظم" },
  ],
  2: [
    { id: "s3", title: "تصليح تسريب ماء", priceFrom: 120, priceTo: 280, unit: "خدمة", shortDesc: "كشف و إصلاح التسريب" },
  ],
  3: [
    { id: "s4", title: "صباغة غرفة", priceFrom: 400, priceTo: 800, unit: "خدمة", shortDesc: "صباغة نظيفة وسريعة" },
  ],
};

// Top services catalog (for Home "Top Services")
const topServices = [
  { id: "ts1", title: "تركيب ثريا", ordersCount: 82, avgPrice: 320, icon: "💡" },
  { id: "ts2", title: "تصليح تسريب ماء", ordersCount: 65, avgPrice: 250, icon: "🚰" },
  { id: "ts3", title: "صباغة غرفة", ordersCount: 41, avgPrice: 650, icon: "🎨" },
  { id: "ts4", title: "تركيب محبس ماء", ordersCount: 23, avgPrice: 180, icon: "🔧" },
  { id: "ts5", title: "تركيب ستالايت", ordersCount: 51, avgPrice: 220, icon: "📡" },
  { id: "ts6", title: "تنظيف مكيف", ordersCount: 37, avgPrice: 200, icon: "❄️" },
];

/* ==============================
   AUTH (مستخدمون تجريبياً)
   ============================== */
let users = [
  // حسابات اختبار حسب المواصفات
  { id: 1, role: "admin", name: "Admin", email: "admin@site.com", password: "admin123", city: "Rabat", phone: "0600000000", verified: true },
  { id: 2, role: "technicien", name: "Tech Pro", email: "tech@site.com", password: "tech123", city: "Rabat", phone: "0611111111", verified: true },
  { id: 3, role: "client", name: "Client Test", email: "client@site.com", password: "client123", city: "Salé", phone: "0622222222", verified: true },
  // تقني ينتظر التحقق لإظهار القائمة في لوحة الإدارة
  { id: 4, role: "technicien", name: "Pending Tech", email: "pending@site.com", password: "pending123", city: "Temara", phone: "0633333333", verified: false },
];

function sanitizeUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

/* ==============================
   REQUESTS (طلبات تجريبية)
   ============================== */
let requests = [
  { id: 1001, title: "تصليح ضو الصالون", city: "Rabat", status: "new", price: 250, client: "Amine L.", createdAt: "2025-10-10T10:00:00Z" },
  { id: 1002, title: "تركيب ثريا", city: "Salé", status: "accepted", price: 300, client: "Sara B.", createdAt: "2025-10-11T12:00:00Z" },
  { id: 1003, title: "تصليح بريز", city: "Rabat", status: "in_progress", price: 180, client: "Yassine T.", createdAt: "2025-10-11T18:00:00Z" },
  { id: 1004, title: "صيانة عامة", city: "Temara", status: "done", price: 450, client: "Nadia A.", createdAt: "2025-10-09T16:00:00Z" },
];

/* ==============================
   HELPERS
   ============================== */
function kpiFromRequests(items) {
  const newC = items.filter((x) => x.status === "new").length;
  const accC = items.filter((x) => x.status === "accepted").length;
  const progC = items.filter((x) => x.status === "in_progress").length;
  const doneC = items.filter((x) => x.status === "done").length;
  const revenue = items
    .filter((x) => x.status === "done")
    .reduce((s, x) => s + (x.price || 0), 0);
  return { newC, accC, progC, doneC, revenue };
}

function weeklySeries(items) {
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const count = items.filter((x) => x.createdAt.slice(0, 10) === key).length;
    return { date: key.slice(5), requests: count };
  });
  return days;
}

// ============ CHAT MOCK DATA ============
// Store participants to derive peer per "me"; messages keyed by thread id
const chatThreads = [
  { id: "t1", participants: [2, 3], updatedAt: new Date().toISOString(), lastMessage: "مرحبا! واش ممكن اليوم؟" },
  { id: "t2", participants: [1, 3], updatedAt: new Date(Date.now() - 3600_000).toISOString(), lastMessage: "تم التحقق من الحساب" },
];

/** @type {Record<string, Array<{id:string, threadId:string, fromUserId:number, text:string, createdAt:string, read?:boolean}>>} */
const chatMessages = {
  t1: [
    { id: "m1", threadId: "t1", fromUserId: 3, text: "السلام عليكم! بغيت موعد", createdAt: new Date(Date.now() - 7200_000).toISOString(), read: true },
    { id: "m2", threadId: "t1", fromUserId: 2, text: "وعليكم السلام! واش ممكن اليوم؟", createdAt: new Date(Date.now() - 7100_000).toISOString(), read: true },
  ],
  t2: [
    { id: "m3", threadId: "t2", fromUserId: 1, text: "مرحبا، تم قبولك كحرفي مميز", createdAt: new Date(Date.now() - 4000_000).toISOString(), read: true },
  ],
};

function getAuthUserIdFromHeaders(headers) {
  const auth = headers.get("authorization") || headers.get("Authorization");
  if (!auth) return null;
  const parts = auth.split(" ");
  const token = parts[1] || "";
  const id = Number(String(token).replace("mock-", ""));
  return Number.isFinite(id) ? id : null;
}

/* ==============================
   API HANDLERS
   ============================== */
export const handlers = [
  /* ==============================
     AUTH ROUTES
     ============================== */
  http.post("/api/v1/auth/register", async ({ request }) => {
    await delay(120);
    const body = await request.json();
    const { name, email, password, city, phone, role } = body || {};
    if (!name || !email || !password || !role) {
      return HttpResponse.json({ message: "حقول ناقصة" }, { status: 400 });
    }
    if (!["client", "technicien"].includes(role)) {
      return HttpResponse.json({ message: "دور غير صالح" }, { status: 400 });
    }
    const exists = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (exists) {
      return HttpResponse.json({ message: "البريد مسجل من قبل" }, { status: 409 });
    }
    const created = {
      id: Date.now(),
      role,
      name,
      email,
      password,
      city: city || "",
      phone: phone || "",
      verified: role === "technicien" ? false : true,
    };
    users.push(created);
    const token = `mock-${created.id}`;
    return HttpResponse.json({ user: sanitizeUser(created), token, role: created.role }, { status: 201 });
  }),

  http.post("/api/v1/auth/login", async ({ request }) => {
    await delay(120);
    const body = await request.json();
    const { email, password } = body || {};
    const u = users.find((x) => x.email.toLowerCase() === String(email).toLowerCase() && x.password === password);
    if (!u) return HttpResponse.json({ message: "بيانات الدخول غير صحيحة" }, { status: 401 });
    const token = `mock-${u.id}`;
    return HttpResponse.json({ token, role: u.role, user: sanitizeUser(u) }, { status: 200 });
  }),

  http.get("/api/v1/auth/me", async ({ request }) => {
    await delay(120);
    const auth = request.headers.get("authorization") || request.headers.get("Authorization");
    if (!auth) return HttpResponse.json({ message: "غير مصرح" }, { status: 401 });
    const parts = auth.split(" ");
    const token = parts[1] || "";
    const id = Number(String(token).replace("mock-", ""));
    const u = users.find((x) => x.id === id);
    if (!u) return HttpResponse.json({ message: "غير مصرح" }, { status: 401 });
    return HttpResponse.json({ user: sanitizeUser(u), role: u.role }, { status: 200 });
  }),

  /* ==============================
     ADMIN ROUTES
     ============================== */
  http.get("/api/v1/admin/metrics", async () => {
    await delay(120);
    const techniciansUsers = users.filter((u) => u.role === "technicien");
    const pendingTechnicians = techniciansUsers.filter((t) => !t.verified);
    const metrics = {
      users: users.length,
      technicians: techniciansUsers.length,
      pendingTechnicians: pendingTechnicians.length,
      totalRequests: requests.length,
      revenue: kpiFromRequests(requests).revenue,
    };
    return HttpResponse.json(metrics, { status: 200 });
  }),

  // Admin stats
  http.get("/api/v1/admin/stats", async () => {
    await delay(120);
    const techniciansUsers = users.filter((u) => u.role === "technicien");
    const newRequestsWeek = weeklySeries(requests).reduce((s, x) => s + x.requests, 0);
    const ratings = technicians.map((t) => t.averageRating).filter((x) => Number.isFinite(x));
    const avgRating = ratings.length ? Number((ratings.reduce((s, x) => s + x, 0) / ratings.length).toFixed(2)) : 0;
    return HttpResponse.json({
      technicians: techniciansUsers.length,
      users: users.length,
      newRequestsWeek,
      avgRating,
    });
  }),

  http.get("/api/v1/admin/technicians", async ({ request }) => {
    await delay(120);
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "pending";
    const techniciansUsers = users.filter((u) => u.role === "technicien");
    const filtered = status === "pending" ? techniciansUsers.filter((t) => !t.verified) : techniciansUsers;
    return HttpResponse.json(filtered.map(sanitizeUser), { status: 200 });
  }),

  http.patch("/api/v1/admin/technicians/:id/verify", async ({ params }) => {
    await delay(120);
    const id = Number(params.id);
    const idx = users.findIndex((u) => u.id === id && u.role === "technicien");
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    users[idx] = { ...users[idx], verified: true };
    return HttpResponse.json(sanitizeUser(users[idx]), { status: 200 });
  }),

  // General PATCH to update technician record (verified/status)
  http.patch("/api/v1/admin/technicians/:id", async ({ params, request }) => {
    await delay(120);
    const id = Number(params.id);
    const body = await request.json().catch(() => ({}));
    const idx = users.findIndex((u) => u.id === id && u.role === "technicien");
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    users[idx] = { ...users[idx], ...body };
    return HttpResponse.json(sanitizeUser(users[idx]), { status: 200 });
  }),

  // 🔹 البحث عن الحرفيين
  http.get("/api/v1/technicians", async ({ request }) => {
    await delay(120);
    const url = new URL(request.url);
    const city = (url.searchParams.get("city") || "").toLowerCase();
    const q = (url.searchParams.get("q") || "").toLowerCase();
    const res = technicians.filter(
      (t) => (!city || t.city.toLowerCase().includes(city)) && (!q || t.fullName.toLowerCase().includes(q) || t.specialties.join(",").includes(q))
    );
    return HttpResponse.json(res);
  }),

  // 🔹 جلب تفاصيل الحرفي
  http.get("/api/v1/technicians/:id", async ({ params }) => {
    await delay(120);
    const t = technicians.find((x) => String(x.id) === params.id);
    return t ? HttpResponse.json(t) : HttpResponse.json({ message: "Not found" }, { status: 404 });
  }),

  // 🔹 خدمات و مراجعات الحرفي
  http.get("/api/v1/technicians/:id/reviews", async ({ params }) => {
    await delay(120);
    const list = technicianReviews[params.id] || [];
    return HttpResponse.json(list, { status: 200 });
  }),
  http.get("/api/v1/technicians/:id/services", async ({ params }) => {
    await delay(120);
    const list = technicianServices[params.id] || [];
    return HttpResponse.json(list, { status: 200 });
  }),

  // 🔹 Top Technicians & Services
  http.get("/api/v1/technicians/top", async () => {
    await delay(120);
    const sorted = [...technicians].sort((a, b) => b.averageRating - a.averageRating).slice(0, 8);
    return HttpResponse.json(sorted, { status: 200 });
  }),
  http.get("/api/v1/services/top", async () => {
    await delay(120);
    return HttpResponse.json(topServices, { status: 200 });
  }),

  // 🔹 إنشاء طلب جديد
  http.post("/api/v1/requests", async ({ request }) => {
    await delay(120);
    const body = await request.json();
    const r = { id: Date.now(), status: "new", price: undefined, client: "", ...body, createdAt: new Date().toISOString() };
    requests.unshift(r);
    return HttpResponse.json(r, { status: 201 });
  }),

  // 🔹 عرض جميع الطلبات ديال المستخدم
  http.get("/api/v1/requests/me", async () => {
    await delay(120);
    return HttpResponse.json(requests, { status: 200 });
  }),

  // Admin: list requests table
  http.get("/api/v1/admin/requests", async () => {
    await delay(120);
    return HttpResponse.json(requests, { status: 200 });
  }),

  // 🔹 Dashboard KPIs و آخر الطلبات
  http.get("/api/v1/tech/dashboard", async () => {
    await delay(120);
    return HttpResponse.json({
      kpi: kpiFromRequests(requests),
      recent: requests.slice(0, 5),
      weekly: weeklySeries(requests),
    });
  }),

  // 🔹 عرض الطلبات حسب الحالة
  http.get("/api/v1/tech/requests", async ({ request }) => {
    await delay(120);
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "all";
    const list = status === "all" ? requests : requests.filter((x) => x.status === status);
    return HttpResponse.json(list, { status: 200 });
  }),

  /* ==============================
     TECH REQUEST ACTIONS (mock)
     ============================== */
  http.post("/api/v1/tech/requests/:id/accept", async ({ params }) => {
    await delay(120);
    const idx = requests.findIndex((r) => String(r.id) === params.id);
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const current = requests[idx];
    if (current.status !== "new") {
      return HttpResponse.json({ message: "Invalid transition" }, { status: 400 });
    }
    const updated = { ...current, status: "accepted" };
    requests[idx] = updated;
    return HttpResponse.json(updated, { status: 200 });
  }),

  http.post("/api/v1/tech/requests/:id/start", async ({ params }) => {
    await delay(120);
    const idx = requests.findIndex((r) => String(r.id) === params.id);
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const current = requests[idx];
    if (current.status !== "accepted") {
      return HttpResponse.json({ message: "Invalid transition" }, { status: 400 });
    }
    const updated = { ...current, status: "in_progress" };
    requests[idx] = updated;
    return HttpResponse.json(updated, { status: 200 });
  }),

  http.post("/api/v1/tech/requests/:id/complete", async ({ params }) => {
    await delay(120);
    const idx = requests.findIndex((r) => String(r.id) === params.id);
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const current = requests[idx];
    if (current.status !== "in_progress") {
      return HttpResponse.json({ message: "Invalid transition" }, { status: 400 });
    }
    const updated = { ...current, status: "done" };
    requests[idx] = updated;
    return HttpResponse.json(updated, { status: 200 });
  }),

  http.post("/api/v1/tech/requests/:id/cancel", async ({ params }) => {
    await delay(120);
    const idx = requests.findIndex((r) => String(r.id) === params.id);
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const current = requests[idx];
    if (current.status === "done" || current.status === "cancelled") {
      return HttpResponse.json({ message: "Invalid transition" }, { status: 400 });
    }
    const updated = { ...current, status: "cancelled" };
    requests[idx] = updated;
    return HttpResponse.json(updated, { status: 200 });
  }),

  /* ==============================
     CHAT ROUTES (Front-only)
     ============================== */
  http.get("/api/v1/chat/threads", async ({ request }) => {
    await delay(120);
    const url = new URL(request.url);
    const me = Number(url.searchParams.get("me") || getAuthUserIdFromHeaders(request.headers) || 0);
    const list = chatThreads
      .filter((t) => t.participants.includes(me))
      .map((t) => {
        const peerId = t.participants.find((p) => p !== me);
        const peerUser = users.find((u) => u.id === peerId) || technicians.find((tc) => tc.id === peerId);
        return {
          id: t.id,
          peer: { id: String(peerId), name: peerUser?.name || peerUser?.fullName || "مستخدم", avatarUrl: peerUser?.avatarUrl || "" },
          lastMessage: t.lastMessage,
          updatedAt: t.updatedAt,
        };
      });
    return HttpResponse.json(list, { status: 200 });
  }),

  http.get("/api/v1/chat/threads/:id/messages", async ({ params }) => {
    await delay(120);
    const list = chatMessages[params.id] || [];
    return HttpResponse.json(list, { status: 200 });
  }),

  http.post("/api/v1/chat/threads/:id/messages", async ({ params, request }) => {
    await delay(120);
    const body = await request.json().catch(() => ({}));
    const fromUserId = getAuthUserIdFromHeaders(request.headers) || body.fromUserId || 0;
    const created = {
      id: String(Date.now()),
      threadId: params.id,
      fromUserId,
      text: body.text || "",
      createdAt: new Date().toISOString(),
      read: false,
    };
    chatMessages[params.id] = chatMessages[params.id] || [];
    chatMessages[params.id].push(created);
    const tIdx = chatThreads.findIndex((t) => t.id === params.id);
    if (tIdx !== -1) {
      chatThreads[tIdx] = { ...chatThreads[tIdx], lastMessage: created.text, updatedAt: created.createdAt };
    }
    return HttpResponse.json(created, { status: 201 });
  }),

  /* ==============================
     UPLOAD (Mock)
     ============================== */
  http.post("/api/v1/upload", async ({ request }) => {
    await delay(180);
    // Support both JSON and multipart; generate a mock URL
    let fileName = "img";
    try {
      const ctype = request.headers.get("content-type") || "";
      if (ctype.includes("multipart/form-data")) {
        const fd = await request.formData();
        const f = fd.get("file");
        if (typeof f === "object" && f && "name" in f) fileName = f.name || fileName;
      } else {
        const body = await request.json().catch(() => ({}));
        fileName = body?.name || fileName;
      }
    } catch {}
    const seed = encodeURIComponent(`${fileName}-${Date.now()}`);
    const url = `https://picsum.photos/seed/${seed}/600/400`;
    return HttpResponse.json({ url }, { status: 201 });
  }),

  // Prevent MSW warning for GET /
  http.get("/", () => new HttpResponse("OK", { status: 200 })),
];
