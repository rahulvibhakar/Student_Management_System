using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagementSystem.DTOs;
using StudentManagementSystem.Services;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace StudentManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StudentsController : ControllerBase
    {
        private readonly IStudentService _studentService;

        public StudentsController(IStudentService studentService)
        {
            _studentService = studentService;
        }

        [HttpPost]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<ApiResponse<StudentResponseDTO>>> CreateStudent([FromBody] StudentDTO studentDTO)
        {
            if (!ModelState.IsValid)
            {
                var response = new ApiResponse<StudentResponseDTO> { Success = false, Message = "Validation failed" };
                foreach (var modelState in ModelState.Values)
                    foreach (var error in modelState.Errors)
                        response.Errors.Add(error.ErrorMessage);
                return BadRequest(response);
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _studentService.CreateStudentAsync(userId, studentDTO);
            return result.Success ? Created($"api/students/{result.Data.StudentId}", result) : BadRequest(result);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<List<StudentResponseDTO>>>> GetAllStudents()
        {
            var result = await _studentService.GetAllStudentsAsync();
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<StudentResponseDTO>>> GetStudentById(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new ApiResponse<StudentResponseDTO> { Success = false, Message = "Invalid token" });

            var studentResult = await _studentService.GetStudentByIdAsync(id);
            if (!studentResult.Success) return NotFound(studentResult);

            if (userRole != "Admin" && studentResult.Data.UserId != userId)
                return Forbid();

            return Ok(studentResult);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<StudentResponseDTO>>> UpdateStudent(int id, [FromBody] StudentDTO studentDTO)
        {
            if (!ModelState.IsValid)
            {
                var response = new ApiResponse<StudentResponseDTO> { Success = false, Message = "Validation failed" };
                foreach (var modelState in ModelState.Values)
                    foreach (var error in modelState.Errors)
                        response.Errors.Add(error.ErrorMessage);
                return BadRequest(response);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var getResult = await _studentService.GetStudentByIdAsync(id);
            if (!getResult.Success) return NotFound(getResult);
            if (userRole != "Admin" && getResult.Data.UserId != userId)
                return Forbid();

            var result = await _studentService.UpdateStudentAsync(id, studentDTO);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteStudent(int id)
        {
            var result = await _studentService.DeleteStudentAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("profile/me")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<ApiResponse<StudentResponseDTO>>> GetMyProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var result = await _studentService.GetMyProfileAsync(userId);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPut("profile/me")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateMyProfile([FromBody] StudentDTO studentDTO)
        {
            if (!ModelState.IsValid)
            {
                var response = new ApiResponse<bool> { Success = false, Message = "Validation failed" };
                foreach (var modelState in ModelState.Values)
                    foreach (var error in modelState.Errors)
                        response.Errors.Add(error.ErrorMessage);
                return BadRequest(response);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var result = await _studentService.UpdateMyProfileAsync(userId, studentDTO);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
