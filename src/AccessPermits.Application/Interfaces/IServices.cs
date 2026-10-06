using System.Collections.Generic;
using System.Threading.Tasks;
using AccessPermits.Application.DTOs;
using AccessPermits.Core.Entities.Permits;

namespace AccessPermits.Application.Interfaces
{
    public interface IAuthService
    {
        Task<ApiResponse<UserDto>> LoginAsync(LoginRequestDto request);
        Task<ApiResponse<List<UserDto>>> GetUsersAsync(string? role = null, string? branchId = null, string? status = null, string? search = null);
        Task<ApiResponse<UserDto>> GetUserByIdAsync(string id);
        Task<ApiResponse<UserDto>> SaveUserAsync(SaveUserDto dto, string currentUserId);
        Task<ApiResponse<bool>> DeleteUserAsync(string id, string currentUserId);
    }

    public interface IOrganizationService
    {
        Task<ApiResponse<List<BranchDto>>> GetBranchesAsync();
        Task<ApiResponse<BranchDto>> SaveBranchAsync(BranchDto dto, string currentUserId);
        Task<ApiResponse<bool>> DeleteBranchAsync(string id, string currentUserId);

        Task<ApiResponse<List<BuildingDto>>> GetBuildingsAsync(string? branchId = null);
        Task<ApiResponse<BuildingDto>> SaveBuildingAsync(BuildingDto dto, string currentUserId);
        Task<ApiResponse<bool>> DeleteBuildingAsync(string id, string currentUserId);

        Task<ApiResponse<List<GateDto>>> GetGatesAsync(string? branchId = null, string? buildingId = null);
        Task<ApiResponse<GateDto>> SaveGateAsync(GateDto dto, string currentUserId);
        Task<ApiResponse<bool>> DeleteGateAsync(string id, string currentUserId);
        Task<ApiResponse<bool>> DeleteGateDeviceAsync(string branchId, string gateId, string deviceId, string currentUserId);

        Task<ApiResponse<List<FacilityPathDto>>> GetPathsAsync(string? branchId = null, string? buildingId = null);
        Task<ApiResponse<FacilityPathDto>> SavePathAsync(FacilityPathDto dto, string currentUserId);
        Task<ApiResponse<bool>> DeletePathAsync(string id, string currentUserId);

        Task<ApiResponse<List<DepartmentDto>>> GetDepartmentsAsync(string? branchId = null);
        Task<ApiResponse<DepartmentDto>> SaveDepartmentAsync(DepartmentDto dto, string currentUserId);
        Task<ApiResponse<bool>> DeleteDepartmentAsync(string id, string currentUserId);
    }

    public interface IRegistryService
    {
        Task<ApiResponse<List<PersonDto>>> GetPersonsAsync(string? branchId = null, string? search = null, string? currentUserId = null, string? userRole = null);
        Task<ApiResponse<PersonDto>> GetPersonByIdAsync(string id);
        Task<ApiResponse<PersonDto>> SavePersonAsync(PersonDto dto, string currentUserId);
        Task<ApiResponse<bool>> DeletePersonAsync(string id, string currentUserId);

        Task<ApiResponse<List<BlacklistDto>>> GetBlacklistAsync(string? branchId = null, string? search = null);
        Task<ApiResponse<BlacklistDto>> AddBlacklistAsync(BlacklistDto dto, string currentUserId);
        Task<ApiResponse<bool>> RemoveBlacklistAsync(string id, string currentUserId);

        Task<ApiResponse<List<string>>> GetBannedNationalitiesAsync(string branchId);
        Task<ApiResponse<bool>> AddBannedNationalityAsync(string branchId, string nationality, string currentUserId);
        Task<ApiResponse<bool>> RemoveBannedNationalityAsync(string branchId, string nationality, string currentUserId);
    }

    public interface IPermitService
    {
        Task<ApiResponse<List<PermitRequest>>> GetPendingRequestsAsync(string? branchId = null, string? currentUserId = null, string? role = null);
        Task<ApiResponse<PermitRequest>> GetRequestByIdAsync(string id);
        Task<ApiResponse<string>> CreatePermitRequestAsync(CreatePermitRequestDto dto, string currentUserId, string currentUserName);
        Task<ApiResponse<bool>> ProcessApprovalDecisionAsync(ApprovalDecisionDto decision, string currentUserId, string currentUserName);

        Task<ApiResponse<List<IssuedPermit>>> GetIssuedPermitsAsync(string? branchId = null, string? mode = null, string? status = null, string? search = null, string? currentUserId = null, string? role = null);
        Task<ApiResponse<IssuedPermit>> GetIssuedPermitByNumberAsync(string permitNumber);
        Task<ApiResponse<bool>> SuspendPermitAsync(string permitNumber, string reason, string currentUserId, string currentUserName);
        Task<ApiResponse<bool>> ResumePermitAsync(string permitNumber, string currentUserId, string currentUserName);
    }

    public interface IGateService
    {
        Task<ApiResponse<GateQueryResultDto>> QueryGateAsync(GateQueryDto query, string currentUserId, string currentUserName);
        Task<ApiResponse<bool>> LogMovementAsync(string permitNumber, string direction, string gateName, string branchName, string officerName, string? notes = null);
        Task<ApiResponse<List<Core.Entities.GateOperations.QueryLog>>> GetQueryLogsAsync(string? search = null, string? filter = null);
    }

    public interface IDashboardService
    {
        Task<ApiResponse<DashboardStatsDto>> GetDashboardStatsAsync(string? branchId = null, string? currentUserId = null, string? role = null);
    }

    public interface ISystemConfigService
    {
        Task<ApiResponse<Dictionary<string, object>>> GetAllLookupsAsync();
        Task<ApiResponse<bool>> AddLookupItemAsync(string category, string value, string? parentValue = null, string? currentUserId = null);
        Task<ApiResponse<bool>> RemoveLookupItemAsync(string category, string value, string? currentUserId = null);
        Task<ApiResponse<Dictionary<string, string>>> GetSettingsAsync();
        Task<ApiResponse<bool>> SaveSettingAsync(string key, string value, string currentUserId);
        Task<ApiResponse<string>> ExportFullDatabaseJsonAsync();
        Task<ApiResponse<bool>> ImportFullDatabaseJsonAsync(string jsonContent, string currentUserId);
        Task<ApiResponse<bool>> ResetAllDataAsync(string currentUserId);
    }
}
