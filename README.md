# نظام تصاريح الدخول للمنشآت والمرافق الأمنية (Access Permits System)
### حل مؤسسي متكامل مبني باستخدام .NET 8 MVC مع بنية الطبقات (Layered Architecture) وقاعدة بيانات SQL Server احترافية

---

## 🌟 نظرة عامة (Overview)
تم تحويل هذا النظام بالكامل من ملف واجهة أحادي إلى منظومة برمجية مؤسسية جاهزة للإنتاج (Production-Ready Enterprise Solution) بنمط **Layered Clean Architecture** وفق أعلى معايير هندسة البرمجيات وتصميم قواعد البيانات.

النظام يحافظ **100% على نفس التصميم الأصلي الجذاب، المؤثرات الحركية (Gate Radar، الليزر، أصوات التنبيه)، المعالج متعدد الخطوات (Step Wizard)، دعم اللغة العربية بالكامل، الخطوط الرسمية (Tajawal & Noto Kufi Arabic)، والنوافذ المنبثقة**.

---

## 🏛️ هيكلية المشروع (Solution Architecture)

الحل مقسم إلى 4 طبقات رئيسية داخل ملف الحل `AccessPermits.sln`:

```
AccessPermits.sln
│
├── 📁 src/
│   │
│   ├── 🏢 AccessPermits.Core (طبقة النطاق والمجال - Domain Layer)
│   │   ├── Common/              # الكيانات الأساسية المشتركة (BaseEntity)
│   │   ├── Enums/               # جميع التعدادات النظامية (PermitStatus, GateAction, etc.)
│   │   ├── Entities/            # كيانات النطاق مقسمة حسب السكيمات:
│   │   │   ├── Security/        # Users, UserBranch, UserBuilding, UserGate, UserPermission
│   │   │   ├── Organization/    # Branch, Building, Gate, GateDevice (Multi-MAC), Path, Department
│   │   │   ├── Registry/        # Person, BlacklistEntry, BannedNationality, Attachments
│   │   │   ├── Permits/         # PermitRequest, IssuedPermit, Persons, Devices, ExitItems
│   │   │   ├── GateOperations/  # QueryLog, GateMovementLog (سجلات الفحص والحركة)
│   │   │   ├── Audit/           # AuditLog (سجلات التدقيق الأمني الشامل)
│   │   │   └── SystemConfig/    # LookupItem, SystemSetting
│   │   └── Interfaces/          # عقود المستودعات ووحدة العمل (IRepository, IUnitOfWork)
│   │
│   ├── 💾 AccessPermits.Infrastructure (طبقة البنية التحتية والبيانات)
│   │   ├── Data/
│   │   │   ├── AccessPermitsDbContext.cs  # إعدادات EF Core، العلاقات، الفهارس، والتجزئة لـ 7 Schemas
│   │   │   └── DbInitializer.cs          # التغذية التلقائية الشاملة بالبيانات الافتراضية (Seed Data)
│   │   ├── Repositories/                 # التنفيذ الفعلي لـ Repository و UnitOfWork
│   │   └── DependencyInjection.cs        # حقن التبعيات مع فاحص ذكي للاتصال بـ SQL Server
│   │
│   ├── ⚙️ AccessPermits.Application (طبقة منطق الأعمال والخدمات)
│   │   ├── DTOs/                # كائنات نقل البيانات (Login, Permit, Person, GateQuery, Dashboard)
│   │   ├── Interfaces/          # عقود الخدمات (IAuth, IOrganization, IRegistry, IPermit, IGate...)
│   │   ├── Services/            # التنفيذ الفعلي لجميع خدمات النظام ومنطق الأعمال
│   │   └── DependencyInjection.cs
│   │
│   └── 🌐 AccessPermits.Web (طبقة العرض والواجهة - Presentation & API Layer)
│       ├── Controllers/         # HomeController, AccountController, PermitsController, GateController...
│       ├── Views/               # _Layout.cshtml, Index.cshtml (كافة الشاشات الـ 14 والمعالج والمودالات)
│       └── wwwroot/
│           ├── css/site.css     # التنسيقات الكاملة، الوضع الليلي/النهاري، شاشات الاستجابة، والرادار
│           └── js/
│               ├── app.js       # المحرك التفاعلي للواجهة متكامل مع استدعاءات الـ REST API الخلفية
│               └── patches.js   # حزم التحسينات، معالجة بطاقات الحراسة، وربط أجهزة الـ MAC
│
└── 📁 sql/
    └── schema_and_seed.sql      # سكريبت DDL و DML متكامل وشامل لـ SQL Server
```

---

