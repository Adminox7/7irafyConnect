## 7irafyConnect Frontend

منصة تربط الزبناء مع الحرفيين المحليين (كهربائيين، سباكين، صباغة...). هذا المستودع يحتوي فقط على الواجهة الأمامية المبنية بـ React + Vite. الواجهة الخلفية (Laravel) موجودة كموديول فرعي اسمه `7irafyConnect-api` لكنه غير متاح حالياً في هذه النسخة من المستودع، لذا تأكد من سحبه من المصدر الأصلي قبل محاولة التشغيل المتكامل.

### المكدس التقني
- React + Vite + TailwindCSS
- React Router + React Query
- Axios client موحد في `src/lib/api.ts` مع دعم Sanctum / Passport
- Zustand لحالة المصادقة + Toast للتنبيهات
- MSW لمحاكاة الـ API خلال التطوير (اختياري)

### الإعداد السريع
1. انسخ ملف البيئة: `cp .env.example .env`
2. حدّث `VITE_API_URL` لتطابق عنوان واجهة Laravel (مثال: `http://localhost:8000`)
3. إذا كنت تستعمل Sanctum (لارافيل افتراضياً) اترك `VITE_USE_SANCTUM=true`
4. ثبّت الاعتمادات: `npm install`
5. شغّل التطبيق: `npm run dev`

> ملاحظة: أثناء التطوير يمكنك استعمال البروكسي الداخلي لـ Vite (أنظر `vite.config.js`) أو تعديل `VITE_API_URL` ليتوجّه مباشرة إلى الـ API.

### السكريبتات
- `npm run dev` تشغيل الواجهة على `http://localhost:5173`
- `npm run build` إنشاء نسخة الإنتاج
- `npm run preview` معاينة البناء محلياً
- `npm run lint` فحص القواعد (يتطلب Node 18+)

### ملفات البيئة
- `.env.example` يحتوي على:
  - `VITE_API_URL` : رابط الـ Laravel API
  - `VITE_USE_SANCTUM` : فعّل `true` ليستعمل axios الكوكيز وCSRF
- يمكنك تعيين متغير `VITE_API_PROXY` عند تشغيل Vite لتوجيه البروكسي إلى خادم مختلف من `http://127.0.0.1:8000`.

### بنية المجلدات
- `src/lib/api.ts` العميل الموحد (`axios`) + `ensureCsrf`
- `src/api/http.js` طبقة تهيئة تضيف هيدر التوكن من Zustand وتعرض `showErrorOnce`
- `src/api/endpoints.js` تغليف لنقاط REST المستخدمة في الصفحات
- `src/pages` الصفحات: البحث، بروفايل الحرفي، إنشاء طلب، طلباتي، لوحة الحرفي، ...
- `src/components` مكوّنات عامة: Card, Button, Input, StatusBadge, DashboardCard, TechCard, ...
- `src/mocks` معالجات MSW (يمكن تفعيلها أو تعطيلها حسب الحاجة)

### التكامل مع Laravel
- عند استعمال Sanctum، يجب أن يسمح Laravel بالمسارات: `api/*`, `sanctum/csrf-cookie`, `login`, `logout`, `user` في إعدادات CORS وأن تكون `SESSION_DOMAIN` و `SANCTUM_STATEFUL_DOMAINS` متناسقة مع نطاق الواجهة.
- غيّر `vite.config.js` حسب الحاجة؛ البروكسي الحالي يوجّه `/api`, `/sanctum`, `/login`, `/logout`, `/user` نحو الخادم الخلفي.
- تأكد أن واجهة Laravel توفر نفس المسارات الموجودة في `docs/api/openapi.yaml`. المستند أنشئ بشكل استدلالي من الواجهة الأمامية، لذلك يلزم التحقق ضده فور توفر الكود الخلفي.

### التوثيق والأدوات
- `docs/api/openapi.yaml` : مواصفة OpenAPI (نسخة أولية)
- `docs/clients/postman_collection.json` : تجميعة Postman للبدايات السريعة
- لتحديث المواصفة، راجع متحكمات Laravel (عند توفرها) ثم حدّث المخطط وأعد توليد التجميعات.

### ملاحظات حول المستودع
- دليل `7irafyConnect-api/` مسجل كـ submodule لكنه بدون إعدادات `.gitmodules` في نسخة المستودع الحالية، ما يعني أن كود Laravel غير متوفر. اطلب من صاحب المستودع إرجاع إعدادات submodule أو نسخ الكود مباشرة إلى هذا المسار قبل تشغيل `php artisan` أو مزامنة العقود.
- إلى حين توفر الواجهة الخلفية، يمكن الاعتماد على MSW أو الـ mocks الداخلية لاختبار الواجهة.

