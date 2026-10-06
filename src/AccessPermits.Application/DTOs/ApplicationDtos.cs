using System;
using System.Collections.Generic;

namespace AccessPermits.Application.DTOs
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new();

        public static ApiResponse<T> Ok(T data, string message = "تمت العملية بنجاح") =>
            new() { Success = true, Data = data, Message = message };

        public static ApiResponse<T> Fail(string message, List<string>? errors = null) =>
            new() { Success = false, Message = message, Errors = errors ?? new List<string>() };
    }

    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 1;
    }

    // Auth DTOs
    public class LoginRequestDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string Role { get; set; } = string.Empty;
        public string? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public string? JobTitle { get; set; }
        public string Status { get; set; } = "active";
        public string? Avatar { get; set; }
        public List<string> Branches { get; set; } = new();
        public List<string> Buildings { get; set; } = new();
        public List<string> Gates { get; set; } = new();
        public List<string> Permissions { get; set; } = new();
    }

    public class SaveUserDto
    {
        public string? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? Password { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string Role { get; set; } = "requester";
        public string? BranchId { get; set; }
        public string? BuildingId { get; set; }
        public string? DepartmentId { get; set; }
        public string? JobTitle { get; set; }
        public string Status { get; set; } = "active";
        public List<string> Permissions { get; set; } = new();
        public List<string> Gates { get; set; } = new();
    }

    // Organization DTOs
    public class BranchDto
    {
        public string? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? City { get; set; }
        public string? Manager { get; set; }
        public string? Phone { get; set; }
        public string Status { get; set; } = "active";
        public string WorkingHoursDays { get; set; } = "sun,mon,tue,wed,thu";
        public string WorkingHoursFrom { get; set; } = "07:00";
        public string WorkingHoursTo { get; set; } = "17:00";
        public int BuildingsCount { get; set; }
        public int GatesCount { get; set; }
        public int PathsCount { get; set; }
        public int UsersCount { get; set; }
    }

    public class BuildingDto
    {
        public string? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string BranchId { get; set; } = string.Empty;
        public string? BranchName { get; set; }
        public string? Type { get; set; }
        public int Floors { get; set; } = 1;
        public string? Manager { get; set; }
        public string? Phone { get; set; }
        public string Status { get; set; } = "active";
        public int GatesCount { get; set; }
    }

    public class GateDto
    {
        public string? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string BranchId { get; set; } = string.Empty;
        public string BuildingId { get; set; } = string.Empty;
        public string? BuildingName { get; set; }
        public string? Location { get; set; }
        public string Status { get; set; } = "active";
        public List<GateDeviceDto> Devices { get; set; } = new();
    }

    public class GateDeviceDto
    {
        public string? Id { get; set; }
        public string? GateId { get; set; }
        public string? Name { get; set; }
        public string MacAddress { get; set; } = string.Empty;
        public long? LastSeen { get; set; }
    }

    public class FacilityPathDto
    {
        public string? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string BranchId { get; set; } = string.Empty;
        public string BuildingId { get; set; } = string.Empty;
        public string? BuildingName { get; set; }
        public List<string> Gates { get; set; } = new();
    }

    public class DepartmentDto
    {
        public string? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int Level { get; set; } = 1;
        public string? ParentId { get; set; }
        public string? ParentName { get; set; }
        public string BranchId { get; set; } = string.Empty;
        public string? Manager { get; set; }
        public string? Email { get; set; }
        public string Status { get; set; } = "active";
    }


    // Registry DTOs
    public class PersonDto
    {
        public string? Id { get; set; }
        public string BranchId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string IdNumber { get; set; } = string.Empty;
        public string? MaskedId { get; set; }
        public string? Entity { get; set; }
        public string PersonType { get; set; } = "مواطن";
        public string IdType { get; set; } = "هوية وطنية";
        public string Nationality { get; set; } = "سعودي";
        public string? AddedByUserId { get; set; }
        public string? AddedByName { get; set; }
        public string Status { get; set; } = "active";
        public string? WorkingHoursDays { get; set; }
        public string? WorkingHoursFrom { get; set; }
        public string? WorkingHoursTo { get; set; }
        public string? PersonalPhotoBase64 { get; set; }
        public string? IdPhotoBase64 { get; set; }
        public List<AttachmentDto> OtherAttachments { get; set; } = new();
    }

    public class AttachmentDto
    {
        public string? Name { get; set; }
        public long Size { get; set; }
        public string? Type { get; set; }
        public string? Data { get; set; }
    }

    public class BlacklistDto
    {
        public string? Id { get; set; }
        public string BranchId { get; set; } = string.Empty;
        public string IdNumber { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Nationality { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? AddedByUserId { get; set; }
    }

    // Permits DTOs
    public class CreatePermitRequestDto
    {
        public string Mode { get; set; } = "single"; // single, multi, vehicle, exit
        public string? Title { get; set; }
        public string? Subtitle { get; set; }
        public string? RequestingDept { get; set; }
        public string? DepartmentId { get; set; }
        public string BranchId { get; set; } = string.Empty;
        public string BuildingId { get; set; } = string.Empty;
        public string DefaultPath { get; set; } = string.Empty;
        public string VisitDate { get; set; } = string.Empty;
        public string ExpiryDate { get; set; } = string.Empty;
        public string? RequesterNotes { get; set; }
        public string? GuardNotes { get; set; }

        public List<string> PersonIds { get; set; } = new();
        public Dictionary<string, PerPersonConfigDto> PerPerson { get; set; } = new();
        public List<string> Devices { get; set; } = new();
        public List<ExitItemDto> ExitItems { get; set; } = new();
        public List<AttachmentDto> Attachments { get; set; } = new();

        // Vehicle
        public string? PlateNums { get; set; }
        public string? PlateLetters { get; set; }
        public string? DriverId { get; set; }
        public string? VehicleMake { get; set; }
        public string? VehicleModel { get; set; }
        public string? VehicleYear { get; set; }
        public string? VehicleColor { get; set; }

        // Exit
        public string? RelatedEntryPermitNo { get; set; }

        // Renewal
        public bool IsRenewal { get; set; } = false;
        public string? OriginalPermitNumber { get; set; }
        public string? RenewGroupRef { get; set; }
    }

    public class PerPersonConfigDto
    {
        public string? Path { get; set; }
        public string? DateFrom { get; set; }
        public string? DateTo { get; set; }
        public string? TimeFrom { get; set; }
        public string? TimeTo { get; set; }
        public List<string>? Days { get; set; }
        public List<string>? Devices { get; set; }
    }

    public class ExitItemDto
    {
        public string Category { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Quantity { get; set; } = "1";
        public string? Detail { get; set; }
    }

    public class ApprovalDecisionDto
    {
        public string RequestId { get; set; } = string.Empty;
        public string Action { get; set; } = "approve"; // approve, reject
        public string? Note { get; set; }
        public List<string>? SelectedPersonIds { get; set; }
        public Dictionary<string, string>? PersonNotes { get; set; }
    }

    // Gate Query DTOs
    public class GateQueryDto
    {
        public string GateName { get; set; } = string.Empty;
        public string QueryValue { get; set; } = string.Empty; // 4 digits of ID, plate number, or scan
        public string Mode { get; set; } = "person"; // person, vehicle, exit
        public string BranchId { get; set; } = string.Empty;
    }

    public class GateQueryResultDto
    {
        public string Status { get; set; } = "notfound"; // active, exit, expired, suspended, upcoming, wronggate, blacklist, notfound, choose
        public string Title { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string? Photo { get; set; }
        public string? Nationality { get; set; }
        public string? PermitNumber { get; set; }
        public string? Notes { get; set; }
        public string? GuardNotes { get; set; }
        public List<string> Devices { get; set; } = new();
        public List<ExitItemDto> Items { get; set; } = new();
        public List<Tuple<string, string>> Facts { get; set; } = new();
        public List<PersonDto> Choices { get; set; } = new();
        public bool IsVehicle { get; set; } = false;
        public string? ResultType { get; set; }
        public string? ResultLabel { get; set; }
        public string? WarningMessage { get; set; }
    }

    // Dashboard & Reports DTOs
    public class DashboardStatsDto
    {
        public int ActivePermits { get; set; }
        public int PendingRequests { get; set; }
        public int ExpiredPermits { get; set; }
        public int TotalQueries { get; set; }
        public int TotalBranches { get; set; }
        public int TotalBuildings { get; set; }
        public int TotalGates { get; set; }
        public int TotalPaths { get; set; }
        public int TotalDepartments { get; set; }

        public List<ChartBarDto> StatusChart { get; set; } = new();
        public List<ChartBarDto> BranchChart { get; set; } = new();
        public List<ChartBarDto> BuildingChart { get; set; } = new();
        public List<ChartBarDto> DepartmentChart { get; set; } = new();
    }

    public class ChartBarDto
    {
        public string Label { get; set; } = string.Empty;
        public int Value { get; set; }
        public int Percentage { get; set; }
        public string ColorClass { get; set; } = "green";
    }
}
