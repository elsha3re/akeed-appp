using Microsoft.AspNetCore.Mvc;
using AccessPermits.Application.Interfaces;
using System.Threading.Tasks;

namespace AccessPermits.Web.Controllers
{
    public class HomeController : Controller
    {
        private readonly IDashboardService _dashboardService;
        private readonly IOrganizationService _orgService;

        public HomeController(IDashboardService dashboardService, IOrganizationService orgService)
        {
            _dashboardService = dashboardService;
            _orgService = orgService;
        }

        public async Task<IActionResult> Index()
        {
            var branches = await _orgService.GetBranchesAsync();
            ViewBag.Branches = branches.Data;
            return View();
        }

        [HttpGet("api/dashboard/stats")]
        public async Task<IActionResult> GetStats([FromQuery] string? branchId, [FromQuery] string? currentUserId, [FromQuery] string? role)
        {
            var result = await _dashboardService.GetDashboardStatsAsync(branchId, currentUserId, role);
            return Json(result);
        }

        public IActionResult Privacy()
        {
            return View();
        }
    }
}
