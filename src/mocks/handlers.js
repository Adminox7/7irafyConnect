import { http, HttpResponse } from "msw";

/* ==============================
   TECHNICIANS (حرفيين تجريبياً)
   ============================== */
const technicians = [
  { id: 1, fullName: "Youssef El Elec", city: "Rabat", specialties: ["electricien"], isPremium: true, averageRating: 4.8, lat: 34.02, lng: -6.83 },
  { id: 2, fullName: "Hicham Plomb", city: "Salé", specialties: ["plombier"], isPremium: false, averageRating: 4.5, lat: 34.05, lng: -6.78 },
  { id: 3, fullName: "Khalid Deco", city: "Temara", specialties: ["peintre"], isPremium: false, averageRating: 4.6, lat: 33.93, lng: -6.91 },
];

/* ==============================
   AUTH (مستخدمون تجريبياً)
   ============================== */
let users = [
  // Admin مسبقاً للاختبار
  { id: 999, role: "admin", name: "Admin", email: "admin@local", password: "admin", city: "Rabat", phone: "0000000000", verified: true },
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
  const newC = items.filter(x => x.status === "new").length;
  const accC = items.filter(x => x.status === "accepted").length;
  const progC = items.filter(x => x.status === "in_progress").length;
  const doneC = items.filter(x => x.status === "done").length;
  const revenue = items.filter(x => x.status === "done").reduce((s, x) => s + (x.price || 0), 0);
  return { newC, accC, progC, doneC, revenue };
}

function weeklySeries(items) {
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const count = items.filter(x => x.createdAt.slice(0, 10) === key).length;
    return { date: key.slice(5), requests: count };
  });
  return days;
}

/* ==============================
   API HANDLERS
   ============================== */
export const handlers = [
  /* ==============================
     AUTH ROUTES
     ============================== */
  http.post("/api/v1/auth/register", async ({ request }) => {
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
    return HttpResponse.json(sanitizeUser(created), { status: 201 });
  }),

  http.post("/api/v1/auth/login", async ({ request }) => {
    const body = await request.json();
    const { email, password } = body || {};
    const u = users.find((x) => x.email.toLowerCase() === String(email).toLowerCase() && x.password === password);
    if (!u) return HttpResponse.json({ message: "بيانات الدخول غير صحيحة" }, { status: 401 });
    const token = `mock-${u.id}`;
    return HttpResponse.json({ token, role: u.role, user: sanitizeUser(u) }, { status: 200 });
  }),

  http.get("/api/v1/auth/me", ({ request }) => {
    const auth = request.headers.get("authorization") || request.headers.get("Authorization");
    if (!auth) return HttpResponse.json({ message: "غير مصرح" }, { status: 401 });
    const parts = auth.split(" ");
    const token = parts[1] || "";
    const id = Number(String(token).replace("mock-", ""));
    const u = users.find((x) => x.id === id);
    if (!u) return HttpResponse.json({ message: "غير مصرح" }, { status: 401 });
    return HttpResponse.json(sanitizeUser(u), { status: 200 });
  }),

  // 🔹 البحث عن الحرفيين
  http.get("/api/v1/technicians", ({ request }) => {
    const url = new URL(request.url);
    const city = (url.searchParams.get("city") || "").toLowerCase();
    const q = (url.searchParams.get("q") || "").toLowerCase();
    const res = technicians.filter(t =>
      (!city || t.city.toLowerCase().includes(city)) &&
      (!q || t.fullName.toLowerCase().includes(q) || t.specialties.join(",").includes(q))
    );
    return HttpResponse.json(res);
  }),

  // 🔹 جلب تفاصيل الحرفي
  http.get("/api/v1/technicians/:id", ({ params }) => {
    const t = technicians.find(x => String(x.id) === params.id);
    return t
      ? HttpResponse.json(t)
      : HttpResponse.json({ message: "Not found" }, { status: 404 });
  }),

  // 🔹 إنشاء طلب جديد
  http.post("/api/v1/requests", async ({ request }) => {
    const body = await request.json();
    const r = { id: Date.now(), status: "new", ...body, createdAt: new Date().toISOString() };
    requests.unshift(r);
    return HttpResponse.json(r, { status: 201 });
  }),

  // 🔹 عرض جميع الطلبات ديال المستخدم
  http.get("/api/v1/requests/me", () => {
    return HttpResponse.json(requests, { status: 200 });
  }),

  // 🔹 Dashboard KPIs و آخر الطلبات
  http.get("/api/v1/tech/dashboard", () => {
    return HttpResponse.json({
      kpi: kpiFromRequests(requests),
      recent: requests.slice(0, 5),
      weekly: weeklySeries(requests),
    });
  }),

  // 🔹 عرض الطلبات حسب الحالة
  http.get("/api/v1/tech/requests", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "all";
    const list = status === "all" ? requests : requests.filter(x => x.status === status);
    return HttpResponse.json(list, { status: 200 });
  }),

  /* ==============================
     TECH REQUEST ACTIONS (mock)
     ============================== */
  http.post("/api/v1/tech/requests/:id/accept", ({ params }) => {
    const idx = requests.findIndex(r => String(r.id) === params.id);
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const current = requests[idx];
    if (current.status !== "new") {
      return HttpResponse.json({ message: "Invalid transition" }, { status: 400 });
    }
    const updated = { ...current, status: "accepted" };
    requests[idx] = updated;
    return HttpResponse.json(updated, { status: 200 });
  }),

  http.post("/api/v1/tech/requests/:id/start", ({ params }) => {
    const idx = requests.findIndex(r => String(r.id) === params.id);
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const current = requests[idx];
    if (current.status !== "accepted") {
      return HttpResponse.json({ message: "Invalid transition" }, { status: 400 });
    }
    const updated = { ...current, status: "in_progress" };
    requests[idx] = updated;
    return HttpResponse.json(updated, { status: 200 });
  }),

  http.post("/api/v1/tech/requests/:id/complete", ({ params }) => {
    const idx = requests.findIndex(r => String(r.id) === params.id);
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const current = requests[idx];
    if (current.status !== "in_progress") {
      return HttpResponse.json({ message: "Invalid transition" }, { status: 400 });
    }
    const updated = { ...current, status: "done" };
    requests[idx] = updated;
    return HttpResponse.json(updated, { status: 200 });
  }),

  http.post("/api/v1/tech/requests/:id/cancel", ({ params }) => {
    const idx = requests.findIndex(r => String(r.id) === params.id);
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const current = requests[idx];
    if (current.status === "done" || current.status === "cancelled") {
      return HttpResponse.json({ message: "Invalid transition" }, { status: 400 });
    }
    const updated = { ...current, status: "cancelled" };
    requests[idx] = updated;
    return HttpResponse.json(updated, { status: 200 });
  }),
];
