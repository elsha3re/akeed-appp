using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AccessPermits.Application.DTOs;
using AccessPermits.Application.Interfaces;
using AccessPermits.Core.Entities.Registry;
using AccessPermits.Core.Entities.Audit;
using AccessPermits.Core.Interfaces;

namespace AccessPermits.Application.Services
{
    public class RegistryService : IRegistryService
    {
        private readonly IUnitOfWork _unitOfWork;

        public RegistryService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<List<PersonDto>>> GetPersonsAsync(string? branchId = null, string? search = null, string? currentUserId = null, string? userRole = null)
        {
            var query = _unitOfWork.Repository<Person>()
                .Query()
                .Include(p => p.Attachments)
                .AsQueryable();

            if (!string.IsNullOrEmpty(branchId))
                query = query.Where(p => p.BranchId == branchId);

            if (userRole == "requester" && !string.IsNullOrEmpty(currentUserId))
                query = query.Where(p => p.AddedByUserId == currentUserId);

            if (!string.IsNullOrEmpty(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(s) || p.IdNumber.Contains(s) || (p.Entity != null && p.Entity.ToLower().Contains(s)));
            }

            var persons = await query.ToListAsync();
            var dtos = persons.Select(MapPersonToDto).ToList();
            return ApiResponse<List<PersonDto>>.Ok(dtos);
        }

        public async Task<ApiResponse<PersonDto>> GetPersonByIdAsync(string id)
        {
            var person = await _unitOfWork.Repository<Person>()
                .Query()
                .Include(p => p.Attachments)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (person == null) return ApiResponse<PersonDto>.Fail("الشخص غير موجود");

            return ApiResponse<PersonDto>.Ok(MapPersonToDto(person));
        }

