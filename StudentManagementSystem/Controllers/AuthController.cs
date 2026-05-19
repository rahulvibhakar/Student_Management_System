using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagementSystem.DTOs;
using StudentManagementSystem.Services;
using System.Threading.Tasks;

namespace StudentManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<TokenDTO>>> Login([FromBody] LoginDTO loginDTO)
        {
            if (!ModelState.IsValid)
            {
                var response = new ApiResponse<TokenDTO> { Success = false, Message = "Validation failed" };
                foreach (var modelState in ModelState.Values)
                    foreach (var error in modelState.Errors)
                        response.Errors.Add(error.ErrorMessage);
                return BadRequest(response);
            }

            var result = await _authService.LoginAsync(loginDTO);
            return result.Success ? Ok(result) : Unauthorized(result);
        }

        [HttpPost("signup")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<TokenDTO>>> Signup([FromBody] SignupDTO signupDTO)
        {
            if (!ModelState.IsValid)
            {
                var response = new ApiResponse<TokenDTO> { Success = false, Message = "Validation failed" };
                foreach (var modelState in ModelState.Values)
                    foreach (var error in modelState.Errors)
                        response.Errors.Add(error.ErrorMessage);
                return BadRequest(response);
            }

            var result = await _authService.SignupAsync(signupDTO);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
