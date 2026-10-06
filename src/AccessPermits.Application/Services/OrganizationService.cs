using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AccessPermits.Application.DTOs;
using AccessPermits.Application.Interfaces;
using AccessPermits.Core.Entities.Organization;
using AccessPermits.Core.Entities.Audit;
using AccessPermits.Core.Interfaces;

namespace AccessPermits.Application.Services
{
    public class OrganizationService : IOrganizationService
    {
        private readonly IUnitOfWork _unitOfWork;

        public OrganizationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // Branches
        public async Task<ApiResponse<List<BranchDto>>> GetBranchesAsync()
        {
            var branches = await _unitOfWork.Repository<Branch>()
                .Query()
                .Include(b => b.Buildings)
                .Include(b => b.Gates)
                .Include(b => b.Paths)
                .ToListAsync();

            var dtos = branches.Select(b => new BranchDto
            {
                Id = b.Id,
                Name = b.Name,
                Code = b.Code,
                City = b.City,
                Manager = b.Manager,
                Phone = b.Phone,
                Status = b.Status,
                WorkingHoursDays = b.WorkingHoursDays,
                WorkingHoursFrom = b.WorkingHoursFrom,
                WorkingHoursTo = b.WorkingHoursTo,
                BuildingsCount = b.Buildings.Count,
                GatesCount = b.Gates.Count,
                PathsCount = b.Paths.Count
            }).ToList();

            return ApiResponse<List<BranchDto>>.Ok(dtos);
        }

