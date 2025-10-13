import { http, HttpResponse } from "msw";

const technicians = [
  { id:1, fullName:"Youssef El Elec", city:"Rabat", specialties:["electricien"], isPremium:true, averageRating:4.8, lat:34.02, lng:-6.83 },
  { id:2, fullName:"Hicham Plomb", city:"Salé", specialties:["plombier"], isPremium:false, averageRating:4.5, lat:34.05, lng:-6.78 },
];

export const handlers = [
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

  http.get("/api/v1/technicians/:id", ({ params }) => {
    const t = technicians.find(x => String(x.id) === params.id);
    return t ? HttpResponse.json(t) : HttpResponse.json({message:"Not found"}, { status:404 });
  }),

  http.post("/api/v1/requests", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: Date.now(), status:"new", ...body }, { status:201 });
  }),
    http.post("/api/v1/requests", async ({ request }) => {
    const body = await request.json();
    const r = { id: Date.now(), status:"new", ...body };
    requests.unshift(r);
    return HttpResponse.json(r, { status:201 });
  }),

  http.get("/api/v1/requests/me", () => {
    return HttpResponse.json(requests, { status:200 });
  }),
];