## 🗄️ سكيما قاعدة البيانات (Enterprise Database Schema)

تم تصميم قاعدة البيانات وفق أعلى المعايير الهندسية لمسؤولي قواعد البيانات (DBA) مع تقسيمها إلى **7 مخططات (Schemas)** لتنظيم الأمان والأداء:

| المخطط (Schema) | الوصف | الجداول الرئيسية |
| :--- | :--- | :--- |
| **`Security`** | إدارة المستخدمين، الأدوار، والصلاحيات الجغرافية على الفروع والبوابات | `Users`, `UserBranches`, `UserBuildings`, `UserGates`, `UserPermissions` |
| **`Organization`** | الهيكل التنظيمي للمرافق، الأجهزة وبوابات الدخول | `Branches`, `Buildings`, `Gates`, `GateDevices`, `FacilityPaths`, `Departments` |
| **`Registry`** | السجل المدني والأمني الموحد، القوائم السوداء، والجنسيات المحظورة | `Persons`, `BlacklistEntries`, `BannedNationalities`, `PersonAttachments` |
| **`Permits`** | طلبات وتصاريح الدخول المصدرة، والأشخاص والأجهزة والمواد المصرحة | `PermitRequests`, `IssuedPermits`, `PermitPersons`, `PermitDevices`, `ExitItems` |
| **`GateOperations`** | العمليات الميدانية للبوابات، استعلامات الحراس، وحركات الدخول والخروج | `GateQueryLogs`, `GateMovementLogs` |
| **`Audit`** | سجلات الرقابة والمتابعة والتدقيق الإداري والأمني | `AuditLogs` |
| **`SystemConfig`** | الإعدادات العامة للنظام وقوائم الخيارات الديناميكية | `LookupItems`, `SystemSettings` |

### الميزات البرمجية المضمنة في سكريبت الـ SQL:
1. **الفهارس غير المجمعة (Non-Clustered Indexes):** تم تطبيق فهارس مركبة ومفلترة على أعمدة البحث الشائعة (مثل أرقام الهويات، الباركودات، التواريخ، وحالات التصاريح).
2. **القيود الصارمة (Constraints & Foreign Keys):** مع استخدام قواعد حذف آمنة `ON DELETE NO ACTION` لمنع تلف شجرة البيانات المتداخلة.
3. **العروض (Views):**
   - `vw_ActivePermitsOverview`: عرض تحليلي فوري لجميع التصاريح السارية مع بيانات الأشخاص والمرافق.
   - `vw_GateQuerySummary`: إحصائيات فورية لعمليات استعلام كل بوابة مع نسب القبول والرفض.
4. **الإجراءات المخزنة (Stored Procedures):**
   - `sp_VerifyGateAccess`: إجراء فحص فوري وسريع للأشخاص عند البوابة يشمل التحقق من القوائم السوداء، صلاحية التاريخ والوقت، وتطابق مسار المرفق.
   - `sp_GetDashboardKpis`: استرجاع مؤشرات الأداء اللحظية للوحة القيادة بكفاءة قصوى.

---

