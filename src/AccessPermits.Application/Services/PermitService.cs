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
using AccessPermits.Core.Entities.Audit;
using AccessPermits.Core.Interfaces;

namespace AccessPermits.Application.Services
{
    public class PermitService : IPermitService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PermitService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<List<PermitRequest>>> GetPendingRequestsAsync(string? branchId = null, string? currentUserId = null, string? role = null)
        {
            var query = _unitOfWork.Repository<PermitRequest>()
                .Query()
                .Include(r => r.Persons)
                .Include(r => r.Devices)
                .Include(r => r.ExitItems)
                .Include(r => r.Attachments)
                .Where(r => r.Status == "pending")
                .AsQueryable();

            if (!string.IsNullOrEmpty(branchId))
                query = query.Where(r => r.BranchId == branchId);

            if (role == "requester" && !string.IsNullOrEmpty(currentUserId))
                query = query.Where(r => r.SubmitterId == currentUserId);

            var list = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
            return ApiResponse<List<PermitRequest>>.Ok(list);
        }

        public async Task<ApiResponse<PermitRequest>> GetRequestByIdAsync(string id)
        {
            var req = await _unitOfWork.Repository<PermitRequest>()
                .Query()
                .Include(r => r.Persons)
                .Include(r => r.Devices)
                .Include(r => r.ExitItems)
                .Include(r => r.Attachments)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (req == null) return ApiResponse<PermitRequest>.Fail("الطلب غير موجود");
            return ApiResponse<PermitRequest>.Ok(req);
        }

