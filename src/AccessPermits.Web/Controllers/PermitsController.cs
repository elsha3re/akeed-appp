using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AccessPermits.Application.DTOs;
using AccessPermits.Application.Interfaces;

namespace AccessPermits.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PermitsController : Controller
    {
        private readonly IPermitService _permitService;

        public PermitsController(IPermitService permitService)
        {
            _permitService = permitService;
        }

        [HttpGet("requests")]
        public async Task<IActionResult> GetPendingRequests([FromQuery] string? branchId, [FromQuery] string? currentUserId, [FromQuery] string? role)
        {
            var result = await _permitService.GetPendingRequestsAsync(branchId, currentUserId, role);
            return Json(result);
        }

        [HttpGet("requests/{id}")]
        public async Task<IActionResult> GetRequest(string id)
        {
            var result = await _permitService.GetRequestByIdAsync(id);
            return Json(result);
        }

        [HttpPost("requests")]
        public async Task<IActionResult> CreateRequest([FromBody] CreatePermitRequestDto dto)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "u4";
            var userName = HttpContext.Session.GetString("UserName") ?? "م. سعد الغامدي";
            var result = await _permitService.CreatePermitRequestAsync(dto, userId, userName);
            return Json(result);
        }

        [HttpPost("approvals")]
        public async Task<IActionResult> ProcessApproval([FromBody] ApprovalDecisionDto decision)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "u2";
            var userName = HttpContext.Session.GetString("UserName") ?? "لينا السبيعي";
            var result = await _permitService.ProcessApprovalDecisionAsync(decision, userId, userName);
            return Json(result);
        }

        [HttpGet("issued")]
        public async Task<IActionResult> GetIssuedPermits([FromQuery] string? branchId, [FromQuery] string? mode, [FromQuery] string? status, [FromQuery] string? search, [FromQuery] string? currentUserId, [FromQuery] string? role)
        {
            var result = await _permitService.GetIssuedPermitsAsync(branchId, mode, status, search, currentUserId, role);
            return Json(result);
        }

        [HttpGet("issued/{permitNumber}")]
        public async Task<IActionResult> GetIssuedPermit(string permitNumber)
        {
            var result = await _permitService.GetIssuedPermitByNumberAsync(permitNumber);
            return Json(result);
        }

        [HttpPost("issued/{permitNumber}/suspend")]
        public async Task<IActionResult> SuspendPermit(string permitNumber, [FromBody] SuspendRequestModel model)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var userName = HttpContext.Session.GetString("UserName") ?? "المسؤول";
            var result = await _permitService.SuspendPermitAsync(permitNumber, model.Reason ?? "تعطيل مؤقت", userId, userName);
            return Json(result);
        }

        [HttpPost("issued/{permitNumber}/resume")]
        public async Task<IActionResult> ResumePermit(string permitNumber)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var userName = HttpContext.Session.GetString("UserName") ?? "المسؤول";
            var result = await _permitService.ResumePermitAsync(permitNumber, userId, userName);
            return Json(result);
        }
    }

    public class SuspendRequestModel
    {
        public string? Reason { get; set; }
    }
}
