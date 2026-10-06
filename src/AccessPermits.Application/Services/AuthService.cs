using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AccessPermits.Application.DTOs;
using AccessPermits.Application.Interfaces;
using AccessPermits.Core.Entities.Security;
using AccessPermits.Core.Entities.Audit;
using AccessPermits.Core.Interfaces;

namespace AccessPermits.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AuthService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<UserDto>> LoginAsync(LoginRequestDto request)
        {
            var user = await _unitOfWork.Repository<User>()
                .Query()
                .Include(u => u.Branches)
                .Include(u => u.Buildings)
                .Include(u => u.Gates)
                .Include(u => u.Permissions)
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null || user.PasswordHash != request.Password)
            {
                return ApiResponse<UserDto>.Fail("اسم المستخدم أو كلمة المرور غير صحيحة");
            }

            if (user.Status != "active")
            {
                return ApiResponse<UserDto>.Fail("الحساب موقوف، يرجى مراجعة المسؤول");
            }

            var dto = MapUserToDto(user);
            return ApiResponse<UserDto>.Ok(dto, "تم تسجيل الدخول بنجاح");
        }

        public async Task<ApiResponse<List<UserDto>>> GetUsersAsync(string? role = null, string? branchId = null, string? status = null, string? search = null)
        {
            var query = _unitOfWork.Repository<User>()
                .Query()
                .Include(u => u.Branches)
                .Include(u => u.Buildings)
                .Include(u => u.Gates)
                .Include(u => u.Permissions)
                .AsQueryable();

            if (!string.IsNullOrEmpty(role))
                query = query.Where(u => u.Role == role);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(u => u.Status == status);

            if (!string.IsNullOrEmpty(branchId))
                query = query.Where(u => u.Branches.Any(b => b.BranchId == branchId));

            if (!string.IsNullOrEmpty(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(u => u.Name.ToLower().Contains(s) || u.Username.ToLower().Contains(s) || (u.Email != null && u.Email.ToLower().Contains(s)));
            }

            var users = await query.ToListAsync();
            var dtos = users.Select(MapUserToDto).ToList();
            return ApiResponse<List<UserDto>>.Ok(dtos);
        }

        public async Task<ApiResponse<UserDto>> GetUserByIdAsync(string id)
        {
            var user = await _unitOfWork.Repository<User>()
                .Query()
                .Include(u => u.Branches)
                .Include(u => u.Buildings)
                .Include(u => u.Gates)
                .Include(u => u.Permissions)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return ApiResponse<UserDto>.Fail("المستخدم غير موجود");

            return ApiResponse<UserDto>.Ok(MapUserToDto(user));
        }

        public async Task<ApiResponse<UserDto>> SaveUserAsync(SaveUserDto dto, string currentUserId)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Username))
                return ApiResponse<UserDto>.Fail("يرجى إدخال الاسم واسم المستخدم");

            var usersRepo = _unitOfWork.Repository<User>();
            User? user;
            bool isNew = string.IsNullOrEmpty(dto.Id);

            if (isNew)
            {
                if (await usersRepo.AnyAsync(u => u.Username == dto.Username))
                    return ApiResponse<UserDto>.Fail("اسم المستخدم مستخدم بالفعل");

                if (string.IsNullOrEmpty(dto.Password) || dto.Password.Length < 6)
                    return ApiResponse<UserDto>.Fail("كلمة المرور يجب أن لا تقل عن 6 أحرف");

                user = new User
                {
                    Id = "u-" + Guid.NewGuid().ToString("N")[..8],
                    Name = dto.Name,
                    Username = dto.Username,
                    PasswordHash = dto.Password,
                    Email = dto.Email,
                    Phone = dto.Phone,
                    Role = dto.Role,
                    DepartmentId = dto.DepartmentId,
                    JobTitle = dto.JobTitle,
                    Status = dto.Status,
                    Avatar = GetInitials(dto.Name),
                    CreatedBy = currentUserId
                };

                await usersRepo.AddAsync(user);
            }
            else
            {
                user = await usersRepo.Query()
                    .Include(u => u.Branches)
                    .Include(u => u.Buildings)
                    .Include(u => u.Gates)
                    .Include(u => u.Permissions)
                    .FirstOrDefaultAsync(u => u.Id == dto.Id);

                if (user == null)
                    return ApiResponse<UserDto>.Fail("المستخدم غير موجود");

                if (await usersRepo.AnyAsync(u => u.Username == dto.Username && u.Id != dto.Id))
                    return ApiResponse<UserDto>.Fail("اسم المستخدم مستخدم بالفعل");

                user.Name = dto.Name;
                user.Username = dto.Username;
                if (!string.IsNullOrEmpty(dto.Password))
                    user.PasswordHash = dto.Password;
                user.Email = dto.Email;
                user.Phone = dto.Phone;
                user.Role = dto.Role;
                user.DepartmentId = dto.DepartmentId;
                user.JobTitle = dto.JobTitle;
                user.Status = dto.Status;
                user.Avatar = GetInitials(dto.Name);
                user.UpdatedAt = DateTime.UtcNow;
                user.UpdatedBy = currentUserId;

                // Clear associations to re-add
                user.Branches.Clear();
                user.Buildings.Clear();
                user.Gates.Clear();
                user.Permissions.Clear();
            }

            // Assign branch
            if (!string.IsNullOrEmpty(dto.BranchId))
            {
                user.Branches.Add(new UserBranch { UserId = user.Id, BranchId = dto.BranchId });
            }

            // Assign building
            if (!string.IsNullOrEmpty(dto.BuildingId))
            {
                user.Buildings.Add(new UserBuilding { UserId = user.Id, BuildingId = dto.BuildingId });
            }

            // Assign gates
            if (dto.Gates != null)
            {
                foreach (var g in dto.Gates)
                {
                    user.Gates.Add(new UserGate { UserId = user.Id, GateKey = g });
                }
            }

            // Assign permissions
            if (dto.Permissions != null)
            {
                foreach (var p in dto.Permissions)
                {
                    user.Permissions.Add(new UserPermission { UserId = user.Id, ScreenId = p });
                }
            }

            // Audit
            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = isNew ? "add" : "edit",
                Message = (isNew ? "إضافة" : "تعديل") + " مستخدم: " + user.Name,
                Details = "الدور: " + user.Role,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<UserDto>.Ok(MapUserToDto(user), "تم حفظ المستخدم بنجاح");
        }

        public async Task<ApiResponse<bool>> DeleteUserAsync(string id, string currentUserId)
        {
            if (id == currentUserId)
                return ApiResponse<bool>.Fail("لا يمكنك حذف حسابك الشخصي");

            var user = await _unitOfWork.Repository<User>().GetByIdAsync(id);
            if (user == null)
                return ApiResponse<bool>.Fail("المستخدم غير موجود");

            _unitOfWork.Repository<User>().Remove(user);

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = "del",
                Message = "حذف مستخدم: " + user.Name,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تم حذف المستخدم بنجاح");
        }

        private static UserDto MapUserToDto(User u)
        {
            return new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Username = u.Username,
                Email = u.Email,
                Phone = u.Phone,
                Role = u.Role,
                DepartmentId = u.DepartmentId,
                JobTitle = u.JobTitle,
                Status = u.Status,
                Avatar = u.Avatar,
                Branches = u.Branches.Select(b => b.BranchId).ToList(),
                Buildings = u.Buildings.Select(b => b.BuildingId).ToList(),
                Gates = u.Gates.Select(g => g.GateKey).ToList(),
                Permissions = u.Permissions.Select(p => p.ScreenId).ToList()
            };
        }

        private static string GetInitials(string name)
        {
            var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 0) return "؟";
            if (parts.Length == 1) return parts[0][..Math.Min(2, parts[0].Length)];
            return $"{parts[0][0]}{parts[1][0]}";
        }
    }
}