## ⚡ ميزة الفحص الذكي للاتصال (Smart DB Fallback)
حرصاً على أن يعمل المشروع فوراً لدى أي مبرمج أو مختبر دون أي أخطاء:
- يقوم ملف [DependencyInjection.cs](file:///c:/Users/aanwar/Downloads/New%20folder%20(8)/src/AccessPermits.Infrastructure/DependencyInjection.cs) باختبار الاتصال بسيرفر **SQL Server** عند الإقلاع.
- في حال كان سيرفر SQL Server يعمل ومتاحاً، يتصل به النظام تلقائياً ويقوم بعمل `EnsureCreated` وتعبئة البيانات الأولية.
- في حال كان سيرفر SQL Server غير مشغل أو غير مثبت على جهاز المطور، يقوم النظام تلقائياً ودون إيقاف البرنامج بالتحويل إلى **EF Core In-Memory Database** مع التغذية الكاملة بكافة الفروع والمستخدمين والتصاريح، مما يضمن تشغيل الواجهات وتجربة النظام بالكامل بضغطة زر واحدة!

---

## 🚀 كيفية تشغيل المشروع (How to Run)

### 1. المتطلبات:
- مثبت حزمة [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) أو أحدث.
- (اختياري) **SQL Server** أو **SQL Server LocalDB** و **SSMS / Azure Data Studio**.
- متصفح ويب حديث (Chrome / Edge / Firefox).

### 2. التشغيل عبر سطر الأوامر (CLI):
من المجلد الرئيسي للمشروع، قم بتنفيذ الأمر التالي:
```bash
dotnet run --project src/AccessPermits.Web
```
أو تشغيل ملف `run.bat` المرفق بالنقر المزدوج عليه.

سيظهر لك الرابط:
```
Now listening on: http://localhost:5000
```
افتح المتصفح على: `http://localhost:5000`

### 3. التشغيل عبر Visual Studio 2022:
1. افتح الملف `AccessPermits.sln`.
2. تأكد من تحديد مشروع `AccessPermits.Web` كمشروع بدء التشغيل (**Set as Startup Project**).
3. اضغط **F5** أو زر التشغيل الأخضر.

---

## 💾 تطبيق سكريبت قاعدة البيانات في SQL Server (اختياري)
إذا أردت إنشاء قاعدة البيانات يدوياً في سيرفر SQL Server:
1. افتح برنامج **SQL Server Management Studio (SSMS)** أو **Azure Data Studio**.
2. اتصل بسيرفرك المحلي `.` أو `localhost` أو `(localdb)\mssqllocaldb`.
3. افتح الملف المرفق: `sql/schema_and_seed.sql`.
4. اضغط **Execute (F5)**.
5. سيتم إنشاء قاعدة البيانات باسم `AccessPermitsDb` وتكوين السكيمات والبيانات بالكامل.
6. تأكد من مطابقة نص الاتصال في ملف `src/AccessPermits.Web/appsettings.json`.

---

## 👥 حسابات الدخول التجريبية (Demo Accounts)

النظام مهيأ مسبقاً ببيانات وحسابات تغطي جميع الأدوار والصلاحيات (كلمة المرور الافتراضية لجميع الحسابات: `123456`):

| اسم المستخدم | كلمة المرور | الدور الوظيفي | الصلاحيات والمزايا |
| :--- | :--- | :--- | :--- |
| **`admin`** | `123456` | **مدير النظام العام (Administrator)** | وصول كامل لكافة الشاشات، الإعدادات، الفروع، والمستخدمين |
| **`approver`** | `123456` | **مدير الموافقات والاعتماد (Approver)** | شاشة التصاريح، مراجعة الطلبات، الاعتماد والرفض |
| **`requester`** | `123456` | **مقدم الطلبات (Requester)** | إنشاء طلبات تصاريح جديدة ومتابعة حالة الطلبات السابقة |
| **`guard`** | `123456` | **حارس أمن البوابات (Security Guard)** | شاشة التفتيش، رادار البوابة، التحقق الفوري وسجل الحركات |

---

## 📡 نقاط الاتصال البرمجية (REST API Endpoints)

تم تزويد طبقة الويب بمجموعة من الـ Controllers التي توفر REST APIs متوافقة لتغذية الواجهات وتسهيل ربطها مع تطبيقات الموبايل أو أنظمة الدخول الخارجية:

- `POST /api/auth/login` : تسجيل الدخول واسترجاع بيانات الجلسة والصلاحيات.
- `GET /api/organization/branches` : استرجاع قائمة الفروع مع المباني والبوابات.
- `GET /api/organization/paths` : استرجاع المسارات المعتمدة للزيارات.
- `GET /api/permits/requests` : استرجاع طلبات التصاريح مع الفلترة حسب الحالة.
- `POST /api/permits/requests` : تقديم طلب تصريح جديد (متعدد الخطوات).
- `POST /api/permits/approve/{id}` : اعتماد وإصدار التصريح وتوليد الباركود.
- `POST /api/permits/reject/{id}` : رفض طلب التصريح مع إرفاق السبب.
- `POST /api/gate/verify` : التحقق الفوري عند البوابة برقم الهوية أو الباركود.
- `POST /api/gate/movement` : تسجيل حركة دخول أو خروج مع قراءة الأجهزة.
- `GET /api/reports/dashboard` : استرجاع مؤشرات الأداء الحية والإحصائيات.
- `GET /api/registry/blacklist` : استعلام القائمة السوداء والجنسيات المحظورة.

---

## 🛡️ معايير الأمان وجودة الشيفرة البرمجية
- **Strict Typing & Clean Separation**: فصل كامل بين طبقات البيانات ومنطق الأعمال والعرض لمنع التسرب المعماري.
- **Audit Trails**: توثيق تلقائي لكافة العمليات الحساسة (إنشاء، اعتماد، تفتيش) مع تسجيل المستخدم والـ IP والتوقيت.
- **SQL Injection Prevention**: استخدام EF Core Parameterized Queries و Stored Procedures المحمية.
- **Resilient Fallback**: تضمن استمرارية عمل الواجهات والبيانات حتى في البيئات التجريبية أو عدم توفر سيرفر خارجي.