        public async Task<ApiResponse<BranchDto>> SaveBranchAsync(BranchDto dto, string currentUserId)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Code))
                return ApiResponse<BranchDto>.Fail("يرجى إدخال اسم الفرع والرمز");

            var repo = _unitOfWork.Repository<Branch>();
            bool isNew = string.IsNullOrEmpty(dto.Id);
            Branch? branch;

            if (isNew)
            {
                var id = "br-" + Guid.NewGuid().ToString("N")[..8];
                branch = new Branch
                {
                    Id = id,
                    Name = dto.Name,
                    Code = dto.Code,
                    City = dto.City,
                    Manager = dto.Manager,
                    Phone = dto.Phone,
                    Status = dto.Status,
                    WorkingHoursDays = dto.WorkingHoursDays,
                    WorkingHoursFrom = dto.WorkingHoursFrom,
                    WorkingHoursTo = dto.WorkingHoursTo,
                    CreatedBy = currentUserId
                };
                await repo.AddAsync(branch);
            }
            else
            {
                branch = await repo.GetByIdAsync(dto.Id);
                if (branch == null) return ApiResponse<BranchDto>.Fail("الفرع غير موجود");

                branch.Name = dto.Name;
                branch.Code = dto.Code;
                branch.City = dto.City;
                branch.Manager = dto.Manager;
                branch.Phone = dto.Phone;
                branch.Status = dto.Status;
                branch.WorkingHoursDays = dto.WorkingHoursDays;
                branch.WorkingHoursFrom = dto.WorkingHoursFrom;
                branch.WorkingHoursTo = dto.WorkingHoursTo;
                branch.UpdatedAt = DateTime.UtcNow;
                branch.UpdatedBy = currentUserId;
            }

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = isNew ? "add" : "edit",
                Message = (isNew ? "إضافة" : "تعديل") + " فرع: " + branch.Name,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            dto.Id = branch.Id;
            return ApiResponse<BranchDto>.Ok(dto, "تم حفظ الفرع بنجاح");
        }

        public async Task<ApiResponse<bool>> DeleteBranchAsync(string id, string currentUserId)
        {
            var branch = await _unitOfWork.Repository<Branch>().GetByIdAsync(id);
            if (branch == null) return ApiResponse<bool>.Fail("الفرع غير موجود");

            var totalBranches = await _unitOfWork.Repository<Branch>().CountAsync();
            if (totalBranches <= 1) return ApiResponse<bool>.Fail("لا يمكن حذف الفرع الوحيد في النظام");

            _unitOfWork.Repository<Branch>().Remove(branch);

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = "del",
                Message = "حذف فرع: " + branch.Name,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تم حذف الفرع بنجاح");
        }

        // Buildings
        public async Task<ApiResponse<List<BuildingDto>>> GetBuildingsAsync(string? branchId = null)
        {
            var query = _unitOfWork.Repository<Building>()
                .Query()
                .Include(b => b.Branch)
                .Include(b => b.Gates)
                .AsQueryable();

            if (!string.IsNullOrEmpty(branchId))
                query = query.Where(b => b.BranchId == branchId);

            var list = await query.ToListAsync();
            var dtos = list.Select(b => new BuildingDto
            {
                Id = b.Id,
                Name = b.Name,
                Code = b.Code,
                BranchId = b.BranchId,
                BranchName = b.Branch?.Name,
                Type = b.Type,
                Floors = b.Floors,
                Manager = b.Manager,
                Phone = b.Phone,
                Status = b.Status,
                GatesCount = b.Gates.Count
            }).ToList();

            return ApiResponse<List<BuildingDto>>.Ok(dtos);
        }

        public async Task<ApiResponse<BuildingDto>> SaveBuildingAsync(BuildingDto dto, string currentUserId)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Code) || string.IsNullOrEmpty(dto.BranchId))
                return ApiResponse<BuildingDto>.Fail("يرجى إكمال بيانات المبنى المطلوبة");

            var repo = _unitOfWork.Repository<Building>();
            bool isNew = string.IsNullOrEmpty(dto.Id);
            Building? bldg;

            if (isNew)
            {
                bldg = new Building
                {
                    Id = "bldg-" + Guid.NewGuid().ToString("N")[..8],
                    Name = dto.Name,
                    Code = dto.Code,
                    BranchId = dto.BranchId,
                    Type = dto.Type,
                    Floors = dto.Floors,
                    Manager = dto.Manager,
                    Phone = dto.Phone,
                    Status = dto.Status,
                    CreatedBy = currentUserId
                };
                await repo.AddAsync(bldg);
            }
            else
            {
                bldg = await repo.GetByIdAsync(dto.Id);
                if (bldg == null) return ApiResponse<BuildingDto>.Fail("المبنى غير موجود");

                bldg.Name = dto.Name;
                bldg.Code = dto.Code;
                bldg.BranchId = dto.BranchId;
                bldg.Type = dto.Type;
                bldg.Floors = dto.Floors;
                bldg.Manager = dto.Manager;
                bldg.Phone = dto.Phone;
                bldg.Status = dto.Status;
                bldg.UpdatedAt = DateTime.UtcNow;
                bldg.UpdatedBy = currentUserId;
            }

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = isNew ? "add" : "edit",
                Message = (isNew ? "إضافة" : "تعديل") + " مبنى: " + bldg.Name,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            dto.Id = bldg.Id;
            return ApiResponse<BuildingDto>.Ok(dto, "تم حفظ المبنى بنجاح");
        }

        public async Task<ApiResponse<bool>> DeleteBuildingAsync(string id, string currentUserId)
        {
            var bldg = await _unitOfWork.Repository<Building>().GetByIdAsync(id);
            if (bldg == null) return ApiResponse<bool>.Fail("المبنى غير موجود");

            _unitOfWork.Repository<Building>().Remove(bldg);

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = "del",
                Message = "حذف مبنى: " + bldg.Name,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تم حذف المبنى بنجاح");
        }

        // Gates
        public async Task<ApiResponse<List<GateDto>>> GetGatesAsync(string? branchId = null, string? buildingId = null)
        {
            var query = _unitOfWork.Repository<Gate>()
                .Query()
                .Include(g => g.Building)
                .Include(g => g.Devices)
                .AsQueryable();

            if (!string.IsNullOrEmpty(branchId))
                query = query.Where(g => g.BranchId == branchId);

            if (!string.IsNullOrEmpty(buildingId))
                query = query.Where(g => g.BuildingId == buildingId);

            var list = await query.ToListAsync();
            var dtos = list.Select(g => new GateDto
            {
                Id = g.Id,
                Name = g.Name,
                BranchId = g.BranchId,
                BuildingId = g.BuildingId,
                BuildingName = g.Building?.Name,
                Location = g.Location,
                Status = g.Status,
                Devices = g.Devices.Select(d => new GateDeviceDto
                {
                    Id = d.Id,
                    GateId = d.GateId,
                    Name = d.Name,
                    MacAddress = d.MacAddress,
                    LastSeen = d.LastSeen
                }).ToList()
            }).ToList();

            return ApiResponse<List<GateDto>>.Ok(dtos);
        }

        public async Task<ApiResponse<GateDto>> SaveGateAsync(GateDto dto, string currentUserId)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrEmpty(dto.BranchId) || string.IsNullOrEmpty(dto.BuildingId))
                return ApiResponse<GateDto>.Fail("يرجى إكمال بيانات البوابة المطلوبة");

            var gateRepo = _unitOfWork.Repository<Gate>();
            bool isNew = string.IsNullOrEmpty(dto.Id);
            Gate? gate;

            if (isNew)
            {
                gate = new Gate
                {
                    Id = "g-" + Guid.NewGuid().ToString("N")[..8],
                    Name = dto.Name,
                    BranchId = dto.BranchId,
                    BuildingId = dto.BuildingId,
                    Location = dto.Location,
                    Status = dto.Status,
                    CreatedBy = currentUserId
                };
                await gateRepo.AddAsync(gate);
            }
            else
            {
                gate = await gateRepo.Query().Include(g => g.Devices).FirstOrDefaultAsync(g => g.Id == dto.Id);
                if (gate == null) return ApiResponse<GateDto>.Fail("البوابة غير موجودة");

                gate.Name = dto.Name;
                gate.BranchId = dto.BranchId;
                gate.BuildingId = dto.BuildingId;
                gate.Location = dto.Location;
                gate.Status = dto.Status;
                gate.UpdatedAt = DateTime.UtcNow;
                gate.UpdatedBy = currentUserId;

                // Sync devices
                gate.Devices.Clear();
            }

            if (dto.Devices != null)
            {
                foreach (var d in dto.Devices)
                {
                    if (!string.IsNullOrWhiteSpace(d.MacAddress))
                    {
                        gate.Devices.Add(new GateDevice
                        {
                            Id = string.IsNullOrEmpty(d.Id) ? Guid.NewGuid().ToString() : d.Id,
                            GateId = gate.Id,
                            Name = d.Name,
                            MacAddress = d.MacAddress.Trim().ToUpper(),
                            LastSeen = d.LastSeen
                        });
                    }
                }
            }

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = isNew ? "add" : "edit",
                Message = (isNew ? "إضافة" : "تعديل") + " بوابة: " + gate.Name,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            dto.Id = gate.Id;
            return ApiResponse<GateDto>.Ok(dto, "تم حفظ البوابة بنجاح");
        }

        public async Task<ApiResponse<bool>> DeleteGateAsync(string id, string currentUserId)
        {
            var gate = await _unitOfWork.Repository<Gate>().GetByIdAsync(id);
            if (gate == null) return ApiResponse<bool>.Fail("البوابة غير موجودة");

            _unitOfWork.Repository<Gate>().Remove(gate);

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = "del",
                Message = "حذف بوابة: " + gate.Name,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تم حذف البوابة بنجاح");
        }

        public async Task<ApiResponse<bool>> DeleteGateDeviceAsync(string branchId, string gateId, string deviceId, string currentUserId)
        {
            var dev = await _unitOfWork.Repository<GateDevice>().GetByIdAsync(deviceId);
            if (dev == null) return ApiResponse<bool>.Fail("الجهاز غير موجود");

            _unitOfWork.Repository<GateDevice>().Remove(dev);

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = "del",
                Message = "حذف جهاز بوابة: " + dev.MacAddress,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تم حذف الجهاز بنجاح");
        }

        // Paths
        public async Task<ApiResponse<List<FacilityPathDto>>> GetPathsAsync(string? branchId = null, string? buildingId = null)
        {
            var query = _unitOfWork.Repository<FacilityPath>()
                .Query()
                .Include(p => p.Building)
                .Include(p => p.Gates)
                .AsQueryable();

            if (!string.IsNullOrEmpty(branchId))
                query = query.Where(p => p.BranchId == branchId);

            if (!string.IsNullOrEmpty(buildingId))
                query = query.Where(p => p.BuildingId == buildingId);

            var list = await query.ToListAsync();
            var dtos = list.Select(p => new FacilityPathDto
            {
                Id = p.Id,
                Name = p.Name,
                BranchId = p.BranchId,
                BuildingId = p.BuildingId,
                BuildingName = p.Building?.Name,
                Gates = p.Gates.Select(g => g.GateName).ToList()
            }).ToList();

            return ApiResponse<List<FacilityPathDto>>.Ok(dtos);
        }

        public async Task<ApiResponse<FacilityPathDto>> SavePathAsync(FacilityPathDto dto, string currentUserId)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrEmpty(dto.BranchId) || string.IsNullOrEmpty(dto.BuildingId))
                return ApiResponse<FacilityPathDto>.Fail("يرجى إكمال بيانات المسار المطلوبة");

            var repo = _unitOfWork.Repository<FacilityPath>();
            bool isNew = string.IsNullOrEmpty(dto.Id);
            FacilityPath? path;

            if (isNew)
            {
                path = new FacilityPath
                {
                    Id = "p-" + Guid.NewGuid().ToString("N")[..8],
                    Name = dto.Name,
                    BranchId = dto.BranchId,
                    BuildingId = dto.BuildingId,
                    CreatedBy = currentUserId
                };
                await repo.AddAsync(path);
            }
            else
            {
                path = await repo.Query().Include(p => p.Gates).FirstOrDefaultAsync(p => p.Id == dto.Id);
                if (path == null) return ApiResponse<FacilityPathDto>.Fail("المسار غير موجود");

                path.Name = dto.Name;
                path.BranchId = dto.BranchId;
                path.BuildingId = dto.BuildingId;
                path.UpdatedAt = DateTime.UtcNow;
                path.UpdatedBy = currentUserId;

                path.Gates.Clear();
            }

            if (dto.Gates != null)
            {
                foreach (var g in dto.Gates)
                {
                    path.Gates.Add(new FacilityPathGate { PathId = path.Id, GateName = g });
                }
            }

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = isNew ? "add" : "edit",
                Message = (isNew ? "إضافة" : "تعديل") + " مسار: " + path.Name,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            dto.Id = path.Id;
            return ApiResponse<FacilityPathDto>.Ok(dto, "تم حفظ المسار بنجاح");
        }

        public async Task<ApiResponse<bool>> DeletePathAsync(string id, string currentUserId)
        {
            var path = await _unitOfWork.Repository<FacilityPath>().GetByIdAsync(id);
            if (path == null) return ApiResponse<bool>.Fail("المسار غير موجود");

            _unitOfWork.Repository<FacilityPath>().Remove(path);

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = "del",
                Message = "حذف مسار: " + path.Name,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تم حذف المسار بنجاح");
        }

        // Departments
        public async Task<ApiResponse<List<DepartmentDto>>> GetDepartmentsAsync(string? branchId = null)
        {
            var query = _unitOfWork.Repository<Department>()
                .Query()
                .Include(d => d.Parent)
                .AsQueryable();

            if (!string.IsNullOrEmpty(branchId))
                query = query.Where(d => d.BranchId == branchId);

            var list = await query.ToListAsync();
            var dtos = list.Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                Code = d.Code,
                Level = d.Level,
                ParentId = d.ParentId,
                ParentName = d.Parent?.Name,
                BranchId = d.BranchId,
                Manager = d.Manager,
                Email = d.Email,
                Status = d.Status
            }).ToList();

            return ApiResponse<List<DepartmentDto>>.Ok(dtos);
        }

        public async Task<ApiResponse<DepartmentDto>> SaveDepartmentAsync(DepartmentDto dto, string currentUserId)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Code) || string.IsNullOrEmpty(dto.BranchId))
                return ApiResponse<DepartmentDto>.Fail("يرجى إكمال بيانات الإدارة المطلوبة");

            var repo = _unitOfWork.Repository<Department>();
            bool isNew = string.IsNullOrEmpty(dto.Id);
            Department? dept;

            if (isNew)
            {
                dept = new Department
                {
                    Id = "dep-" + Guid.NewGuid().ToString("N")[..8],
                    Name = dto.Name,
                    Code = dto.Code,
                    Level = dto.Level,
                    ParentId = dto.Level == 1 ? null : dto.ParentId,
                    BranchId = dto.BranchId,
                    Manager = dto.Manager,
                    Email = dto.Email,
                    Status = dto.Status,
                    CreatedBy = currentUserId
                };
                await repo.AddAsync(dept);
            }
            else
            {
                dept = await repo.GetByIdAsync(dto.Id);
                if (dept == null) return ApiResponse<DepartmentDto>.Fail("الإدارة غير موجودة");

                dept.Name = dto.Name;
                dept.Code = dto.Code;
                dept.Level = dto.Level;
                dept.ParentId = dto.Level == 1 ? null : dto.ParentId;
                dept.BranchId = dto.BranchId;
                dept.Manager = dto.Manager;
                dept.Email = dto.Email;
                dept.Status = dto.Status;
                dept.UpdatedAt = DateTime.UtcNow;
                dept.UpdatedBy = currentUserId;
            }

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = isNew ? "add" : "edit",
                Message = (isNew ? "إضافة" : "تعديل") + " إدارة: " + dept.Name,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            dto.Id = dept.Id;
            return ApiResponse<DepartmentDto>.Ok(dto, "تم حفظ الإدارة بنجاح");
        }

        public async Task<ApiResponse<bool>> DeleteDepartmentAsync(string id, string currentUserId)
        {
            var dept = await _unitOfWork.Repository<Department>().GetByIdAsync(id);
            if (dept == null) return ApiResponse<bool>.Fail("الإدارة غير موجودة");

            var hasSubs = await _unitOfWork.Repository<Department>().AnyAsync(d => d.ParentId == id);
            if (hasSubs) return ApiResponse<bool>.Fail("لا يمكن حذف إدارة تحتوي على إدارات أو أقسام فرعية");

            _unitOfWork.Repository<Department>().Remove(dept);

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = "del",
                Message = "حذف إدارة: " + dept.Name,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تم حذف الإدارة بنجاح");
        }
    }
}
