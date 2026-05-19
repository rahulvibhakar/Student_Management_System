using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagementSystem.Data;
using StudentManagementSystem.DTOs;
using StudentManagementSystem.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace StudentManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CoursesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CoursesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<CourseDTO>>>> GetCourses()
        {
            var courses = await _context.Courses
                .Select(c => new CourseDTO
                {
                    CourseId = c.CourseId,
                    CourseName = c.CourseName,
                    CourseCode = c.CourseCode,
                    Department = c.Department
                }).ToListAsync();

            return Ok(new ApiResponse<List<CourseDTO>> { Success = true, Data = courses });
        }

        [HttpPost("enroll")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<ApiResponse<EnrollmentResponseDTO>>> Enroll([FromBody] EnrollmentDTO enrollmentDTO)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return BadRequest(new ApiResponse<EnrollmentResponseDTO> { Success = false, Message = "Student profile not found" });

            // Check if already enrolled in this course
            var existingEnrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.StudentId == student.StudentId && e.CourseId == enrollmentDTO.CourseId);

            if (existingEnrollment != null)
                return BadRequest(new ApiResponse<EnrollmentResponseDTO> { Success = false, Message = "Already enrolled in this course" });

            var enrollment = new Enrollment
            {
                StudentId = student.StudentId,
                CourseId = enrollmentDTO.CourseId,
                EnrolledAt = DateTime.UtcNow
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            var course = await _context.Courses.FindAsync(enrollmentDTO.CourseId);

            var result = new EnrollmentResponseDTO
            {
                EnrollmentId = enrollment.EnrollmentId,
                StudentId = student.StudentId,
                StudentName = $"{student.FirstName} {student.LastName}",
                CourseId = course.CourseId,
                CourseName = course.CourseName,
                CourseCode = course.CourseCode,
                EnrolledAt = enrollment.EnrolledAt
            };

            return Ok(new ApiResponse<EnrollmentResponseDTO> { Success = true, Message = "Enrolled successfully", Data = result });
        }

        [HttpGet("my-enrollments")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<ApiResponse<List<EnrollmentResponseDTO>>>> GetMyEnrollments()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(new ApiResponse<List<EnrollmentResponseDTO>> { Success = false, Message = "Student not found" });

            var enrollments = await _context.Enrollments
                .Where(e => e.StudentId == student.StudentId)
                .Select(e => new EnrollmentResponseDTO
                {
                    EnrollmentId = e.EnrollmentId,
                    StudentId = e.StudentId,
                    StudentName = $"{e.Student.FirstName} {e.Student.LastName}",
                    CourseId = e.CourseId,
                    CourseName = e.Course.CourseName,
                    CourseCode = e.Course.CourseCode,
                    EnrolledAt = e.EnrolledAt
                }).ToListAsync();

            return Ok(new ApiResponse<List<EnrollmentResponseDTO>> { Success = true, Data = enrollments });
        }

        [HttpGet("all-enrollments")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<List<EnrollmentResponseDTO>>>> GetAllEnrollments()
        {
            var enrollments = await _context.Enrollments
                .Select(e => new EnrollmentResponseDTO
                {
                    EnrollmentId = e.EnrollmentId,
                    StudentId = e.StudentId,
                    StudentName = $"{e.Student.FirstName} {e.Student.LastName}",
                    CourseId = e.CourseId,
                    CourseName = e.Course.CourseName,
                    CourseCode = e.Course.CourseCode,
                    EnrolledAt = e.EnrolledAt
                }).ToListAsync();

            return Ok(new ApiResponse<List<EnrollmentResponseDTO>> { Success = true, Data = enrollments });
        }

        [HttpPut("enrollments/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<EnrollmentResponseDTO>>> UpdateEnrollment(int id, [FromBody] EnrollmentDTO enrollmentDTO)
        {
            var enrollment = await _context.Enrollments.FindAsync(id);
            if (enrollment == null)
                return NotFound(new ApiResponse<EnrollmentResponseDTO> { Success = false, Message = "Enrollment not found" });

            enrollment.CourseId = enrollmentDTO.CourseId;
            await _context.SaveChangesAsync();

            var updatedEnrollment = await _context.Enrollments
                .Where(e => e.EnrollmentId == id)
                .Select(e => new EnrollmentResponseDTO
                {
                    EnrollmentId = e.EnrollmentId,
                    StudentId = e.StudentId,
                    StudentName = $"{e.Student.FirstName} {e.Student.LastName}",
                    CourseId = e.CourseId,
                    CourseName = e.Course.CourseName,
                    CourseCode = e.Course.CourseCode,
                    EnrolledAt = e.EnrolledAt
                }).FirstOrDefaultAsync();

            return Ok(new ApiResponse<EnrollmentResponseDTO> { Success = true, Message = "Enrollment updated", Data = updatedEnrollment });
        }

        [HttpDelete("enrollments/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteEnrollment(int id)
        {
            var enrollment = await _context.Enrollments.FindAsync(id);
            if (enrollment == null)
                return NotFound(new ApiResponse<bool> { Success = false, Message = "Enrollment not found" });

            _context.Enrollments.Remove(enrollment);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<bool> { Success = true, Message = "Enrollment deleted", Data = true });
        }
    }
}
