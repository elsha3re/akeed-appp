using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AccessPermits.Application.DTOs;
using AccessPermits.Application.Interfaces;
using AccessPermits.Core.Entities.Permits;
using AccessPermits.Core.Entities.Registry;
using AccessPermits.Core.Entities.Organization;
using AccessPermits.Core.Entities.GateOperations;
using AccessPermits.Core.Interfaces;

namespace AccessPermits.Application.Services
{
    public class GateService : IGateService
    {
        private readonly IUnitOfWork _unitOfWork;

        public GateService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<GateQueryResultDto>> QueryGateAsync(GateQueryDto query, string currentUserId, string currentUserName)
        {
            var val = (query.QueryValue ?? string.Empty).Trim();
            var gateName = query.GateName;
            var branchId = query.BranchId;
            var todayStr = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var currentTimeStr = DateTime.UtcNow.ToString("HH:mm");
            var currentDayKey = DateTime.UtcNow.DayOfWeek switch
            {
                DayOfWeek.Sunday => "sun",
                DayOfWeek.Monday => "mon",
                DayOfWeek.Tuesday => "tue",
                DayOfWeek.Wednesday => "wed",
                DayOfWeek.Thursday => "thu",
                DayOfWeek.Friday => "fri",
                DayOfWeek.Saturday => "sat",
                _ => "sun"
            };

            var result = new GateQueryResultDto();

            if (query.Mode == "vehicle")
            {
                // Query vehicle
                result.IsVehicle = true;
                var vehiclePermits = await _unitOfWork.Repository<IssuedPermit>()
                    .Query()
                    .Include(p => p.Devices)
                    .Where(p => p.Mode == "vehicle" && p.BranchId == branchId && p.PlateNums == val)
                    .ToListAsync();

                if (!vehiclePermits.Any())
                {
                    result.Status = "notfound";
                    result.Title = "لا يوجد تصريح";
                    result.Name = $"لوحة {val}";
                    result.ResultType = "notfound";
                    result.ResultLabel = "❓";
                    await LogQueryAsync(val, result.Name, "notfound", "❓", null, gateName, branchId, currentUserName);
                    return ApiResponse<GateQueryResultDto>.Ok(result);
                }

                var perm = vehiclePermits.OrderBy(p => p.Status == "active" ? 0 : 1).First();
                return await EvaluatePermitAsync(perm, gateName, todayStr, currentTimeStr, currentDayKey, val, currentUserName, branchId);
            }
            else
            {
                // Query person or exit
                bool isExit = query.Mode == "exit";

                // Check Blacklist
                var blacklist = await _unitOfWork.Repository<BlacklistEntry>()
                    .Query()
                    .FirstOrDefaultAsync(b => b.BranchId == branchId && b.IdNumber.EndsWith(val));

                if (blacklist != null)
                {
                    result.Status = "blacklist";
                    result.Title = "⛔ ممنوع من الدخول";
                    result.Name = blacklist.Name;
                    result.Subtitle = blacklist.Reason;
                    result.Nationality = blacklist.Nationality;
                    result.ResultType = "blacklist";
                    result.ResultLabel = "⛔";
                    result.Facts.Add(Tuple.Create("الهوية", MaskId(blacklist.IdNumber)));
                    result.Facts.Add(Tuple.Create("الجنسية", "🌍 " + (blacklist.Nationality ?? "—")));

                    await LogQueryAsync(val, blacklist.Name, "blacklist", "⛔", blacklist.Nationality, gateName, branchId, currentUserName);
                    return ApiResponse<GateQueryResultDto>.Ok(result);
                }

                // Find matching people ending with digits
                var matchingPersons = await _unitOfWork.Repository<Person>()
                    .Query()
                    .Include(p => p.Attachments)
                    .Where(p => p.BranchId == branchId && p.IdNumber.EndsWith(val))
                    .ToListAsync();

                if (!matchingPersons.Any())
                {
                    result.Status = "notfound";
                    result.Title = "لا يوجد شخص مسجل";
                    result.Name = "—";
                    result.Subtitle = "تحقق من الأرقام المدخلة";
                    result.ResultType = "notfound";
                    result.ResultLabel = "❓";

                    await LogQueryAsync(val, "—", "notfound", "❓", null, gateName, branchId, currentUserName);
                    return ApiResponse<GateQueryResultDto>.Ok(result);
                }

                // If multiple matching people
                if (matchingPersons.Count > 1)
                {
                    result.Status = "choose";
                    result.Title = "أكثر من تطابق";
                    result.Name = $"{matchingPersons.Count} أشخاص";
                    result.Subtitle = "يرجى الاختيار";
                    result.Choices = matchingPersons.Select(p => new PersonDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        IdNumber = p.IdNumber,
                        MaskedId = p.MaskedId,
                        Nationality = p.Nationality
                    }).ToList();
                    return ApiResponse<GateQueryResultDto>.Ok(result);
                }

                var person = matchingPersons.First();

                // Check banned nationality
                var isBanned = await _unitOfWork.Repository<BannedNationality>()
                    .AnyAsync(b => b.BranchId == branchId && b.Nationality == person.Nationality);

                if (isBanned)
                {
                    result.Status = "blacklist";
                    result.Title = "⛔ جنسية محظورة";
                    result.Name = person.Name;
                    result.Subtitle = person.Nationality;
                    result.Nationality = person.Nationality;
                    result.ResultType = "blacklist";
                    result.ResultLabel = "⛔";
                    result.Facts.Add(Tuple.Create("الهوية", person.MaskedId));
                    result.Facts.Add(Tuple.Create("الجنسية", "🌍 " + person.Nationality));

                    await LogQueryAsync(val, person.Name, "blacklist", "⛔", person.Nationality, gateName, branchId, currentUserName);
                    return ApiResponse<GateQueryResultDto>.Ok(result);
                }

                // Find permits for this person
                var targetMode = isExit ? "exit" : "single";
                var permits = await _unitOfWork.Repository<IssuedPermit>()
                    .Query()
                    .Include(p => p.Persons)
                    .Include(p => p.Devices)
                    .Include(p => p.ExitItems)
                    .Where(p => p.Mode == targetMode && p.BranchId == branchId && p.Persons.Any(pp => pp.PersonId == person.Id))
                    .ToListAsync();

                if (!permits.Any())
                {
                    result.Status = "notfound";
                    result.Title = isExit ? "لا يوجد تصريح خروج" : "لا يوجد تصريح دخول";
                    result.Name = person.Name;
                    result.Subtitle = person.Entity ?? "—";
                    result.Nationality = person.Nationality;
                    result.Photo = person.Attachments.FirstOrDefault(a => a.AttachmentType == "personal")?.Base64Data;
                    result.ResultType = "notfound";
                    result.ResultLabel = "❓";
                    result.Facts.Add(Tuple.Create("الهوية", person.MaskedId));
                    result.Facts.Add(Tuple.Create("الجنسية", "🌍 " + person.Nationality));

                    await LogQueryAsync(val, person.Name, "notfound", "❓", person.Nationality, gateName, branchId, currentUserName);
                    return ApiResponse<GateQueryResultDto>.Ok(result);
                }

                var bestPermit = permits.OrderBy(p => p.Status == "active" ? 0 : 1).First();
                var evalResult = await EvaluatePermitAsync(bestPermit, gateName, todayStr, currentTimeStr, currentDayKey, val, currentUserName, branchId);
                evalResult.Data!.Photo = person.Attachments.FirstOrDefault(a => a.AttachmentType == "personal")?.Base64Data;
                evalResult.Data.Nationality = person.Nationality;
                return evalResult;
            }
        }

