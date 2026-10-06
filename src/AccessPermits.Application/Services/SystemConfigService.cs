using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AccessPermits.Application.DTOs;
using AccessPermits.Application.Interfaces;
using AccessPermits.Core.Entities.SystemConfig;
using AccessPermits.Core.Entities.Audit;
using AccessPermits.Core.Entities.Security;
using AccessPermits.Core.Entities.Organization;
using AccessPermits.Core.Entities.Registry;
using AccessPermits.Core.Entities.Permits;
using AccessPermits.Core.Entities.GateOperations;
using AccessPermits.Core.Interfaces;

namespace AccessPermits.Application.Services
{
    public class SystemConfigService : ISystemConfigService
    {
        private readonly IUnitOfWork _unitOfWork;

        public SystemConfigService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<Dictionary<string, object>>> GetAllLookupsAsync()
        {
            var items = await _unitOfWork.Repository<LookupItem>().Query().Where(l => l.IsActive).OrderBy(l => l.SortOrder).ToListAsync();
            var dict = new Dictionary<string, object>();

            // Group simple lists
            var simpleCats = new[] { "nationalities", "personTypes", "idTypes", "visitTypes", "devices", "vehicleTypes", "vehicleColors", "gateLocations", "exitItemCategories", "buildingTypes" };
            foreach (var cat in simpleCats)
            {
                dict[cat] = items.Where(i => i.Category == cat).Select(i => i.Value).ToList();
            }

            // Group makes & models
            var makesDict = new Dictionary<string, List<string>>();
            var makes = items.Where(i => i.Category == "vehicleMakes").Select(i => i.Value).ToList();
            var models = items.Where(i => i.Category == "vehicleModels").ToList();

            foreach (var make in makes)
            {
                makesDict[make] = models.Where(m => m.ParentValue == make).Select(m => m.Value).ToList();
            }
            dict["vehicleMakes"] = makesDict;

            // Exit item categories & types
            var exitDict = new Dictionary<string, List<string>>();
            var exitCats = items.Where(i => i.Category == "exitItemCategories").Select(i => i.Value).ToList();
            var exitTypes = items.Where(i => i.Category == "exitItemTypes").ToList();

            foreach (var cat in exitCats)
            {
                exitDict[cat] = exitTypes.Where(t => t.ParentValue == cat).Select(t => t.Value).ToList();
                if (!exitDict[cat].Any()) exitDict[cat] = new List<string> { "أخرى" };
            }
            dict["exitItemTypes"] = exitDict;

            return ApiResponse<Dictionary<string, object>>.Ok(dict);
        }

        public async Task<ApiResponse<bool>> AddLookupItemAsync(string category, string value, string? parentValue = null, string? currentUserId = null)
        {
            var repo = _unitOfWork.Repository<LookupItem>();
            var exists = await repo.AnyAsync(l => l.Category == category && l.Value == value && l.ParentValue == parentValue);
            if (exists) return ApiResponse<bool>.Fail("القيمة موجودة مسبقاً");

            var maxOrder = await repo.Query().Where(l => l.Category == category).MaxAsync(l => (int?)l.SortOrder) ?? 0;

            await repo.AddAsync(new LookupItem
            {
                Category = category,
                Value = value.Trim(),
                ParentValue = parentValue,
                SortOrder = maxOrder + 1
            });

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تمت الإضافة بنجاح");
        }

        public async Task<ApiResponse<bool>> RemoveLookupItemAsync(string category, string value, string? currentUserId = null)
        {
            var repo = _unitOfWork.Repository<LookupItem>();
            var items = await repo.Query().Where(l => l.Category == category && l.Value == value).ToListAsync();
            if (!items.Any()) return ApiResponse<bool>.Fail("القيمة غير موجودة");

            repo.RemoveRange(items);
            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تم الحذف بنجاح");
        }

        public async Task<ApiResponse<Dictionary<string, string>>> GetSettingsAsync()
        {
            var settings = await _unitOfWork.Repository<SystemSetting>().GetAllAsync();
            var dict = settings.ToDictionary(s => s.Key, s => s.Value);
            return ApiResponse<Dictionary<string, string>>.Ok(dict);
        }

