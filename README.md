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
- حدِّث `src/api/http.js` لتكون `baseURL` عنوان خادم Laravel (مثلاً: `https://api.example.com/api/v1`).
- أزل تفعيل MSW في `main.jsx` أو عطِّله بإزالة شرط `import.meta.env.DEV`.
- حافظ على نفس مسارات الـ API لضمان عمل الصفحات بدون تغييرات كبيرة.

