using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AccessPermits.Application.DTOs;
using AccessPermits.Application.Interfaces;

namespace AccessPermits.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GateController : Controller
    {
        private readonly IGateService _gateService;

        public GateController(IGateService gateService)
        {
            _gateService = gateService;
        }

        [HttpPost("query")]
        public async Task<IActionResult> Query([FromBody] GateQueryDto query)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "u3";
            var userName = HttpContext.Session.GetString("UserName") ?? "بدر القرني";
            var result = await _gateService.QueryGateAsync(query, userId, userName);
            return Json(result);
        }

        [HttpPost("movement")]
        public async Task<IActionResult> LogMovement([FromBody] MovementRequestModel model)
        {
            var officer = HttpContext.Session.GetString("UserName") ?? "حارس البوابة";
            var result = await _gateService.LogMovementAsync(model.PermitNumber, model.Direction, model.GateName, model.BranchName, officer, model.Notes);
            return Json(result);
        }

        [HttpGet("logs")]
        public async Task<IActionResult> GetLogs([FromQuery] string? search, [FromQuery] string? filter)
        {
            var result = await _gateService.GetQueryLogsAsync(search, filter);
            return Json(result);
        }
    }

    public class MovementRequestModel
    {
        public string PermitNumber { get; set; } = string.Empty;
        public string Direction { get; set; } = "Entry";
        public string GateName { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
}
