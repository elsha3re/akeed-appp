using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AccessPermits.Application.DTOs;
using AccessPermits.Application.Interfaces;

namespace AccessPermits.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : Controller
    {
        private readonly IPermitService _permitService;

        public ReportsController(IPermitService permitService)
        {
            _permitService = permitService;
        }

        [HttpGet("export-csv")]
        public async Task<IActionResult> ExportCsv([FromQuery] string? branchId, [FromQuery] string? mode, [FromQuery] string? status)
        {
            var permits = await _permitService.GetIssuedPermitsAsync(branchId, mode, status);
            var sb = new StringBuilder();
            sb.AppendLine("الرقم\tالاسم\tالنوع\tالفرع\tالمبنى\tالإدارة\tالمسار\tمن\tإلى\tالحالة");

            foreach (var p in permits.Data ?? new())
            {
                sb.AppendLine($"{p.PermitNumber}\t{p.Title}\t{p.Mode}\t{p.BranchName}\t{p.BuildingName}\t{p.RequestingDept}\t{p.PathName}\t{p.VisitDate}\t{p.ExpiryDate}\t{p.Status}");
            }

            var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
            return File(bytes, "text/csv;charset=utf-8", $"reports-{System.DateTime.UtcNow:yyyyMMdd}.csv");
        }
    }
}