        private async Task<ApiResponse<GateQueryResultDto>> EvaluatePermitAsync(IssuedPermit perm, string gateName, string todayStr, string currentTimeStr, string currentDayKey, string val, string officerName, string branchId)
        {
            var result = new GateQueryResultDto
            {
                Name = perm.Title,
                Subtitle = perm.Subtitle,
                PermitNumber = perm.PermitNumber,
                Notes = perm.Notes,
                GuardNotes = perm.GuardNotes,
                Devices = perm.Devices.Select(d => d.DeviceName).ToList(),
                Items = perm.ExitItems.Select(i => new ExitItemDto { Category = i.Category, Type = i.ItemType, Quantity = i.Quantity, Detail = i.Detail }).ToList()
            };

            result.Facts.Add(Tuple.Create("رقم التصريح", perm.PermitNumber));
            result.Facts.Add(Tuple.Create("المبنى", perm.BuildingName));
            result.Facts.Add(Tuple.Create("المسار", perm.PathName));
            result.Facts.Add(Tuple.Create("تاريخ الانتهاء", perm.ExpiryDate));

            // Check Suspended
            if (perm.Status == "suspended")
            {
                result.Status = "suspended";
                result.Title = "⏸️ تصريح موقوف";
                result.Subtitle = perm.SuspendReason ?? "تم إيقاف التصريح مؤقتاً";
                result.ResultType = "expired";
                result.ResultLabel = "⏸️ موقوف";
                await LogQueryAsync(val, perm.Title, result.ResultType, result.ResultLabel, null, gateName, branchId, officerName);
                return ApiResponse<GateQueryResultDto>.Ok(result);
            }

            // Check Upcoming
            if (string.Compare(perm.VisitDate, todayStr) > 0)
            {
                result.Status = "upcoming";
                result.Title = "🕒 لم تبدأ صلاحية التصريح";
                result.Subtitle = $"يبدأ بتاريخ {perm.VisitDate}";
                result.ResultType = "expired";
                result.ResultLabel = "🕒 لم يبدأ";
                await LogQueryAsync(val, perm.Title, result.ResultType, result.ResultLabel, null, gateName, branchId, officerName);
                return ApiResponse<GateQueryResultDto>.Ok(result);
            }

            // Check Expired
            if (string.Compare(perm.ExpiryDate, todayStr) < 0)
            {
                result.Status = "expired";
                result.Title = "⏱️ التصريح منتهي الصلاحية";
                result.Subtitle = $"انتهى بتاريخ {perm.ExpiryDate}";
                result.ResultType = "expired";
                result.ResultLabel = "⏱ منتهي";
                await LogQueryAsync(val, perm.Title, result.ResultType, result.ResultLabel, null, gateName, branchId, officerName);
                return ApiResponse<GateQueryResultDto>.Ok(result);
            }

            // Check Gate Authorization (Path)
            if (perm.Mode != "exit")
            {
                var path = await _unitOfWork.Repository<FacilityPath>()
                    .Query()
                    .Include(p => p.Gates)
                    .FirstOrDefaultAsync(p => p.BranchId == branchId && p.Name == perm.PathName);

                if (path != null && !path.Gates.Any(g => g.GateName == gateName))
                {
                    result.Status = "wronggate";
                    result.Title = "⚠️ بوابة غير مصرح بها";
                    result.Subtitle = $"المسار «{perm.PathName}» لا يشمل {gateName}";
                    result.ResultType = "expired";
                    result.ResultLabel = "🚧 بوابة خاطئة";
                    await LogQueryAsync(val, perm.Title, result.ResultType, result.ResultLabel, null, gateName, branchId, officerName);
                    return ApiResponse<GateQueryResultDto>.Ok(result);
                }
            }

            // Check Working Hours / Days Warning
            var branch = await _unitOfWork.Repository<Branch>().GetByIdAsync(branchId);
            var workingDays = !string.IsNullOrEmpty(perm.WorkingDays) ? perm.WorkingDays : branch?.WorkingHoursDays ?? "sun,mon,tue,wed,thu";
            var timeFrom = !string.IsNullOrEmpty(perm.TimeFrom) ? perm.TimeFrom : branch?.WorkingHoursFrom ?? "07:00";
            var timeTo = !string.IsNullOrEmpty(perm.TimeTo) ? perm.TimeTo : branch?.WorkingHoursTo ?? "17:00";

            var daysList = workingDays.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(d => d.Trim().ToLower()).ToList();

            if (!daysList.Contains(currentDayKey))
            {
                result.WarningMessage = "⚠️ تنبيه: اليوم ليس ضمن أيام الدوام المصرح بها لهذا التصريح";
            }
            else if (string.Compare(currentTimeStr, timeFrom) < 0 || string.Compare(currentTimeStr, timeTo) > 0)
            {
                result.WarningMessage = $"⚠️ تنبيه: الوقت الحالي ({currentTimeStr}) خارج ساعات الدوام الرسمية ({timeFrom} إلى {timeTo})";
            }

            // Valid!
            if (perm.Mode == "exit")
            {
                result.Status = "exit";
                result.Title = "✅ تصريح خروج ساري";
                result.ResultType = "exit";
                result.ResultLabel = "🚪 خروج مصرح";
            }
            else
            {
                result.Status = "active";
                result.Title = "✅ تصريح ساري المفعول";
                result.ResultType = "active";
                result.ResultLabel = "✔ مصرح بالدخول";
            }

            await LogQueryAsync(val, perm.Title, result.ResultType, result.ResultLabel, null, gateName, branchId, officerName);
            return ApiResponse<GateQueryResultDto>.Ok(result);
        }

