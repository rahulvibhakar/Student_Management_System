using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagementSystem.Data;
using StudentManagementSystem.DTOs;
using StudentManagementSystem.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StudentManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AttendanceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AttendanceController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<AttendanceResponseDTO>>>> GetAllAttendance()
        {
            var attendance = await _context.Attendance
                .Select(a => new AttendanceResponseDTO
                {
                    AttendanceId = a.AttendanceId,
                    StudentId = a.StudentId,
                    StudentName = $"{a.Student.FirstName} {a.Student.LastName}",
                    Date = a.Date,
                    IsPresent = a.IsPresent
                }).ToListAsync();

            return Ok(new ApiResponse<List<AttendanceResponseDTO>> { Success = true, Data = attendance });
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<AttendanceResponseDTO>>> AddAttendance([FromBody] AttendanceDTO attendanceDTO)
        {
            // Check if record already exists for this student and date
            var dateOnly = attendanceDTO.Date.Date;
            var existing = await _context.Attendance
                .FirstOrDefaultAsync(a => a.StudentId == attendanceDTO.StudentId && a.Date.Date == dateOnly);

            if (existing != null)
            {
                existing.IsPresent = attendanceDTO.IsPresent;
                await _context.SaveChangesAsync();
                return Ok(new ApiResponse<AttendanceResponseDTO> { Success = true, Message = "Attendance updated" });
            }

            var attendance = new Attendance
            {
                StudentId = attendanceDTO.StudentId,
                Date = attendanceDTO.Date,
                IsPresent = attendanceDTO.IsPresent
            };

            _context.Attendance.Add(attendance);
            await _context.SaveChangesAsync();

            var student = await _context.Students.FindAsync(attendanceDTO.StudentId);
            var result = new AttendanceResponseDTO
            {
                AttendanceId = attendance.AttendanceId,
                StudentId = student.StudentId,
                StudentName = $"{student.FirstName} {student.LastName}",
                Date = attendance.Date,
                IsPresent = attendance.IsPresent
            };

            return Ok(new ApiResponse<AttendanceResponseDTO> { Success = true, Message = "Attendance added", Data = result });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteAttendance(int id)
        {
            var attendance = await _context.Attendance.FindAsync(id);
            if (attendance == null)
                return NotFound(new ApiResponse<bool> { Success = false, Message = "Attendance record not found" });

            _context.Attendance.Remove(attendance);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<bool> { Success = true, Message = "Attendance record deleted", Data = true });
        }
    }
}
