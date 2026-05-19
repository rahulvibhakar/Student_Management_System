using Microsoft.EntityFrameworkCore;
using StudentManagementSystem.Data;
using StudentManagementSystem.DTOs;
using StudentManagementSystem.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StudentManagementSystem.Services
{
    public interface IStudentService
    {
        Task<ApiResponse<StudentResponseDTO>> CreateStudentAsync(int userId, StudentDTO studentDTO);
        Task<ApiResponse<StudentResponseDTO>> UpdateStudentAsync(int studentId, StudentDTO studentDTO);
        Task<ApiResponse<List<StudentResponseDTO>>> GetAllStudentsAsync();
        Task<ApiResponse<StudentResponseDTO>> GetStudentByIdAsync(int studentId);
        Task<ApiResponse<StudentResponseDTO>> GetMyProfileAsync(int userId);
        Task<ApiResponse<bool>> UpdateMyProfileAsync(int userId, StudentDTO studentDTO);
        Task<ApiResponse<bool>> DeleteStudentAsync(int studentId);
    }

    public class StudentService : IStudentService
    {
        private readonly ApplicationDbContext _context;

        public StudentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<StudentResponseDTO>> CreateStudentAsync(int userId, StudentDTO studentDTO)
        {
            var response = new ApiResponse<StudentResponseDTO>();
            try
            {
                var existingStudent = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
                if (existingStudent != null)
                {
                    response.Success = false;
                    response.Message = "Student profile already exists";
                    return response;
                }

                var student = new Student
                {
                    UserId = userId,
                    FirstName = studentDTO.FirstName,
                    LastName = studentDTO.LastName,
                    Address = studentDTO.Address,
                    PhoneNumber = studentDTO.PhoneNumber,
                    IsActive = studentDTO.IsActive,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Students.Add(student);
                await _context.SaveChangesAsync();

                var user = await _context.Users.FirstAsync(u => u.UserId == userId);
                var studentResponse = MapToResponseDTO(student, user);

                response.Success = true;
                response.Message = "Student created";
                response.Data = studentResponse;
                return response;
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Error creating student";
                response.Errors.Add(ex.Message);
                return response;
            }
        }

        public async Task<ApiResponse<StudentResponseDTO>> UpdateStudentAsync(int studentId, StudentDTO studentDTO)
        {
            var response = new ApiResponse<StudentResponseDTO>();
            try
            {
                var student = await _context.Students.Include(s => s.User).FirstOrDefaultAsync(s => s.StudentId == studentId);
                if (student == null)
                {
                    response.Success = false;
                    response.Message = "Student not found";
                    return response;
                }

                student.FirstName = studentDTO.FirstName;
                student.LastName = studentDTO.LastName;
                student.Address = studentDTO.Address;
                student.PhoneNumber = studentDTO.PhoneNumber;
                student.IsActive = studentDTO.IsActive;
                student.UpdatedAt = DateTime.UtcNow;

                _context.Students.Update(student);
                await _context.SaveChangesAsync();

                var studentResponse = MapToResponseDTO(student, student.User);
                response.Success = true;
                response.Message = "Student updated";
                response.Data = studentResponse;
                return response;
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Error updating student";
                response.Errors.Add(ex.Message);
                return response;
            }
        }

        public async Task<ApiResponse<List<StudentResponseDTO>>> GetAllStudentsAsync()
        {
            var response = new ApiResponse<List<StudentResponseDTO>>();
            try
            {
                var students = await _context.Students
                    .Include(s => s.User)
                    .OrderBy(s => s.CreatedAt)
                    .ToListAsync();

                var studentDTOs = students.Select(s => MapToResponseDTO(s, s.User)).ToList();
                response.Success = true;
                response.Message = $"Retrieved {studentDTOs.Count} students";
                response.Data = studentDTOs;
                return response;
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Error retrieving students";
                response.Errors.Add(ex.Message);
                return response;
            }
        }

        public async Task<ApiResponse<StudentResponseDTO>> GetStudentByIdAsync(int studentId)
        {
            var response = new ApiResponse<StudentResponseDTO>();
            try
            {
                var student = await _context.Students.Include(s => s.User).FirstOrDefaultAsync(s => s.StudentId == studentId);
                if (student == null)
                {
                    response.Success = false;
                    response.Message = "Student not found";
                    return response;
                }

                var studentResponse = MapToResponseDTO(student, student.User);
                response.Success = true;
                response.Data = studentResponse;
                return response;
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Error retrieving student";
                response.Errors.Add(ex.Message);
                return response;
            }
        }

        public async Task<ApiResponse<StudentResponseDTO>> GetMyProfileAsync(int userId)
        {
            var response = new ApiResponse<StudentResponseDTO>();
            try
            {
                var student = await _context.Students.Include(s => s.User).FirstOrDefaultAsync(s => s.UserId == userId);
                if (student == null)
                {
                    response.Success = false;
                    response.Message = "Profile not found";
                    return response;
                }

                var studentResponse = MapToResponseDTO(student, student.User);
                response.Success = true;
                response.Data = studentResponse;
                return response;
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Error retrieving profile";
                response.Errors.Add(ex.Message);
                return response;
            }
        }

        public async Task<ApiResponse<bool>> UpdateMyProfileAsync(int userId, StudentDTO studentDTO)
        {
            var response = new ApiResponse<bool>();
            try
            {
                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
                if (student == null)
                {
                    response.Success = false;
                    response.Message = "Profile not found";
                    return response;
                }

                student.FirstName = studentDTO.FirstName;
                student.LastName = studentDTO.LastName;
                student.Address = studentDTO.Address;
                student.PhoneNumber = studentDTO.PhoneNumber;
                student.UpdatedAt = DateTime.UtcNow;

                _context.Students.Update(student);
                await _context.SaveChangesAsync();

                response.Success = true;
                response.Message = "Profile updated";
                response.Data = true;
                return response;
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Error updating profile";
                response.Errors.Add(ex.Message);
                return response;
            }
        }

        public async Task<ApiResponse<bool>> DeleteStudentAsync(int studentId)
        {
            var response = new ApiResponse<bool>();
            try
            {
                var student = await _context.Students.FirstOrDefaultAsync(s => s.StudentId == studentId);
                if (student == null)
                {
                    response.Success = false;
                    response.Message = "Student not found";
                    return response;
                }

                _context.Students.Remove(student);
                await _context.SaveChangesAsync();

                response.Success = true;
                response.Message = "Student deleted";
                response.Data = true;
                return response;
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Error deleting student";
                response.Errors.Add(ex.Message);
                return response;
            }
        }

        private StudentResponseDTO MapToResponseDTO(Student student, User user)
        {
            return new StudentResponseDTO
            {
                StudentId = student.StudentId,
                UserId = student.UserId,
                Email = user.Email,
                FirstName = student.FirstName,
                LastName = student.LastName,
                Address = student.Address,
                PhoneNumber = student.PhoneNumber,
                IsActive = student.IsActive,
                CreatedAt = student.CreatedAt,
                UpdatedAt = student.UpdatedAt
            };
        }
    }
}
