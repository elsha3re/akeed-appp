using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AccessPermits.Application.DTOs;
using AccessPermits.Application.Interfaces;

namespace AccessPermits.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SettingsController : Controller
    {
        private readonly ISystemConfigService _configService;

        public SettingsController(ISystemConfigService configService)
        {
            _configService = configService;
        }

        [HttpGet("lookups")]
        public async Task<IActionResult> GetLookups()
        {
            var result = await _configService.GetAllLookupsAsync();
            return Json(result);
        }

        [HttpPost("lookups")]
        public async Task<IActionResult> AddLookup([FromBody] AddLookupModel model)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _configService.AddLookupItemAsync(model.Category, model.Value, model.ParentValue, userId);
            return Json(result);
        }

        [HttpDelete("lookups")]
        public async Task<IActionResult> RemoveLookup([FromQuery] string category, [FromQuery] string value)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _configService.RemoveLookupItemAsync(category, value, userId);
            return Json(result);
        }

        [HttpGet("")]
        public async Task<IActionResult> GetSettings()
        {
            var result = await _configService.GetSettingsAsync();
            return Json(result);
        }

        [HttpPost("")]
        public async Task<IActionResult> SaveSetting([FromBody] SaveSettingModel model)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _configService.SaveSettingAsync(model.Key, model.Value, userId);
            return Json(result);
        }

        [HttpGet("export-backup")]
        public async Task<IActionResult> ExportBackup()
        {
            var result = await _configService.ExportFullDatabaseJsonAsync();
            if (!result.Success || result.Data == null)
                return BadRequest("Failed to export backup");

            var bytes = Encoding.UTF8.GetBytes(result.Data);
            return File(bytes, "application/json", $"permits-backup-{System.DateTime.UtcNow:yyyyMMdd-HHmmss}.json");
        }

        [HttpPost("import-backup")]
        public async Task<IActionResult> ImportBackup()
        {
            var file = Request.Form.Files.GetFile("file");
            if (file == null || file.Length == 0)
                return Json(ApiResponse<bool>.Fail("لم يتم تحديد ملف الاستيراد"));

            using var reader = new StreamReader(file.OpenReadStream(), Encoding.UTF8);
            var json = await reader.ReadToEndAsync();

            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _configService.ImportFullDatabaseJsonAsync(json, userId);
            return Json(result);
        }

        [HttpPost("reset")]
        public async Task<IActionResult> ResetAllData([FromBody] ResetConfirmModel model)
        {
            if (model.ConfirmText != "حذف الكل")
                return Json(ApiResponse<bool>.Fail("كلمة تأكيد الحذف غير صحيحة"));

            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _configService.ResetAllDataAsync(userId);
            return Json(result);
        }
    }

    public class AddLookupModel
    {
        public string Category { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string? ParentValue { get; set; }
    }

    public class SaveSettingModel
    {
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }

    public class ResetConfirmModel
    {
        public string ConfirmText { get; set; } = string.Empty;
    }
}
