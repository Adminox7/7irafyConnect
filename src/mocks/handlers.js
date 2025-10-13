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
];
