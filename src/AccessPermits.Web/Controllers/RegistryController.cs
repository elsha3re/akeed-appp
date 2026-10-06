using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AccessPermits.Application.DTOs;
using AccessPermits.Application.Interfaces;

namespace AccessPermits.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegistryController : Controller
    {
        private readonly IRegistryService _registryService;

        public RegistryController(IRegistryService registryService)
        {
            _registryService = registryService;
        }

        // Persons
        [HttpGet("persons")]
        public async Task<IActionResult> GetPersons([FromQuery] string? branchId, [FromQuery] string? search, [FromQuery] string? currentUserId, [FromQuery] string? role)
        {
            var result = await _registryService.GetPersonsAsync(branchId, search, currentUserId, role);
            return Json(result);
        }

        [HttpGet("persons/{id}")]
        public async Task<IActionResult> GetPerson(string id)
        {
            var result = await _registryService.GetPersonByIdAsync(id);
            return Json(result);
        }

        [HttpPost("persons")]
        public async Task<IActionResult> SavePerson([FromBody] PersonDto dto)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "u4";
            var result = await _registryService.SavePersonAsync(dto, userId);
            return Json(result);
        }

        [HttpDelete("persons/{id}")]
        public async Task<IActionResult> DeletePerson(string id)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _registryService.DeletePersonAsync(id, userId);
            return Json(result);
        }

        // Blacklist
        [HttpGet("blacklist")]
        public async Task<IActionResult> GetBlacklist([FromQuery] string? branchId, [FromQuery] string? search)
        {
            var result = await _registryService.GetBlacklistAsync(branchId, search);
            return Json(result);
        }

        [HttpPost("blacklist")]
        public async Task<IActionResult> AddBlacklist([FromBody] BlacklistDto dto)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _registryService.AddBlacklistAsync(dto, userId);
            return Json(result);
        }

        [HttpDelete("blacklist/{id}")]
        public async Task<IActionResult> RemoveBlacklist(string id)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _registryService.RemoveBlacklistAsync(id, userId);
            return Json(result);
        }

        // Banned Nationalities
        [HttpGet("banned-nationalities")]
        public async Task<IActionResult> GetBannedNationalities([FromQuery] string branchId)
        {
            var result = await _registryService.GetBannedNationalitiesAsync(branchId);
            return Json(result);
        }

        [HttpPost("banned-nationalities")]
        public async Task<IActionResult> AddBannedNationality([FromBody] BannedNatModel model)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _registryService.AddBannedNationalityAsync(model.BranchId, model.Nationality, userId);
            return Json(result);
        }

        [HttpDelete("banned-nationalities")]
        public async Task<IActionResult> RemoveBannedNationality([FromQuery] string branchId, [FromQuery] string nationality)
        {
            var userId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _registryService.RemoveBannedNationalityAsync(branchId, nationality, userId);
            return Json(result);
        }
    }

    public class BannedNatModel
    {
        public string BranchId { get; set; } = string.Empty;
        public string Nationality { get; set; } = string.Empty;
    }
}
