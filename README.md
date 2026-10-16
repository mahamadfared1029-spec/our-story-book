# كتاب قصتنا — Our Story Book 📖✨

> تطبيق ويب خاص وآمن لشخصين مرتبطين لتوثيق قصتهما المشتركة في كتاب رقمي يتطور مع الوقت.

---

## 🌟 رؤية وقيم المشروع

1. **الخصوصية والأمان أولاً**: حماية كاملة على مستوى صفوف قاعدة البيانات (RLS) ومسارات التخزين الخاصة.
2. **شخصان فقط**: كل كتاب محمي ومخصص لعضوين كحد أقصى، مع فرض ذلك على مستوى قاعدة البيانات (Database Constraints & Triggers).
3. **العربية وتجربة RTL منذ أول سطر**: دعم كامل لاتجاه اليمين لليسار، خطوط عربية دافئة (Cairo و Tajawal)، وواجهة رومانسية أنيقة مستوحاة من دفاتر الذكريات الفاخرة.
4. **جودة هندسية حقيقية**: بدون بيانات وهمية أو أزرار شكلية. كل وظيفة مربوطة وتُختبر عمليًا.

---

## 🛠 التقنيات المستخدمة

- **Frontend & Backend**: Next.js 16 (App Router, Server Components, Server Actions)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS مع لوحة ألوان دافئة مخصصة
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth + Row Level Security)
- **Testing**: Vitest للاختبارات الآلية وفحص التشفير وقواعد الأمان

---

## 🚀 دليل التشغيل المحلي (خطوة بخطوة)