        public async Task<ApiResponse<string>> CreatePermitRequestAsync(CreatePermitRequestDto dto, string currentUserId, string currentUserName)
        {
            if (string.IsNullOrEmpty(dto.BranchId) || string.IsNullOrEmpty(dto.BuildingId))
                return ApiResponse<string>.Fail("يرجى اختيار الفرع والمبنى");

            if (string.IsNullOrEmpty(dto.VisitDate) || string.IsNullOrEmpty(dto.ExpiryDate))
                return ApiResponse<string>.Fail("يرجى تحديد فترة الزيارة");

            var bldg = await _unitOfWork.Repository<Building>().GetByIdAsync(dto.BuildingId);
            var bldgName = bldg?.Name ?? "—";

            var reqId = "req-" + Guid.NewGuid().ToString("N")[..8];
            bool isMulti = dto.Mode == "multi" && dto.PersonIds.Count > 1;

            string title = dto.Title ?? "طلب تصريح";
            string subtitle = dto.Subtitle ?? "—";

            if (dto.Mode == "vehicle")
            {
                title = $"{dto.VehicleMake} {dto.VehicleModel} — {dto.VehicleColor}";
                subtitle = $"لوحة {dto.PlateNums} {dto.PlateLetters}";
            }
            else if (dto.Mode == "exit")
            {
                var person = dto.PersonIds.Any() ? await _unitOfWork.Repository<Person>().GetByIdAsync(dto.PersonIds[0]) : null;
                title = person?.Name ?? "تصريح خروج";
                subtitle = $"{dto.ExitItems.Count} أصل";
            }
            else if (isMulti)
            {
                title = $"طلب متعدد — {dto.RequestingDept}";
                subtitle = $"{dto.PersonIds.Count} أشخاص";
            }
            else if (dto.PersonIds.Any())
            {
                var person = await _unitOfWork.Repository<Person>().GetByIdAsync(dto.PersonIds[0]);
                if (person != null)
                {
                    title = person.Name;
                    subtitle = person.MaskedId;
                }
            }

            var request = new PermitRequest
            {
                Id = reqId,
                Mode = dto.Mode,
                Title = title,
                Subtitle = subtitle,
                RequestingDept = dto.RequestingDept,
                DepartmentId = dto.DepartmentId,
                DepartmentName = dto.RequestingDept,
                BranchId = dto.BranchId,
                BuildingId = dto.BuildingId,
                BuildingName = bldgName,
                DefaultPath = dto.DefaultPath,
                VisitDate = dto.VisitDate,
                ExpiryDate = dto.ExpiryDate,
                SubmitterId = currentUserId,
                SubmitterName = currentUserName,
                RequesterNotes = dto.RequesterNotes,
                GuardNotes = dto.GuardNotes,
                Status = "pending",
                PlateNumbers = dto.PlateNums,
                PlateLetters = dto.PlateLetters,
                DriverId = dto.DriverId,
                RelatedEntryPermitNo = dto.RelatedEntryPermitNo,
                IsRenewal = dto.IsRenewal,
                OriginalPermitNumber = dto.OriginalPermitNumber,
                RenewGroupRef = dto.RenewGroupRef,
                CreatedBy = currentUserId
            };

            // Persons
            foreach (var pid in dto.PersonIds)
            {
                var p = await _unitOfWork.Repository<Person>().GetByIdAsync(pid);
                if (p != null)
                {
                    var perPersonConfig = dto.PerPerson.TryGetValue(pid, out var cfg) ? cfg : null;
                    request.Persons.Add(new PermitRequestPerson
                    {
                        RequestId = request.Id,
                        PersonId = p.Id,
                        PersonName = p.Name,
                        PersonSub = p.MaskedId,
                        CustomPath = perPersonConfig?.Path,
                        DateFrom = perPersonConfig?.DateFrom,
                        DateTo = perPersonConfig?.DateTo,
                        TimeFrom = perPersonConfig?.TimeFrom,
                        TimeTo = perPersonConfig?.TimeTo,
                        CustomDays = perPersonConfig?.Days != null ? string.Join(",", perPersonConfig.Days) : null,
                        CustomDevices = perPersonConfig?.Devices != null ? string.Join(",", perPersonConfig.Devices) : null
                    });
                }
            }

            // Devices
            if (dto.Devices != null)
            {
                foreach (var dev in dto.Devices)
                {
                    request.Devices.Add(new PermitRequestDevice
                    {
                        RequestId = request.Id,
                        DeviceName = dev
                    });
                }
            }

            // Exit Items
            if (dto.ExitItems != null)
            {
                foreach (var item in dto.ExitItems)
                {
                    request.ExitItems.Add(new PermitRequestExitItem
                    {
                        RequestId = request.Id,
                        Category = item.Category,
                        ItemType = item.Type,
                        Quantity = item.Quantity,
                        SerialOrDetail = item.Detail
                    });
                }
            }

            // Attachments
            if (dto.Attachments != null)
            {
                foreach (var a in dto.Attachments)
                {
                    if (!string.IsNullOrEmpty(a.Data))
                    {
                        request.Attachments.Add(new PermitRequestAttachment
                        {
                            RequestId = request.Id,
                            FileName = a.Name ?? "attachment",
                            FileSize = a.Size,
                            ContentType = a.Type ?? "application/octet-stream",
                            Base64Data = a.Data
                        });
                    }
                }
            }

            await _unitOfWork.Repository<PermitRequest>().AddAsync(request);

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = "add",
                Message = $"تقديم طلب تصريح: {request.Title}",
                Details = $"النوع: {request.Mode} - الفرع: {request.BranchId}",
                UserName = currentUserName
            });

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<string>.Ok(request.Id, "تم إرسال الطلب بنجاح");
        }

        public async Task<ApiResponse<bool>> ProcessApprovalDecisionAsync(ApprovalDecisionDto decision, string currentUserId, string currentUserName)
        {
            var req = await _unitOfWork.Repository<PermitRequest>()
                .Query()
                .Include(r => r.Persons)
                .Include(r => r.Devices)
                .Include(r => r.ExitItems)
                .Include(r => r.Attachments)
                .FirstOrDefaultAsync(r => r.Id == decision.RequestId);

            if (req == null) return ApiResponse<bool>.Fail("الطلب غير موجود");
            if (req.Status != "pending") return ApiResponse<bool>.Fail("الطلب تمت معالجته مسبقاً");

            if (decision.Action.ToLower() == "reject")
            {
                req.Status = "rejected";
                req.UpdatedAt = DateTime.UtcNow;
                req.UpdatedBy = currentUserName;

                await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
                {
                    LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                    ActionType = "reject",
                    Message = $"رفض طلب تصريح: {req.Title}",
                    Details = $"السبب: {decision.Note}",
                    UserName = currentUserName
                });

                await _unitOfWork.SaveChangesAsync();
                return ApiResponse<bool>.Ok(true, "تم رفض الطلب");
            }

            // Approval
            req.Status = "approved";
            req.UpdatedAt = DateTime.UtcNow;
            req.UpdatedBy = currentUserName;

            var branch = await _unitOfWork.Repository<Branch>().GetByIdAsync(req.BranchId);
            var branchName = branch?.Name ?? req.BranchId;

            var issuedPermitsRepo = _unitOfWork.Repository<IssuedPermit>();
            var rnd = new Random();

            // Filter approved persons in multi-mode if selection provided
            var approvedPersons = req.Persons.ToList();
            if (req.Mode == "multi" && decision.SelectedPersonIds != null && decision.SelectedPersonIds.Any())
            {
                approvedPersons = approvedPersons.Where(p => decision.SelectedPersonIds.Contains(p.PersonId)).ToList();
            }

            if (req.Mode == "vehicle")
            {
                var permNo = $"TSR-V-2026-{rnd.Next(1000, 9999)}";
                var perm = new IssuedPermit
                {
                    PermitNumber = permNo,
                    Mode = "vehicle",
                    Title = req.Title,
                    Subtitle = req.Subtitle,
                    IdMasked = $"{req.PlateNumbers} {req.PlateLetters}",
                    RequestingDept = req.RequestingDept ?? "—",
                    DepartmentId = req.DepartmentId,
                    BranchId = req.BranchId,
                    BranchName = branchName,
                    BuildingId = req.BuildingId,
                    BuildingName = req.BuildingName ?? "—",
                    PathName = req.DefaultPath,
                    VisitDate = req.VisitDate,
                    ExpiryDate = req.ExpiryDate,
                    SubmitterId = req.SubmitterId,
                    Notes = req.RequesterNotes,
                    GuardNotes = req.GuardNotes,
                    ApprovedBy = currentUserName,
                    ApprovalNote = decision.Note,
                    Status = "active",
                    PlateNums = req.PlateNumbers,
                    PlateLetters = req.PlateLetters,
                    DriverId = req.DriverId,
                    CardNumber = $"CRD-{rnd.Next(20260000, 20269999)}"
                };
                await issuedPermitsRepo.AddAsync(perm);
            }
            else if (req.Mode == "exit")
            {
                var permNo = $"TSR-X-2026-{rnd.Next(1000, 9999)}";
                var person = approvedPersons.FirstOrDefault();
                var perm = new IssuedPermit
                {
                    PermitNumber = permNo,
                    Mode = "exit",
                    Title = req.Title,
                    Subtitle = req.Subtitle,
                    IdMasked = person?.PersonSub ?? "—",
                    RequestingDept = req.RequestingDept ?? "تصريح خروج",
                    DepartmentId = req.DepartmentId,
                    BranchId = req.BranchId,
                    BranchName = branchName,
                    BuildingId = req.BuildingId,
                    BuildingName = req.BuildingName ?? "—",
                    PathName = "—",
                    VisitDate = req.VisitDate,
                    ExpiryDate = req.ExpiryDate,
                    SubmitterId = req.SubmitterId,
                    Notes = req.RequesterNotes,
                    GuardNotes = req.GuardNotes,
                    ApprovedBy = currentUserName,
                    ApprovalNote = decision.Note,
                    RelatedEntryPermit = req.RelatedEntryPermitNo,
                    Status = "active",
                    CardNumber = $"CRD-{rnd.Next(20260000, 20269999)}"
                };
                if (person != null)
                {
                    perm.Persons.Add(new IssuedPermitPerson { PermitNumber = permNo, PersonId = person.PersonId });
                }
                foreach (var item in req.ExitItems)
                {
                    perm.ExitItems.Add(new IssuedPermitExitItem
                    {
                        PermitNumber = permNo,
                        Category = item.Category,
                        ItemType = item.ItemType,
                        Quantity = item.Quantity,
                        Detail = item.SerialOrDetail
                    });
                }
                await issuedPermitsRepo.AddAsync(perm);
            }
            else if (req.Mode == "multi")
            {
                var groupRef = $"TSR-2026-{rnd.Next(1000, 9999)}";
                int idx = 1;
                foreach (var p in approvedPersons)
                {
                    var permNo = $"{groupRef}-{idx:D2}";
                    idx++;
                    var perPersonNote = decision.PersonNotes?.TryGetValue(p.PersonId, out var pn) == true ? pn : null;

                    var perm = new IssuedPermit
                    {
                        PermitNumber = permNo,
                        Mode = "single",
                        Title = p.PersonName,
                        Subtitle = $"ضمن {groupRef}",
                        IdMasked = p.PersonSub ?? "—",
                        RequestingDept = req.RequestingDept ?? "—",
                        DepartmentId = req.DepartmentId,
                        BranchId = req.BranchId,
                        BranchName = branchName,
                        BuildingId = req.BuildingId,
                        BuildingName = req.BuildingName ?? "—",
                        PathName = !string.IsNullOrEmpty(p.CustomPath) ? p.CustomPath : req.DefaultPath,
                        VisitDate = !string.IsNullOrEmpty(p.DateFrom) ? p.DateFrom : req.VisitDate,
                        ExpiryDate = !string.IsNullOrEmpty(p.DateTo) ? p.DateTo : req.ExpiryDate,
                        TimeFrom = p.TimeFrom,
                        TimeTo = p.TimeTo,
                        WorkingDays = p.CustomDays,
                        SubmitterId = req.SubmitterId,
                        Notes = req.RequesterNotes,
                        GuardNotes = req.GuardNotes,
                        ApprovedBy = currentUserName,
                        ApprovalNote = decision.Note,
                        ApproverNote = perPersonNote,
                        Status = "active",
                        GroupRef = groupRef,
                        CardNumber = $"CRD-{rnd.Next(20260000, 20269999)}"
                    };
                    perm.Persons.Add(new IssuedPermitPerson { PermitNumber = permNo, PersonId = p.PersonId });

                    // Devices
                    var devList = !string.IsNullOrEmpty(p.CustomDevices)
                        ? p.CustomDevices.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        : req.Devices.Select(d => d.DeviceName).ToArray();
                    foreach (var d in devList)
                    {
                        perm.Devices.Add(new IssuedPermitDevice { PermitNumber = permNo, DeviceName = d });
                    }

                    await issuedPermitsRepo.AddAsync(perm);
                }
            }
            else // Single
            {
                var permNo = $"TSR-2026-{rnd.Next(1000, 9999)}";
                var p = approvedPersons.FirstOrDefault();
                var perm = new IssuedPermit
                {
                    PermitNumber = permNo,
                    Mode = "single",
                    Title = req.Title,
                    Subtitle = req.Subtitle,
                    IdMasked = p?.PersonSub ?? req.Subtitle ?? "—",
                    RequestingDept = req.RequestingDept ?? "—",
                    DepartmentId = req.DepartmentId,
                    BranchId = req.BranchId,
                    BranchName = branchName,
                    BuildingId = req.BuildingId,
                    BuildingName = req.BuildingName ?? "—",
                    PathName = req.DefaultPath,
                    VisitDate = req.VisitDate,
                    ExpiryDate = req.ExpiryDate,
                    SubmitterId = req.SubmitterId,
                    Notes = req.RequesterNotes,
                    GuardNotes = req.GuardNotes,
                    ApprovedBy = currentUserName,
                    ApprovalNote = decision.Note,
                    Status = "active",
                    CardNumber = $"CRD-{rnd.Next(20260000, 20269999)}"
                };
                if (p != null)
                {
                    perm.Persons.Add(new IssuedPermitPerson { PermitNumber = permNo, PersonId = p.PersonId });
                }
                foreach (var d in req.Devices)
                {
                    perm.Devices.Add(new IssuedPermitDevice { PermitNumber = permNo, DeviceName = d.DeviceName });
                }
                await issuedPermitsRepo.AddAsync(perm);
            }

            // Handle renewal: If renewal, suspend the old permit
            if (req.IsRenewal && !string.IsNullOrEmpty(req.OriginalPermitNumber))
            {
                var oldPermit = await issuedPermitsRepo.GetByIdAsync(req.OriginalPermitNumber);
                if (oldPermit != null)
                {
                    oldPermit.Status = "suspended";
                    oldPermit.SuspendReason = "تم التمديد بإصدار تصريح جديد";
                }
            }

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = "approve",
                Message = $"اعتماد طلب تصريح: {req.Title}",
                Details = decision.Note,
                UserName = currentUserName
            });

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تم اعتماد الطلب وإصدار التصاريح بنجاح");
        }

        public async Task<ApiResponse<List<IssuedPermit>>> GetIssuedPermitsAsync(string? branchId = null, string? mode = null, string? status = null, string? search = null, string? currentUserId = null, string? role = null)
        {
            var query = _unitOfWork.Repository<IssuedPermit>()
                .Query()
                .Include(p => p.Persons)
                .Include(p => p.Devices)
                .Include(p => p.ExitItems)
                .AsQueryable();

            if (!string.IsNullOrEmpty(branchId))
                query = query.Where(p => p.BranchId == branchId);

            if (!string.IsNullOrEmpty(mode) && mode != "all")
                query = query.Where(p => p.Mode == mode);

            if (role == "requester" && !string.IsNullOrEmpty(currentUserId))
                query = query.Where(p => p.SubmitterId == currentUserId);

            var todayStr = DateTime.UtcNow.ToString("yyyy-MM-dd");

            if (!string.IsNullOrEmpty(status) && status != "all")
            {
                if (status == "active")
                    query = query.Where(p => p.Status == "active" && string.Compare(p.ExpiryDate, todayStr) >= 0);
                else if (status == "expired")
                    query = query.Where(p => p.Status == "expired" || (p.Status == "active" && string.Compare(p.ExpiryDate, todayStr) < 0));
                else if (status == "suspended")
                    query = query.Where(p => p.Status == "suspended");
            }

            if (!string.IsNullOrEmpty(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(p => p.PermitNumber.ToLower().Contains(s) || p.Title.ToLower().Contains(s) || (p.Subtitle != null && p.Subtitle.ToLower().Contains(s)) || p.IdMasked.Contains(s));
            }

            var list = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
            return ApiResponse<List<IssuedPermit>>.Ok(list);
        }

        public async Task<ApiResponse<IssuedPermit>> GetIssuedPermitByNumberAsync(string permitNumber)
        {
            var perm = await _unitOfWork.Repository<IssuedPermit>()
                .Query()
                .Include(p => p.Persons)
                .Include(p => p.Devices)
                .Include(p => p.ExitItems)
                .FirstOrDefaultAsync(p => p.PermitNumber == permitNumber);

            if (perm == null) return ApiResponse<IssuedPermit>.Fail("التصريح غير موجود");
            return ApiResponse<IssuedPermit>.Ok(perm);
        }

        public async Task<ApiResponse<bool>> SuspendPermitAsync(string permitNumber, string reason, string currentUserId, string currentUserName)
        {
            var perm = await _unitOfWork.Repository<IssuedPermit>().GetByIdAsync(permitNumber);
            if (perm == null) return ApiResponse<bool>.Fail("التصريح غير موجود");

            perm.Status = "suspended";
            perm.SuspendReason = reason;
            perm.UpdatedAt = DateTime.UtcNow;
            perm.UpdatedBy = currentUserName;

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = "edit",
                Message = $"تعطيل تصريح: {perm.PermitNumber}",
                Details = $"السبب: {reason}",
                UserName = currentUserName
            });

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تم تعطيل التصريح بنجاح");
        }

        public async Task<ApiResponse<bool>> ResumePermitAsync(string permitNumber, string currentUserId, string currentUserName)
        {
            var perm = await _unitOfWork.Repository<IssuedPermit>().GetByIdAsync(permitNumber);
            if (perm == null) return ApiResponse<bool>.Fail("التصريح غير موجود");

            perm.Status = "active";
            perm.SuspendReason = null;
            perm.UpdatedAt = DateTime.UtcNow;
            perm.UpdatedBy = currentUserName;

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = "edit",
                Message = $"إعادة تفعيل تصريح: {perm.PermitNumber}",
                UserName = currentUserName
            });

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تم إعادة تفعيل التصريح بنجاح");
        }
    }
}
