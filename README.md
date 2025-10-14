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
- حدِّث المتغير `VITE_API_URL` في بيئة الواجهة الأمامية ليشير إلى خادم Laravel (مثلاً: `https://api.example.com/api/v1`). يقرأ `src/api/http.js` هذا المتغير مع قيمة افتراضية `/api/v1`.
- أزل تفعيل MSW في `main.jsx` أو عطِّله بإزالة شرط `import.meta.env.DEV`.
- حافظ على نفس مسارات الـ API لضمان عمل الصفحات بدون تغييرات كبيرة.

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

Shapes:
- ServiceRequest: `{ id:number, title:string, city:string, status:'new'|'accepted'|'in_progress'|'done'|'cancelled', price?:number, client?:string, createdAt:string, description?:string, technicianId?:number }`