### المتطلبات الأساسية
- Node.js (الإصدار 18 فما فوق، تم التحقق على v22)
- npm (الإصدار 10 فما فوق)
- حساب مجاني على [Supabase](https://supabase.com)

---

### الخطوة 1: إعداد قاعدة بيانات Supabase

1. سجل الدخول إلى [supabase.com](https://supabase.com) وأنشئ مشروعًا جديدًا (Project).
2. من القائمة الجانبية في لوحة تحكم مشروعك، اضغط على **SQL Editor**.
3. افتح ملف الترحيل الموجود في المشروع:
   `supabase/migrations/00001_initial_schema.sql`
4. انسخ محتواه بالكامل والصقه في SQL Editor ثم اضغط **Run**.
   - سيقوم بإنشاء الجداول: `profiles`, `books`, `book_members`, `invites`.
   - سيفعل سياسات الأمان الصارمة (RLS).
   - سينشئ الدوال الذرية الآمنة: `create_book_with_creator` و `accept_book_invite`.
   - سيفعل قيد منع إضافة أكثر من شريكين (`check_book_members_limit`).

---

### الخطوة 2: ضبط متغيرات البيئة

1. من لوحة تحكم Supabase، اذهب إلى:
   **Project Settings** ➔ **API**
2. انسخ:
   - **Project URL**
   - **anon public key**
3. انسخ ملف `.env.example` إلى `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
4. افتح ملف `.env.local` وضع القيم المنسوخة:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
   > ⚠️ **ملاحظة أمنية هامة**: ملف `.env.local` تم استثناؤه تلقائيًا من Git (`.gitignore`)، إياك ورفعه على GitHub.

---

### الخطوة 3: تشغيل المشروع محليًا

في مجلد المشروع:
```bash
npm run dev
```
افتح المتصفح على: [http://localhost:3000](http://localhost:3000)

---

### الخطوة 4: تشغيل الاختبارات الآلية

للتأكد من صحة التشفير، والتحقق من المدخلات، وحدود العضوية:
```bash
npm test
```

لفحص الأكواد وقواعد الجودة:
```bash
npm run lint
```

للتحقق من البناء الإنتاجي الكامل:
```bash
npm run build
```

---

## 🔒 بنية الأمان والخصوصية (Security Architecture)

- **Row Level Security (RLS)**: كل جدول في قاعدة البيانات لا يمكن قراءته أو التعديل عليه إلا بواسطة أعضاء الكتاب المسجلين فعليًا في `book_members`.
- **نظام الدعوات المشفر**:
  - عند إنشاء دعوة، يُولد رمز عشوائي قوي 192-bit عبر Web Crypto API.
  - يُخزن فقط الـ SHA-256 Hash للرمز في قاعدة البيانات (`code_hash`).
  - الرابط صالح لمدة 7 أيام ومخصص لاستخدام واحد فقط.
  - لا يمكن استغلال الرمز لمعرفة أسماء أو بيانات الكتاب قبل الانضمام.
- **منع العضو الثالث قطعيًا**:
  - قيد `BEFORE INSERT` Trigger على جدول `book_members` يمنع تجاوز الحد الأقصى (عضوين) حتى في حال محاولة التلاعب بالطلبات المتزامنة (Race Conditions).
- **الجلسات الآمنة**: استخدام `supabase.auth.getUser()` للتحقق من هوية المستخدم الحقيقية المشفرة بدلاً من الجلسات غير الموثوقة.

---

## 📁 بنية ملفات المرحلة الأولى

```
our-story-book/
├── src/
│   ├── actions/
│   │   ├── auth.ts              # إجراءات الخادم للمصادقة (تسجيل، دخول، خروج)
│   │   ├── books.ts             # إجراءات الخادم لإنشاء الكتب واسترجاعها
│   │   └── invites.ts           # إجراءات الخادم لتوليد وقبول الدعوات
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx   # صفحة تسجيل الدخول
│   │   │   ├── signup/page.tsx  # صفحة إنشاء الحساب
│   │   │   └── layout.tsx       # تخطيط صفحات المصادقة
│   │   ├── auth/callback/       # نقطة تبادل توكنات المصادقة
│   │   ├── book/
│   │   │   ├── create/page.tsx  # صفحة إنشاء كتاب جديد
│   │   │   └── [id]/page.tsx    # صفحة عرض تفاصيل الكتاب وإدارة الشريك
│   │   ├── invite/[code]/       # صفحة قبول دعوة الشريك المشفرة
│   │   ├── layout.tsx           # التخطيط العام (RTL + خطوط Cairo و Tajawal)
│   │   ├── page.tsx             # الصفحة الرئيسية (عرض الكتب الحقيقية أو الحالة الفارغة)
│   │   ├── error.tsx            # معالجة الأخطاء
│   │   ├── not-found.tsx        # صفحة 404
│   │   └── loading.tsx          # شاشة التحميل
│   ├── components/
│   │   ├── books/
│   │   │   └── invite-manager.tsx # مدير الدعوات ونسخ الرابط
│   │   └── ui/
│   │       └── navbar.tsx       # شريط التنقل العلوي المتجاوب
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        # عميل المتصفح
│   │   │   ├── server.ts        # عميل الخادم مع الكوكيز
│   │   │   └── middleware.ts    # تجديد الجلسة
│   │   ├── types/
│   │   │   └── database.ts      # تعريفات TypeScript الدقيقة
│   │   └── validations.ts       # التحقق من المدخلات وتجزئة التشفير
│   └── middleware.ts            # حماية المسارات على مستوى التطبيق
├── supabase/
│   └── migrations/
│       └── 00001_initial_schema.sql # ترحيل قاعدة البيانات وسياسات RLS
├── tests/
│   └── validation-and-security.test.ts # اختبارات آلية شاملة
├── .env.example                 # نموذج متغيرات البيئة الآمن
├── .gitignore                   # حماية الأسرار وملفات البناء
└── package.json                 # الحزم وأوامر التشغيل
```

---

## 🤝 حفظ التغييرات على GitHub (Git Commits)

لحفظ كود المرحلة الأولى في مستودعك:
```bash
git add .
git commit -m "feat: complete phase 1 - app foundation, auth, books, secure invites, and RLS"
```