        public async Task<ApiResponse<PersonDto>> SavePersonAsync(PersonDto dto, string currentUserId)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.IdNumber) || string.IsNullOrEmpty(dto.BranchId))
                return ApiResponse<PersonDto>.Fail("يرجى إكمال بيانات الشخص المطلوبة (الاسم ورقم الهوية والفرع)");

            // Check blacklist
            var isBlacklisted = await _unitOfWork.Repository<BlacklistEntry>()
                .AnyAsync(b => b.BranchId == dto.BranchId && b.IdNumber == dto.IdNumber);
            if (isBlacklisted)
                return ApiResponse<PersonDto>.Fail("هذا الشخص مدرج في القائمة السوداء ولا يمكن تسجيله");

            // Check banned nationality
            var isBannedNat = await _unitOfWork.Repository<BannedNationality>()
                .AnyAsync(b => b.BranchId == dto.BranchId && b.Nationality == dto.Nationality);
            if (isBannedNat)
                return ApiResponse<PersonDto>.Fail("هذه الجنسية محظورة في هذا الفرع");

            var repo = _unitOfWork.Repository<Person>();
            bool isNew = string.IsNullOrEmpty(dto.Id);
            Person? person;

            var masked = dto.IdNumber.Length > 6
                ? dto.IdNumber[..4] + "••••" + dto.IdNumber[^2..]
                : dto.IdNumber;

            if (isNew)
            {
                if (await repo.AnyAsync(p => p.BranchId == dto.BranchId && p.IdNumber == dto.IdNumber))
                    return ApiResponse<PersonDto>.Fail("هذا الشخص مسجل مسبقاً بنفس رقم الهوية في هذا الفرع");

                person = new Person
                {
                    Id = "p-" + Guid.NewGuid().ToString("N")[..8],
                    BranchId = dto.BranchId,
                    Name = dto.Name,
                    IdNumber = dto.IdNumber,
                    MaskedId = masked,
                    Entity = dto.Entity,
                    PersonType = dto.PersonType,
                    IdType = dto.IdType,
                    Nationality = dto.Nationality,
                    AddedByUserId = currentUserId,
                    Status = string.IsNullOrEmpty(dto.Status) ? "active" : dto.Status,
                    WorkingHoursDays = dto.WorkingHoursDays,
                    WorkingHoursFrom = dto.WorkingHoursFrom,
                    WorkingHoursTo = dto.WorkingHoursTo,
                    CreatedBy = currentUserId
                };
                await repo.AddAsync(person);
            }
            else
            {
                person = await repo.Query().Include(p => p.Attachments).FirstOrDefaultAsync(p => p.Id == dto.Id);
                if (person == null) return ApiResponse<PersonDto>.Fail("الشخص غير موجود");

                person.Name = dto.Name;
                person.IdNumber = dto.IdNumber;
                person.MaskedId = masked;
                person.Entity = dto.Entity;
                person.PersonType = dto.PersonType;
                person.IdType = dto.IdType;
                person.Nationality = dto.Nationality;
                person.Status = dto.Status;
                person.WorkingHoursDays = dto.WorkingHoursDays;
                person.WorkingHoursFrom = dto.WorkingHoursFrom;
                person.WorkingHoursTo = dto.WorkingHoursTo;
                person.UpdatedAt = DateTime.UtcNow;
                person.UpdatedBy = currentUserId;

                person.Attachments.Clear();
            }

            // Save attachments
            if (!string.IsNullOrEmpty(dto.PersonalPhotoBase64))
            {
                person.Attachments.Add(new PersonAttachment
                {
                    PersonId = person.Id,
                    AttachmentType = "personal",
                    FileName = "personal_photo.jpg",
                    Base64Data = dto.PersonalPhotoBase64
                });
            }

            if (!string.IsNullOrEmpty(dto.IdPhotoBase64))
            {
                person.Attachments.Add(new PersonAttachment
                {
                    PersonId = person.Id,
                    AttachmentType = "idPhoto",
                    FileName = "id_card.jpg",
                    Base64Data = dto.IdPhotoBase64
                });
            }

            if (dto.OtherAttachments != null)
            {
                foreach (var a in dto.OtherAttachments)
                {
                    if (!string.IsNullOrEmpty(a.Data))
                    {
                        person.Attachments.Add(new PersonAttachment
                        {
                            PersonId = person.Id,
                            AttachmentType = "other",
                            FileName = a.Name ?? "attachment",
                            FileSize = a.Size,
                            ContentType = a.Type ?? "application/octet-stream",
                            Base64Data = a.Data
                        });
                    }
                }
            }

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = isNew ? "add" : "edit",
                Message = (isNew ? "إضافة" : "تعديل") + " شخص: " + person.Name,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<PersonDto>.Ok(MapPersonToDto(person), "تم حفظ بيانات الشخص بنجاح");
        }

        public async Task<ApiResponse<bool>> DeletePersonAsync(string id, string currentUserId)
        {
            var person = await _unitOfWork.Repository<Person>().GetByIdAsync(id);
            if (person == null) return ApiResponse<bool>.Fail("الشخص غير موجود");

            _unitOfWork.Repository<Person>().Remove(person);

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = "del",
                Message = "حذف شخص: " + person.Name,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تم حذف الشخص بنجاح");
        }

        // Blacklist
        public async Task<ApiResponse<List<BlacklistDto>>> GetBlacklistAsync(string? branchId = null, string? search = null)
        {
            var query = _unitOfWork.Repository<BlacklistEntry>().Query().AsQueryable();

            if (!string.IsNullOrEmpty(branchId))
                query = query.Where(b => b.BranchId == branchId);

            if (!string.IsNullOrEmpty(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(b => b.Name.ToLower().Contains(s) || b.IdNumber.Contains(s) || b.Reason.ToLower().Contains(s));
            }

            var list = await query.ToListAsync();
            var dtos = list.Select(b => new BlacklistDto
            {
                Id = b.Id,
                BranchId = b.BranchId,
                IdNumber = b.IdNumber,
                Name = b.Name,
                Nationality = b.Nationality,
                Reason = b.Reason,
                AddedByUserId = b.AddedByUserId
            }).ToList();

            return ApiResponse<List<BlacklistDto>>.Ok(dtos);
        }

        public async Task<ApiResponse<BlacklistDto>> AddBlacklistAsync(BlacklistDto dto, string currentUserId)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.IdNumber) || string.IsNullOrWhiteSpace(dto.Reason))
                return ApiResponse<BlacklistDto>.Fail("يرجى إكمال بيانات الحظر (الاسم، الهوية، والسبب)");

            var entry = new BlacklistEntry
            {
                Id = "bl-" + Guid.NewGuid().ToString("N")[..8],
                BranchId = dto.BranchId,
                IdNumber = dto.IdNumber.Trim(),
                Name = dto.Name.Trim(),
                Nationality = dto.Nationality,
                Reason = dto.Reason.Trim(),
                AddedByUserId = currentUserId
            };

            await _unitOfWork.Repository<BlacklistEntry>().AddAsync(entry);

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = "add",
                Message = "إضافة للقائمة السوداء: " + entry.Name,
                Details = "السبب: " + entry.Reason,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            dto.Id = entry.Id;
            return ApiResponse<BlacklistDto>.Ok(dto, "تمت إضافة الشخص للقائمة السوداء بنجاح");
        }

        public async Task<ApiResponse<bool>> RemoveBlacklistAsync(string id, string currentUserId)
        {
            var entry = await _unitOfWork.Repository<BlacklistEntry>().GetByIdAsync(id);
            if (entry == null) return ApiResponse<bool>.Fail("السجل غير موجود");

            _unitOfWork.Repository<BlacklistEntry>().Remove(entry);

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = "del",
                Message = "إزالة من القائمة السوداء: " + entry.Name,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تمت إزالة الشخص من القائمة السوداء");
        }

        // Banned Nationalities
        public async Task<ApiResponse<List<string>>> GetBannedNationalitiesAsync(string branchId)
        {
            var list = await _unitOfWork.Repository<BannedNationality>()
                .Query()
                .Where(b => b.BranchId == branchId)
                .Select(b => b.Nationality)
                .ToListAsync();

            return ApiResponse<List<string>>.Ok(list);
        }

        public async Task<ApiResponse<bool>> AddBannedNationalityAsync(string branchId, string nationality, string currentUserId)
        {
            if (string.IsNullOrWhiteSpace(nationality)) return ApiResponse<bool>.Fail("يرجى تحديد الجنسية");

            var exists = await _unitOfWork.Repository<BannedNationality>()
                .AnyAsync(b => b.BranchId == branchId && b.Nationality == nationality);
            if (exists) return ApiResponse<bool>.Fail("الجنسية مضافة مسبقاً لقائمة الحظر");

            await _unitOfWork.Repository<BannedNationality>().AddAsync(new BannedNationality
            {
                BranchId = branchId,
                Nationality = nationality
            });

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = "add",
                Message = "حظر جنسية في الفرع: " + nationality,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تم حظر الجنسية بنجاح");
        }

        public async Task<ApiResponse<bool>> RemoveBannedNationalityAsync(string branchId, string nationality, string currentUserId)
        {
            var item = await _unitOfWork.Repository<BannedNationality>()
                .Query()
                .FirstOrDefaultAsync(b => b.BranchId == branchId && b.Nationality == nationality);

            if (item == null) return ApiResponse<bool>.Fail("الجنسية غير موجودة في قائمة الحظر");

            _unitOfWork.Repository<BannedNationality>().Remove(item);

            await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
            {
                LogTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ActionType = "del",
                Message = "إلغاء حظر جنسية في الفرع: " + nationality,
                UserName = currentUserId
            });

            await _unitOfWork.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "تم إلغاء حظر الجنسية");
        }

        private static PersonDto MapPersonToDto(Person p)
        {
            var personalPhoto = p.Attachments.FirstOrDefault(a => a.AttachmentType == "personal")?.Base64Data;
            var idPhoto = p.Attachments.FirstOrDefault(a => a.AttachmentType == "idPhoto")?.Base64Data;
            var others = p.Attachments.Where(a => a.AttachmentType == "other").Select(a => new AttachmentDto
            {
                Name = a.FileName,
                Size = a.FileSize,
                Type = a.ContentType,
                Data = a.Base64Data
            }).ToList();

            return new PersonDto
            {
                Id = p.Id,
                BranchId = p.BranchId,
                Name = p.Name,
                IdNumber = p.IdNumber,
                MaskedId = p.MaskedId,
                Entity = p.Entity,
                PersonType = p.PersonType,
                IdType = p.IdType,
                Nationality = p.Nationality,
                AddedByUserId = p.AddedByUserId,
                Status = p.Status,
                WorkingHoursDays = p.WorkingHoursDays,
                WorkingHoursFrom = p.WorkingHoursFrom,
                WorkingHoursTo = p.WorkingHoursTo,
                PersonalPhotoBase64 = personalPhoto,
                IdPhotoBase64 = idPhoto,
                OtherAttachments = others
            };
        }
    }
}
