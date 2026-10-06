using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AccessPermits.Core.Entities.Security;
using AccessPermits.Core.Entities.Organization;
using AccessPermits.Core.Entities.Registry;
using AccessPermits.Core.Entities.Permits;
using AccessPermits.Core.Entities.GateOperations;
using AccessPermits.Core.Entities.Audit;
using AccessPermits.Core.Entities.SystemConfig;

namespace AccessPermits.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AccessPermitsDbContext context)
        {
            // Seed Branches
            if (!await context.Branches.AnyAsync())
            {
                var branches = new List<Branch>
                {
                    new Branch { Id = "riyadh", Name = "مجمع الرياض", Code = "RUH-01", City = "الرياض", Manager = "أحمد الحربي", Status = "active", WorkingHoursDays = "sun,mon,tue,wed,thu", WorkingHoursFrom = "07:00", WorkingHoursTo = "17:00" },
                    new Branch { Id = "jeddah", Name = "مجمع جدة", Code = "JED-01", City = "جدة", Manager = "سارة العمري", Status = "active", WorkingHoursDays = "sun,mon,tue,wed,thu", WorkingHoursFrom = "07:00", WorkingHoursTo = "17:00" },
                    new Branch { Id = "dammam", Name = "مجمع الدمام", Code = "DMM-01", City = "الدمام", Manager = "خالد الشمري", Status = "active", WorkingHoursDays = "sun,mon,tue,wed,thu", WorkingHoursFrom = "07:00", WorkingHoursTo = "17:00" }
                };
                await context.Branches.AddRangeAsync(branches);
                await context.SaveChangesAsync();
            }

            // Seed Buildings
            if (!await context.Buildings.AnyAsync())
            {
                var buildings = new List<Building>
                {
                    new Building { Id = "bldg-1", Name = "المبنى الإداري الرئيسي", Code = "B-ADM-01", BranchId = "riyadh", Type = "مبنى إداري", Floors = 5, Manager = "أحمد الحربي", Status = "active" },
                    new Building { Id = "bldg-2", Name = "مبنى التقنية", Code = "B-IT-01", BranchId = "riyadh", Type = "مبنى تقني", Floors = 3, Manager = "م. سعد", Status = "active" },
                    new Building { Id = "bldg-3", Name = "مبنى الخدمات", Code = "B-SRV-01", BranchId = "riyadh", Type = "مبنى خدمات", Floors = 2, Manager = "بدر", Status = "active" },
                    new Building { Id = "bldg-4", Name = "المبنى الرئيسي", Code = "B-JED-01", BranchId = "jeddah", Type = "مبنى إداري", Floors = 4, Manager = "سارة", Status = "active" },
                    new Building { Id = "bldg-5", Name = "مبنى المستودعات", Code = "B-WH-01", BranchId = "jeddah", Type = "مستودع", Floors = 1, Manager = "ماجد", Status = "active" },
                    new Building { Id = "bldg-6", Name = "مبنى الدمام الرئيسي", Code = "B-DMM-01", BranchId = "dammam", Type = "مبنى إداري", Floors = 3, Manager = "خالد", Status = "active" }
                };
                await context.Buildings.AddRangeAsync(buildings);
                await context.SaveChangesAsync();
            }

            // Seed Gates and Devices
            if (!await context.Gates.AnyAsync())
            {
                var gates = new List<Gate>
                {
                    new Gate { Id = "g1", Name = "بوابة 1", BranchId = "riyadh", BuildingId = "bldg-1", Location = "المدخل الرئيسي", Status = "active" },
                    new Gate { Id = "g2", Name = "بوابة 2", BranchId = "riyadh", BuildingId = "bldg-1", Location = "مدخل الموظفين", Status = "active" },
                    new Gate { Id = "g3", Name = "بوابة 3", BranchId = "riyadh", BuildingId = "bldg-2", Location = "مدخل الخدمات", Status = "active" },
                    new Gate { Id = "g4", Name = "بوابة 1", BranchId = "jeddah", BuildingId = "bldg-4", Location = "المدخل الرئيسي", Status = "active" },
                    new Gate { Id = "g5", Name = "بوابة 2", BranchId = "jeddah", BuildingId = "bldg-4", Location = "مدخل الزوار", Status = "active" },
                    new Gate { Id = "g6", Name = "بوابة 1", BranchId = "dammam", BuildingId = "bldg-6", Location = "المدخل الرئيسي", Status = "active" }
                };
                await context.Gates.AddRangeAsync(gates);
                await context.SaveChangesAsync();

                var devices = new List<GateDevice>
                {
                    new GateDevice { Id = "d1", GateId = "g1", Name = "جهاز المدخل الرئيسي 1", MacAddress = "AA:BB:CC:11:22:33" },
                    new GateDevice { Id = "d2", GateId = "g1", Name = "جهاز المدخل الرئيسي 2", MacAddress = "AA:BB:CC:11:22:34" },
                    new GateDevice { Id = "d3", GateId = "g2", Name = "جهاز مدخل الموظفين", MacAddress = "AA:BB:CC:22:33:44" },
                    new GateDevice { Id = "d4", GateId = "g3", Name = "جهاز مدخل الخدمات", MacAddress = "AA:BB:CC:33:44:55" }
                };
                await context.GateDevices.AddRangeAsync(devices);
                await context.SaveChangesAsync();
            }

            // Seed Paths & PathGates
            if (!await context.Paths.AnyAsync())
            {
                var paths = new List<FacilityPath>
                {
                    new FacilityPath { Id = "p1", Name = "مسار الشرقي", BranchId = "riyadh", BuildingId = "bldg-1" },
                    new FacilityPath { Id = "p2", Name = "المسار الشمالي", BranchId = "riyadh", BuildingId = "bldg-2" },
                    new FacilityPath { Id = "p3", Name = "المسار الرئيسي", BranchId = "jeddah", BuildingId = "bldg-4" },
                    new FacilityPath { Id = "p4", Name = "المسار الجنوبي", BranchId = "dammam", BuildingId = "bldg-6" }
                };
                await context.Paths.AddRangeAsync(paths);
                await context.SaveChangesAsync();

                var pathGates = new List<FacilityPathGate>
                {
                    new FacilityPathGate { PathId = "p1", GateName = "بوابة 1" },
                    new FacilityPathGate { PathId = "p1", GateName = "بوابة 2" },
                    new FacilityPathGate { PathId = "p2", GateName = "بوابة 3" },
                    new FacilityPathGate { PathId = "p3", GateName = "بوابة 1" },
                    new FacilityPathGate { PathId = "p3", GateName = "بوابة 2" },
                    new FacilityPathGate { PathId = "p4", GateName = "بوابة 1" }
                };
                await context.PathGates.AddRangeAsync(pathGates);
                await context.SaveChangesAsync();
            }

            // Seed Departments
            if (!await context.Departments.AnyAsync())
            {
                var depts = new List<Department>
                {
                    new Department { Id = "dep-hq", Name = "الإدارة العامة", Code = "HQ", Level = 1, ParentId = null, BranchId = "riyadh", Manager = "أحمد الحربي", Status = "active" },
                    new Department { Id = "dep-it", Name = "إدارة تقنية المعلومات", Code = "IT", Level = 2, ParentId = "dep-hq", BranchId = "riyadh", Manager = "م. سعد", Status = "active" },
                    new Department { Id = "dep-it-dev", Name = "قسم تطوير الأنظمة", Code = "IT-DEV", Level = 3, ParentId = "dep-it", BranchId = "riyadh", Manager = "فهد", Status = "active" },
                    new Department { Id = "dep-hr", Name = "إدارة الموارد البشرية", Code = "HR", Level = 2, ParentId = "dep-hq", BranchId = "riyadh", Manager = "سارة", Status = "active" },
                    new Department { Id = "dep-pur", Name = "إدارة المشتريات", Code = "PUR", Level = 2, ParentId = "dep-hq", BranchId = "riyadh", Manager = "ماجد", Status = "active" },
                    new Department { Id = "dep-sec", Name = "إدارة الأمن والسلامة", Code = "SEC", Level = 2, ParentId = "dep-hq", BranchId = "riyadh", Manager = "بدر", Status = "active" },
                    new Department { Id = "dep-jed-hq", Name = "إدارة فرع جدة", Code = "JED-HQ", Level = 1, ParentId = null, BranchId = "jeddah", Manager = "سارة", Status = "active" },
                    new Department { Id = "dep-dmm-hq", Name = "إدارة فرع الدمام", Code = "DMM-HQ", Level = 1, ParentId = null, BranchId = "dammam", Manager = "خالد", Status = "active" }
                };
                await context.Departments.AddRangeAsync(depts);
                await context.SaveChangesAsync();
            }

            // Seed Users
            if (!await context.Users.AnyAsync())
            {
                var allScreens = new[] { "dashboard", "new-request", "vehicle", "exit-permit", "registry", "my-requests", "permitslog", "approvals", "gate", "querylog", "cardprint", "blacklist", "branches", "buildings", "paths", "departments", "lookups", "users", "cardtemplate", "systemsettings", "auditlog", "reports" };
                var approverScreens = new[] { "dashboard", "new-request", "vehicle", "exit-permit", "registry", "my-requests", "permitslog", "approvals", "auditlog", "reports" };
                var requesterScreens = new[] { "dashboard", "new-request", "vehicle", "exit-permit", "registry", "my-requests", "permitslog" };
                var guardScreens = new[] { "gate", "querylog", "cardprint" };

                var u1 = new User { Id = "u1", Name = "أحمد الحربي", Username = "admin", PasswordHash = "admin123", Role = "admin", DepartmentId = "dep-hq", Status = "active", Avatar = "أح" };
                var u2 = new User { Id = "u2", Name = "لينا السبيعي", Username = "approver", PasswordHash = "appr123", Role = "approver", DepartmentId = "dep-hr", Status = "active", Avatar = "لف" };
                var u3 = new User { Id = "u3", Name = "بدر القرني", Username = "guard", PasswordHash = "guard123", Role = "guard", DepartmentId = "dep-sec", Status = "active", Avatar = "بق" };
                var u4 = new User { Id = "u4", Name = "م. سعد الغامدي", Username = "requester", PasswordHash = "req123", Role = "requester", DepartmentId = "dep-it", Status = "active", Avatar = "سغ" };

                await context.Users.AddRangeAsync(u1, u2, u3, u4);
                await context.SaveChangesAsync();

                // User Branches
                await context.UserBranches.AddRangeAsync(
                    new UserBranch { UserId = "u1", BranchId = "riyadh" },
                    new UserBranch { UserId = "u1", BranchId = "jeddah" },
                    new UserBranch { UserId = "u1", BranchId = "dammam" },
                    new UserBranch { UserId = "u2", BranchId = "riyadh" },
                    new UserBranch { UserId = "u3", BranchId = "riyadh" },
                    new UserBranch { UserId = "u4", BranchId = "riyadh" }
                );

                // User Buildings
                await context.UserBuildings.AddRangeAsync(
                    new UserBuilding { UserId = "u2", BuildingId = "bldg-1" },
                    new UserBuilding { UserId = "u2", BuildingId = "bldg-2" }
                );

                // User Gates
                await context.UserGates.AddRangeAsync(
                    new UserGate { UserId = "u3", GateKey = "riyadh::بوابة 1" },
                    new UserGate { UserId = "u3", GateKey = "riyadh::بوابة 3" }
                );

                // User Permissions
                foreach (var s in allScreens) await context.UserPermissions.AddAsync(new UserPermission { UserId = "u1", ScreenId = s });
                foreach (var s in approverScreens) await context.UserPermissions.AddAsync(new UserPermission { UserId = "u2", ScreenId = s });
                foreach (var s in guardScreens) await context.UserPermissions.AddAsync(new UserPermission { UserId = "u3", ScreenId = s });
                foreach (var s in requesterScreens) await context.UserPermissions.AddAsync(new UserPermission { UserId = "u4", ScreenId = s });

                await context.SaveChangesAsync();
            }

            // Seed Persons
            if (!await context.Persons.AnyAsync())
            {
                var persons = new List<Person>
                {
                    new Person { Id = "p1", BranchId = "riyadh", Name = "فيصل عبدالله المطيري", IdNumber = "1023450056", MaskedId = "1023••••56", Entity = "شركة النخبة", PersonType = "مواطن", IdType = "هوية وطنية", Nationality = "سعودي", AddedByUserId = "u4", Status = "active" },
                    new Person { Id = "p2", BranchId = "riyadh", Name = "Michael Andersen", IdNumber = "A19273044", MaskedId = "A192••44", Entity = "Siemens", PersonType = "مقيم", IdType = "جواز سفر", Nationality = "دنماركي", AddedByUserId = "u4", Status = "active" },
                    new Person { Id = "p3", BranchId = "riyadh", Name = "سلطان ناصر العتيبي", IdNumber = "1088340021", MaskedId = "1088••••21", Entity = "صيانة", PersonType = "مقيم", IdType = "إقامة", Nationality = "مصري", AddedByUserId = "u4", Status = "active" },
                    new Person { Id = "p4", BranchId = "riyadh", Name = "ماجد سعد الدوسري", IdNumber = "1076990002", MaskedId = "1076••••02", Entity = "مراجعة", PersonType = "مواطن", IdType = "هوية وطنية", Nationality = "سعودي", AddedByUserId = "u2", Status = "active" }
                };
                await context.Persons.AddRangeAsync(persons);
                await context.SaveChangesAsync();
            }

            // Seed Blacklist & Banned
            if (!await context.Blacklist.AnyAsync())
            {
                await context.Blacklist.AddAsync(new BlacklistEntry
                {
                    Id = "bl1",
                    BranchId = "riyadh",
                    IdNumber = "1044110009",
                    Name = "عمر يوسف",
                    Nationality = "سعودي",
                    Reason = "مخالفة أمنية",
                    AddedByUserId = "u3"
                });
                await context.SaveChangesAsync();
            }

            if (!await context.BannedNationalities.AnyAsync())
            {
                await context.BannedNationalities.AddAsync(new BannedNationality
                {
                    BranchId = "riyadh",
                    Nationality = "إسرائيلي"
                });
                await context.SaveChangesAsync();
            }

            // Seed Issued Permits
            if (!await context.IssuedPermits.AnyAsync())
            {
                var today = DateTime.UtcNow.Date;
                var perm1 = new IssuedPermit
                {
                    PermitNumber = "TSR-2026-08341",
                    Mode = "single",
                    Title = "فيصل عبدالله المطيري",
                    Subtitle = "شركة النخبة",
                    IdMasked = "1023 •••• 56",
                    RequestingDept = "إدارة تقنية المعلومات",
                    DepartmentId = "dep-it",
                    BranchId = "riyadh",
                    BranchName = "مجمع الرياض",
                    BuildingId = "bldg-1",
                    BuildingName = "المبنى الإداري الرئيسي",
                    PathName = "مسار الشرقي",
                    VisitDate = today.AddDays(-5).ToString("yyyy-MM-dd"),
                    ExpiryDate = today.AddDays(15).ToString("yyyy-MM-dd"),
                    SubmitterId = "u4",
                    Notes = "زيارة عمل مهمة",
                    GuardNotes = "التحقق من الهوية والأجهزة",
                    Status = "active",
                    CardNumber = "CRD-20260001"
                };

                var perm2 = new IssuedPermit
                {
                    PermitNumber = "TSR-2026-08102",
                    Mode = "single",
                    Title = "سلطان ناصر العتيبي",
                    Subtitle = "صيانة",
                    IdMasked = "1088 •••• 21",
                    RequestingDept = "إدارة تقنية المعلومات",
                    DepartmentId = "dep-it",
                    BranchId = "riyadh",
                    BranchName = "مجمع الرياض",
                    BuildingId = "bldg-2",
                    BuildingName = "مبنى التقنية",
                    PathName = "المسار الشمالي",
                    VisitDate = today.AddDays(-20).ToString("yyyy-MM-dd"),
                    ExpiryDate = today.AddDays(-5).ToString("yyyy-MM-dd"),
                    SubmitterId = "u4",
                    Notes = "صيانة خوادم",
                    GuardNotes = "تفتيش الحقيبة",
                    Status = "expired",
                    CardNumber = "CRD-20260002"
                };

                var permV = new IssuedPermit
                {
                    PermitNumber = "TSR-V-2026-1187",
                    Mode = "vehicle",
                    Title = "تويوتا لاندكروزر — أبيض",
                    Subtitle = "لوحة 1234 ا ب ج",
                    IdMasked = "1234 ا ب ج",
                    PlateNums = "1234",
                    PlateLetters = "ا ب ج",
                    DriverId = "p1",
                    RequestingDept = "إدارة تقنية المعلومات",
                    DepartmentId = "dep-it",
                    BranchId = "riyadh",
                    BranchName = "مجمع الرياض",
                    BuildingId = "bldg-1",
                    BuildingName = "المبنى الإداري الرئيسي",
                    PathName = "مسار الشرقي",
                    VisitDate = today.AddDays(-1).ToString("yyyy-MM-dd"),
                    ExpiryDate = today.AddDays(20).ToString("yyyy-MM-dd"),
                    SubmitterId = "u4",
                    Status = "active",
                    CardNumber = "CRD-20260003"
                };

                var permX = new IssuedPermit
                {
                    PermitNumber = "TSR-X-2026-5001",
                    Mode = "exit",
                    Title = "فيصل عبدالله المطيري",
                    Subtitle = "1 أصل",
                    IdMasked = "1023 •••• 56",
                    RequestingDept = "تصريح خروج",
                    DepartmentId = "dep-it",
                    BranchId = "riyadh",
                    BranchName = "مجمع الرياض",
                    BuildingId = "bldg-1",
                    BuildingName = "المبنى الإداري الرئيسي",
                    PathName = "—",
                    VisitDate = today.ToString("yyyy-MM-dd"),
                    ExpiryDate = today.ToString("yyyy-MM-dd"),
                    SubmitterId = "u4",
                    RelatedEntryPermit = "TSR-2026-08341",
                    Status = "active",
                    CardNumber = "CRD-20260004"
                };

                await context.IssuedPermits.AddRangeAsync(perm1, perm2, permV, permX);
                await context.SaveChangesAsync();

                // Permit persons
                await context.IssuedPermitPersons.AddRangeAsync(
                    new IssuedPermitPerson { PermitNumber = "TSR-2026-08341", PersonId = "p1" },
                    new IssuedPermitPerson { PermitNumber = "TSR-2026-08102", PersonId = "p3" },
                    new IssuedPermitPerson { PermitNumber = "TSR-X-2026-5001", PersonId = "p1" }
                );

                // Permit devices
                await context.IssuedPermitDevices.AddRangeAsync(
                    new IssuedPermitDevice { PermitNumber = "TSR-2026-08341", DeviceName = "📱 جوال" },
                    new IssuedPermitDevice { PermitNumber = "TSR-2026-08341", DeviceName = "💻 كمبيوتر محمول" },
                    new IssuedPermitDevice { PermitNumber = "TSR-2026-08102", DeviceName = "📱 جوال" }
                );

                // Exit items
                await context.IssuedPermitExitItems.AddAsync(
                    new IssuedPermitExitItem { PermitNumber = "TSR-X-2026-5001", Category = "💻 إلكترونيات", ItemType = "لابتوب Dell", Quantity = "1", Detail = "سيريال CN-0X554-12" }
                );

                await context.SaveChangesAsync();
            }

            // Seed Pending Requests
            if (!await context.PermitRequests.AnyAsync())
            {
                var today = DateTime.UtcNow.Date;
                var req1 = new PermitRequest
                {
                    Id = "req1",
                    Mode = "single",
                    Title = "Michael Andersen",
                    Subtitle = "A192••44",
                    RequestingDept = "إدارة تقنية المعلومات",
                    DepartmentId = "dep-it",
                    DepartmentName = "إدارة تقنية المعلومات",
                    DefaultPath = "المسار الشمالي",
                    SubmitterId = "u4",
                    SubmitterName = "م. سعد الغامدي",
                    VisitDate = today.AddDays(1).ToString("yyyy-MM-dd"),
                    ExpiryDate = today.AddDays(8).ToString("yyyy-MM-dd"),
                    BranchId = "riyadh",
                    BuildingId = "bldg-2",
                    BuildingName = "مبنى التقنية",
                    RequesterNotes = "اجتماع عمل ومراجعة عقود",
                    GuardNotes = "التحقق من جواز السفر",
                    Status = "pending"
                };

                await context.PermitRequests.AddAsync(req1);
                await context.SaveChangesAsync();

                await context.PermitRequestPersons.AddAsync(new PermitRequestPerson
                {
                    RequestId = "req1",
                    PersonId = "p2",
                    PersonName = "Michael Andersen",
                    PersonSub = "A192••44"
                });

                await context.PermitRequestDevices.AddAsync(new PermitRequestDevice
                {
                    RequestId = "req1",
                    DeviceName = "📱 جوال"
                });

                await context.SaveChangesAsync();
            }

            // Seed Lookups
            if (!await context.Lookups.AnyAsync())
            {
                var lookups = new List<LookupItem>();

                // Nationalities
                var nats = new[] { "سعودي", "إماراتي", "قطري", "كويتي", "بحريني", "عماني", "يمني", "مصري", "سوداني", "أردني", "لبناني", "سوري", "عراقي", "فلسطيني", "مغربي", "تونسي", "جزائري", "ليبي", "باكستاني", "هندي", "بنغلاديشي", "سريلانكي", "نيبالي", "فلبيني", "إندونيسي", "ماليزي", "صيني", "ياباني", "كوري", "تايلاندي", "تركي", "إيراني", "أمريكي", "بريطاني", "فرنسي", "ألماني", "إيطالي", "إسباني", "هولندي", "بلجيكي", "سويسري", "سويدي", "نرويجي", "دنماركي", "فنلندي", "نمساوي", "إيرلندي", "برتغالي", "أسترالي", "كندي", "روسي", "أوكراني", "بولندي", "يوناني", "أخرى" };
                for (int i = 0; i < nats.Length; i++) lookups.Add(new LookupItem { Category = "nationalities", Value = nats[i], SortOrder = i });

                // Person Types
                var ptypes = new[] { "مواطن", "مقيم", "زائر", "دبلوماسي" };
                for (int i = 0; i < ptypes.Length; i++) lookups.Add(new LookupItem { Category = "personTypes", Value = ptypes[i], SortOrder = i });

                // ID Types
                var idtypes = new[] { "هوية وطنية", "إقامة", "جواز سفر", "هوية خليجية" };
                for (int i = 0; i < idtypes.Length; i++) lookups.Add(new LookupItem { Category = "idTypes", Value = idtypes[i], SortOrder = i });

                // Visit Types
                var vtypes = new[] { "زيارة عمل", "صيانة", "توريد", "اجتماع", "تدريب", "زيارة رسمية", "أخرى" };
                for (int i = 0; i < vtypes.Length; i++) lookups.Add(new LookupItem { Category = "visitTypes", Value = vtypes[i], SortOrder = i });

                // Devices
                var devs = new[] { "📱 جوال", "💻 كمبيوتر محمول", "🖥️ جهاز مكتبي", "🖨️ طابعة", "🎥 كاميرا", "📷 كاميرا احترافية", "🔬 معدات فنية", "🧰 حقيبة عمل", "🔌 أجهزة كهربائية", "📁 ملفات", "📦 طرود", "🔧 قطع غيار" };
                for (int i = 0; i < devs.Length; i++) lookups.Add(new LookupItem { Category = "devices", Value = devs[i], SortOrder = i });

                // Vehicle Types
                var vehtypes = new[] { "سيدان", "دفع رباعي", "شاحنة نقل", "دراجة نارية", "حافلة", "معدات ثقيلة" };
                for (int i = 0; i < vehtypes.Length; i++) lookups.Add(new LookupItem { Category = "vehicleTypes", Value = vehtypes[i], SortOrder = i });

                // Vehicle Colors
                var vehcols = new[] { "أبيض", "أسود", "فضي", "رمادي", "أحمر", "أزرق", "أخضر", "أصفر", "بني", "بيج", "برتقالي", "ذهبي", "كحلي", "وردي", "بنفسجي" };
                for (int i = 0; i < vehcols.Length; i++) lookups.Add(new LookupItem { Category = "vehicleColors", Value = vehcols[i], SortOrder = i });

                // Vehicle Makes & Models
                var makes = new Dictionary<string, string[]>
                {
                    { "تويوتا", new[] { "كورولا", "كامري", "لاندكروزر", "هايلكس", "ياريس" } },
                    { "هيونداي", new[] { "إلنترا", "أكسنت", "سوناتا", "توسان" } },
                    { "نيسان", new[] { "ألتيما", "باترول", "صني" } },
                    { "فورد", new[] { "إكسبلورر", "F-150" } },
                    { "مرسيدس", new[] { "E-Class", "S-Class" } },
                    { "BMW", new[] { "الفئة الثالثة", "X3", "X5" } },
                    { "لكزس", new[] { "ES", "LS", "LX" } },
                    { "كيا", new[] { "سيراتو", "سبورتاج" } },
                    { "أخرى", new[] { "أخرى" } }
                };
                foreach (var make in makes)
                {
                    lookups.Add(new LookupItem { Category = "vehicleMakes", Value = make.Key });
                    foreach (var model in make.Value)
                    {
                        lookups.Add(new LookupItem { Category = "vehicleModels", Value = model, ParentValue = make.Key });
                    }
                }

                // Building Types
                var bldgtypes = new[] { "مبنى إداري", "مبنى تشغيلي", "مبنى تقني", "مبنى خدمات", "مستودع", "مبنى أمني" };
                for (int i = 0; i < bldgtypes.Length; i++) lookups.Add(new LookupItem { Category = "buildingTypes", Value = bldgtypes[i], SortOrder = i });

                // Gate Locations
                var glocs = new[] { "المدخل الرئيسي", "مدخل الخدمات", "مدخل الموظفين", "مدخل الطوارئ", "مدخل الزوار" };
                for (int i = 0; i < glocs.Length; i++) lookups.Add(new LookupItem { Category = "gateLocations", Value = glocs[i], SortOrder = i });

                await context.Lookups.AddRangeAsync(lookups);
                await context.SaveChangesAsync();
            }

            // Seed System Settings
            if (!await context.Settings.AnyAsync())
            {
                var settings = new List<SystemSetting>
                {
                    new SystemSetting { Key = "SystemName", Value = "نظام تصاريح دخول المجمع", Description = "اسم النظام المعروض" },
                    new SystemSetting { Key = "Theme", Value = "default", Description = "الثيم اللوني" },
                    new SystemSetting { Key = "DefaultHoursFrom", Value = "07:00", Description = "بداية الدوام الافتراضي" },
                    new SystemSetting { Key = "DefaultHoursTo", Value = "17:00", Description = "نهاية الدوام الافتراضي" },
                    new SystemSetting { Key = "DefaultHoursDays", Value = "sun,mon,tue,wed,thu", Description = "أيام الدوام الافتراضي" }
                };
                await context.Settings.AddRangeAsync(settings);
                await context.SaveChangesAsync();
            }

            // Seed Audit log
            if (!await context.AuditLogs.AnyAsync())
            {
                await context.AuditLogs.AddAsync(new AuditLog
                {
                    LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                    ActionType = "add",
                    Message = "تهيئة النظام",
                    Details = "تهيئة قاعدة البيانات بنجاح",
                    UserName = "النظام"
                });
                await context.SaveChangesAsync();
            }
        }
    }
}
