## 7irafyConnect

منصة تربط الزبناء مع الحرفيين المحليين (كهربائيين، سباكين، صباغة...).

### المكدس التقني
- React + Vite + TailwindCSS
- React Router + React Query
- MSW لمحاكاة الـ API خلال التطوير
- Recharts لرسوم بيانية خفيفة (اختياري)

### السكريبتات
- `npm run dev` تشغيل التطبيق مع MSW
- `npm run build` إنشاء نسخة الإنتاج
- `npm run preview` معاينة البناء
- `npm run lint` فحص القواعد

### تكامل MSW
- تم إعداد العامل في `src/mocks/browser.js` ونسخة الـ worker موجودة في `public/mockServiceWorker.js`.
- يتم تشغيل MSW تلقائياً في `src/main.jsx` أثناء التطوير.
- النقاط المتاحة:
  - Auth:
    - `POST /api/v1/auth/register` → `{ user, token, role }`
    - `POST /api/v1/auth/login` → `{ user, token, role }`
    - `GET /api/v1/auth/me` → `{ user, role }`
    - الحسابات التجريبية:
      - Admin: `admin@site.com` / `admin123`
      - Technicien: `tech@site.com` / `tech123`
      - Client: `client@site.com` / `client123`
  - Admin:
    - `GET /api/v1/admin/metrics`
    - `GET /api/v1/admin/technicians?status=pending`
    - `PATCH /api/v1/admin/technicians/:id/verify`
  - Technicians & Requests:
    - `GET /api/v1/technicians`
    - `GET /api/v1/technicians/:id`
    - `POST /api/v1/requests`
    - `GET /api/v1/requests/me`
    - `GET /api/v1/tech/dashboard`
    - `GET /api/v1/tech/requests?status=...`

### بنية المجلدات
- `src/pages` الصفحات: البحث، بروفايل الحرفي، إنشاء طلب، طلباتي، لوحة الحرفي
- `src/components` مكوّنات قابلة لإعادة الاستخدام: Card, Button, Input, StatusBadge, DashboardCard, TechCard
- `src/api` عميل axios (`http.js`) ونقاط (`endpoints.js`)
- `src/mocks` المعالجات الخاصة بـ MSW
- `src/util/ErrorBoundary.jsx` حاجز أخطاء لمنع الشاشة البيضاء

### التبديل لاحقاً لواجهة Laravel
- إبقَ `baseURL` على `/api/v1` في الواجهة؛ اجعل Nginx/لارافيل يقدّم نفس المسارات.
- عطّل MSW بإزالة شرط `import.meta.env.DEV` في `src/main.jsx`.
- نفِّذ نفس المسارات في Laravel (انظر أدناه) لتجنّب تغييرات على الواجهة.

### Migration Guide (Laravel)

لتشغيل الواجهة الأمامية مع Laravel، يجب أن يوفّر الـ backend هذه المسارات وترجع JSON بالشكل التالي. اضبط `VITE_API_URL` مثل `https://your-app.test/api/v1` في ملف البيئة الأمامية.

- GET `/api/v1/technicians`
  - Query params: `city?: string`, `q?: string`
  - Returns: `Technician[]`
    - Technician: `{ id:number, fullName:string, city:string, specialties:string[], isPremium:boolean, averageRating:number, lat:number, lng:number }`

- GET `/api/v1/technicians/:id`
  - Returns: `Technician`

- POST `/api/v1/requests`
  - Body: `{ title:string, city:string, description:string, technicianId?:number }`
  - Returns: `ServiceRequest`

- GET `/api/v1/requests/me`
  - Returns: `ServiceRequest[]`

- GET `/api/v1/tech/dashboard`
  - Returns: `{ kpi: DashboardKPI, recent: ServiceRequest[], weekly: WeeklyPoint[] }`
    - DashboardKPI: `{ newC:number, accC:number, progC:number, doneC:number, revenue:number }`
    - WeeklyPoint: `{ date:string, requests:number }`

- GET `/api/v1/tech/requests?status=all|new|accepted|in_progress|done|cancelled`
  - Returns: `ServiceRequest[]`

- POST `/api/v1/tech/requests/:id/accept`
- POST `/api/v1/tech/requests/:id/start`
- POST `/api/v1/tech/requests/:id/complete`
- POST `/api/v1/tech/requests/:id/cancel`
  - Returns for each: updated `ServiceRequest`

Auth:
- POST `/api/v1/auth/register` → `{ user, token, role }`
- POST `/api/v1/auth/login` → `{ user, token, role }`
- GET `/api/v1/auth/me` → `{ user, role }`

Admin:
- GET `/api/v1/admin/metrics` → `{ users, technicians, pendingTechnicians, totalRequests, revenue }`
- GET `/api/v1/admin/technicians?status=pending` → `User[]`
- PATCH `/api/v1/admin/technicians/:id/verify` → `User`

Shapes:
- ServiceRequest: `{ id:number, title:string, city:string, status:'new'|'accepted'|'in_progress'|'done'|'cancelled', price?:number, client?:string, createdAt:string, description?:string, technicianId?:number }`

