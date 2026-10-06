using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AccessPermits.Application.DTOs;
using AccessPermits.Application.Interfaces;

namespace AccessPermits.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrganizationController : Controller
    {
        private readonly IOrganizationService _orgService;

        public OrganizationController(IOrganizationService orgService)
        {
            _orgService = orgService;
        }

        // Branches
        [HttpGet("branches")]
        public async Task<IActionResult> GetBranches()
        {
            var result = await _orgService.GetBranchesAsync();
            return Json(result);
        }

        [HttpPost("branches")]
        public async Task<IActionResult> SaveBranch([FromBody] BranchDto dto)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _orgService.SaveBranchAsync(dto, userId);
            return Json(result);
        }

        [HttpDelete("branches/{id}")]
        public async Task<IActionResult> DeleteBranch(string id)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _orgService.DeleteBranchAsync(id, userId);
            return Json(result);
        }

        // Buildings
        [HttpGet("buildings")]
        public async Task<IActionResult> GetBuildings([FromQuery] string? branchId)
        {
            var result = await _orgService.GetBuildingsAsync(branchId);
            return Json(result);
        }

        [HttpPost("buildings")]
        public async Task<IActionResult> SaveBuilding([FromBody] BuildingDto dto)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _orgService.SaveBuildingAsync(dto, userId);
            return Json(result);
        }

        [HttpDelete("buildings/{id}")]
        public async Task<IActionResult> DeleteBuilding(string id)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _orgService.DeleteBuildingAsync(id, userId);
            return Json(result);
        }

        // Gates
        [HttpGet("gates")]
        public async Task<IActionResult> GetGates([FromQuery] string? branchId, [FromQuery] string? buildingId)
        {
            var result = await _orgService.GetGatesAsync(branchId, buildingId);
            return Json(result);
        }

        [HttpPost("gates")]
        public async Task<IActionResult> SaveGate([FromBody] GateDto dto)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _orgService.SaveGateAsync(dto, userId);
            return Json(result);
        }

        [HttpDelete("gates/{id}")]
        public async Task<IActionResult> DeleteGate(string id)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _orgService.DeleteGateAsync(id, userId);
            return Json(result);
        }

        [HttpDelete("branches/{branchId}/gates/{gateId}/devices/{deviceId}")]
        public async Task<IActionResult> DeleteGateDevice(string branchId, string gateId, string deviceId)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _orgService.DeleteGateDeviceAsync(branchId, gateId, deviceId, userId);
            return Json(result);
        }

        // Paths
        [HttpGet("paths")]
        public async Task<IActionResult> GetPaths([FromQuery] string? branchId, [FromQuery] string? buildingId)
        {
            var result = await _orgService.GetPathsAsync(branchId, buildingId);
            return Json(result);
        }

        [HttpPost("paths")]
        public async Task<IActionResult> SavePath([FromBody] FacilityPathDto dto)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _orgService.SavePathAsync(dto, userId);
            return Json(result);
        }

        [HttpDelete("paths/{id}")]
        public async Task<IActionResult> DeletePath(string id)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _orgService.DeletePathAsync(id, userId);
            return Json(result);
        }

        // Departments
        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments([FromQuery] string? branchId)
        {
            var result = await _orgService.GetDepartmentsAsync(branchId);
            return Json(result);
        }

        [HttpPost("departments")]
        public async Task<IActionResult> SaveDepartment([FromBody] DepartmentDto dto)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _orgService.SaveDepartmentAsync(dto, userId);
            return Json(result);
        }

        [HttpDelete("departments/{id}")]
        public async Task<IActionResult> DeleteDepartment(string id)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _orgService.DeleteDepartmentAsync(id, userId);
            return Json(result);
        }
    }
}