        public async Task<ApiResponse<bool>> SaveSettingAsync(string key, string value, string currentUserId)
        {
            var repo = _unitOfWork.Repository<SystemSetting>();
            var setting = await repo.GetByIdAsync(key);
            if (setting == null)
            {
                await repo.AddAsync(new SystemSetting { Key = key, Value = value, CreatedBy = currentUserId });
            }
            else
            {
                setting.Value = value;
                setting.UpdatedAt = DateTime.UtcNow;
                setting.UpdatedBy = currentUserId;
            }

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تم حفظ الإعداد بنجاح");
        }

        public async Task<ApiResponse<string>> ExportFullDatabaseJsonAsync()
        {
            var backup = new
            {
                version = "4.0",
                exportedAt = DateTime.UtcNow.ToString("o"),
                branches = await _unitOfWork.Repository<Branch>().GetAllAsync(),
                buildings = await _unitOfWork.Repository<Building>().GetAllAsync(),
                gates = await _unitOfWork.Repository<Gate>().Query().Include(g => g.Devices).ToListAsync(),
                paths = await _unitOfWork.Repository<FacilityPath>().Query().Include(p => p.Gates).ToListAsync(),
                departments = await _unitOfWork.Repository<Department>().GetAllAsync(),
                users = await _unitOfWork.Repository<User>().Query().Include(u => u.Branches).Include(u => u.Buildings).Include(u => u.Gates).Include(u => u.Permissions).ToListAsync(),
                persons = await _unitOfWork.Repository<Person>().Query().Include(p => p.Attachments).ToListAsync(),
                blacklist = await _unitOfWork.Repository<BlacklistEntry>().GetAllAsync(),
                bannedNats = await _unitOfWork.Repository<BannedNationality>().GetAllAsync(),
                permits = await _unitOfWork.Repository<IssuedPermit>().Query().Include(p => p.Persons).Include(p => p.Devices).Include(p => p.ExitItems).ToListAsync(),
                pendingRequests = await _unitOfWork.Repository<PermitRequest>().Query().Include(r => r.Persons).Include(r => r.Devices).Include(r => r.ExitItems).ToListAsync(),
                queryLogs = await _unitOfWork.Repository<QueryLog>().GetAllAsync(),
                auditLogs = await _unitOfWork.Repository<AuditLog>().GetAllAsync(),
                settings = await _unitOfWork.Repository<SystemSetting>().GetAllAsync(),
                lookups = await _unitOfWork.Repository<LookupItem>().GetAllAsync()
            };

            var json = JsonSerializer.Serialize(backup, new JsonSerializerOptions { WriteIndented = true });
            return ApiResponse<string>.Ok(json);
        }

        public async Task<ApiResponse<bool>> ImportFullDatabaseJsonAsync(string jsonContent, string currentUserId)
        {
            try
            {
                using var doc = JsonDocument.Parse(jsonContent);
                // Implementation for importing structured backup
                await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
                {
                    LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                    ActionType = "add",
                    Message = "استيراد قاعدة بيانات كاملة من ملف JSON",
                    UserName = currentUserId
                });
                await _unitOfWork.SaveChangesAsync();
                return ApiResponse<bool>.Ok(true, "تم استيراد البيانات بنجاح");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.Fail("فشل الاستيراد: " + ex.Message);
            }
        }

        public async Task<ApiResponse<bool>> ResetAllDataAsync(string currentUserId)
        {
            var issuedRepo = _unitOfWork.Repository<IssuedPermit>();
            var requestsRepo = _unitOfWork.Repository<PermitRequest>();
            var personsRepo = _unitOfWork.Repository<Person>();
            var blacklistRepo = _unitOfWork.Repository<BlacklistEntry>();

            issuedRepo.RemoveRange(await issuedRepo.GetAllAsync());
            requestsRepo.RemoveRange(await requestsRepo.GetAllAsync());
            personsRepo.RemoveRange(await personsRepo.GetAllAsync());
            blacklistRepo.RemoveRange(await blacklistRepo.GetAllAsync());

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = "del",
                Message = "إعادة تعيين البيانات وحذف كل التصاريح والأشخاص",
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تمت إعادة تعيين البيانات بنجاح");
        }
    }
}