        private async Task LogQueryAsync(string queryValue, string name, string resultType, string resultLabel, string? nationality, string gate, string branchId, string officer)
        {
            var branch = await _unitOfWork.Repository<Branch>().GetByIdAsync(branchId);
            var branchName = branch?.Name ?? branchId;

            var log = new Core.Entities.GateOperations.QueryLog
            {
                QueryTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                QueryValue = queryValue,
                SubjectName = name,
                ResultType = resultType,
                ResultLabel = resultLabel,
                Nationality = nationality,
                GateName = gate,
                BranchName = branchName,
                OfficerName = officer
            };

            await _unitOfWork.Repository<Core.Entities.GateOperations.QueryLog>().AddAsync(log);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<ApiResponse<bool>> LogMovementAsync(string permitNumber, string direction, string gateName, string branchName, string officerName, string? notes = null)
        {
            var perm = await _unitOfWork.Repository<IssuedPermit>().GetByIdAsync(permitNumber);
            var subjectName = perm?.Title ?? permitNumber;

            var movement = new GateMovementLog
            {
                MovementTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                Direction = direction,
                PermitNumber = permitNumber,
                SubjectName = subjectName,
                GateName = gateName,
                BranchName = branchName,
                OfficerName = officerName,
                Notes = notes
            };

            await _unitOfWork.Repository<GateMovementLog>().AddAsync(movement);
            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تم تسجيل الحركة بنجاح");
        }

        public async Task<ApiResponse<List<Core.Entities.GateOperations.QueryLog>>> GetQueryLogsAsync(string? search = null, string? filter = null)
        {
            var query = _unitOfWork.Repository<Core.Entities.GateOperations.QueryLog>().Query().AsQueryable();

            if (!string.IsNullOrEmpty(filter) && filter != "all")
                query = query.Where(q => q.ResultType == filter);

            if (!string.IsNullOrEmpty(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(q => q.QueryValue.Contains(s) || q.SubjectName.ToLower().Contains(s) || (q.GateName != null && q.GateName.ToLower().Contains(s)));
            }

            var logs = await query.OrderByDescending(q => q.CreatedAt).Take(200).ToListAsync();
            return ApiResponse<List<Core.Entities.GateOperations.QueryLog>>.Ok(logs);
        }

        private static string MaskId(string id)
        {
            return id.Length > 6 ? id[..4] + "••••" + id[^2..] : id;
        }
    }
}
