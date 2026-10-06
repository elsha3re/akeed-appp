using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AccessPermits.Application.DTOs;
using AccessPermits.Application.Interfaces;

namespace AccessPermits.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : Controller
    {
        private readonly IAuthService _authService;

        public AccountController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var result = await _authService.LoginAsync(request);
            if (result.Success && result.Data != null)
            {
                HttpContext.Session.SetString("UserId", result.Data.Id);
                HttpContext.Session.SetString("UserName", result.Data.Name);
                HttpContext.Session.SetString("UserRole", result.Data.Role);
            }
            return Json(result);
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return Json(ApiResponse<bool>.Ok(true, "تم تسجيل الخروج بنجاح"));
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] string? role, [FromQuery] string? branchId, [FromQuery] string? status, [FromQuery] string? search)
        {
            var result = await _authService.GetUsersAsync(role, branchId, status, search);
            return Json(result);
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(string id)
        {
            var result = await _authService.GetUserByIdAsync(id);
            return Json(result);
        }

        [HttpPost("users")]
        public async Task<IActionResult> SaveUser([FromBody] SaveUserDto dto)
        {
            var currentUserId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _authService.SaveUserAsync(dto, currentUserId);
            return Json(result);
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var currentUserId = HttpContext.Session.GetString("UserId") ?? "system";
            var result = await _authService.DeleteUserAsync(id, currentUserId);
            return Json(result);
        }
    }
}
