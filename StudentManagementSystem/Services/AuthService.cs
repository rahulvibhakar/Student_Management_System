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
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITokenService _tokenService;

        public AuthService(ApplicationDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        public async Task<ApiResponse<TokenDTO>> LoginAsync(LoginDTO loginDTO)
        {
            var response = new ApiResponse<TokenDTO>();

            try
            {
                if (string.IsNullOrWhiteSpace(loginDTO.Email) || string.IsNullOrWhiteSpace(loginDTO.Password))
                {
                    response.Success = false;
                    response.Message = "Email and Password are required";
                    response.Errors.Add("Please fill all required fields");
                    return response;
                }

                var user = await _context.Users
                    .Include(u => u.Student)
                    .FirstOrDefaultAsync(u => u.Email == loginDTO.Email);

                if (user == null)
                {
                    response.Success = false;
                    response.Message = "Invalid email or password";
                    return response;
                }

                var userRole = user.Role.ToString();
                if (!userRole.Equals(loginDTO.Role, StringComparison.OrdinalIgnoreCase))
                {
                    response.Success = false;
                    response.Message = "Invalid role";
                    return response;
                }

                if (!BCrypt.Net.BCrypt.Verify(loginDTO.Password, user.PasswordHash))
                {
                    response.Success = false;
                    response.Message = "Invalid email or password";
                    return response;
                }

                var token = _tokenService.GenerateToken(user);

                var userInfo = new UserInfoDTO
                {
                    UserId = user.UserId,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    Student = user.Student != null ? new StudentResponseDTO
                    {
                        StudentId = user.Student.StudentId,
                        UserId = user.Student.UserId,
                        Email = user.Email,
                        FirstName = user.Student.FirstName,
                        LastName = user.Student.LastName,
                        Address = user.Student.Address,
                        PhoneNumber = user.Student.PhoneNumber,
                        IsActive = user.Student.IsActive,
                        CreatedAt = user.Student.CreatedAt,
                        UpdatedAt = user.Student.UpdatedAt
                    } : null
                };

                response.Success = true;
                response.Message = "Login successful";
                response.Data = new TokenDTO
                {
                    AccessToken = token,
                    ExpiresIn = 86400,
                    User = userInfo
                };

                return response;
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Login error";
                response.Errors.Add(ex.Message);
                return response;
            }
        }

        public async Task<ApiResponse<TokenDTO>> SignupAsync(SignupDTO signupDTO)
        {
            var response = new ApiResponse<TokenDTO>();

            try
            {
                var validationErrors = ValidateSignupInput(signupDTO);
                if (validationErrors.Count > 0)
                {
                    response.Success = false;
                    response.Message = "Validation failed";
                    response.Errors = validationErrors;
                    return response;
                }

                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == signupDTO.Email);

                if (existingUser != null)
                {
                    response.Success = false;
                    response.Message = "Email already registered";
                    return response;
                }

                var passwordHash = BCrypt.Net.BCrypt.HashPassword(signupDTO.Password);

                if (!Enum.TryParse<UserRole>(signupDTO.Role, true, out var role))
                {
                    response.Success = false;
                    response.Message = "Invalid role";
                    return response;
                }

                var newUser = new User
                {
                    Email = signupDTO.Email,
                    PasswordHash = passwordHash,
                    Role = role,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                if (role == UserRole.Student)
                {
                    var student = new Student
                    {
                        UserId = newUser.UserId,
                        FirstName = signupDTO.FirstName ?? "N/A",
                        LastName = signupDTO.LastName ?? "N/A",
                        Address = signupDTO.Address ?? "N/A",
                        PhoneNumber = signupDTO.PhoneNumber ?? "N/A",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Students.Add(student);
                    await _context.SaveChangesAsync();

                    newUser = await _context.Users
                        .Include(u => u.Student)
                        .FirstAsync(u => u.UserId == newUser.UserId);
                }

                var token = _tokenService.GenerateToken(newUser);

                var userInfo = new UserInfoDTO
                {
                    UserId = newUser.UserId,
                    Email = newUser.Email,
                    Role = newUser.Role.ToString(),
                    Student = newUser.Student != null ? new StudentResponseDTO
                    {
                        StudentId = newUser.Student.StudentId,
                        UserId = newUser.Student.UserId,
                        Email = newUser.Email,
                        FirstName = newUser.Student.FirstName,
                        LastName = newUser.Student.LastName,
                        Address = newUser.Student.Address,
                        PhoneNumber = newUser.Student.PhoneNumber,
                        IsActive = newUser.Student.IsActive,
                        CreatedAt = newUser.Student.CreatedAt,
                        UpdatedAt = newUser.Student.UpdatedAt
                    } : null
                };

                response.Success = true;
                response.Message = "Registration successful";
                response.Data = new TokenDTO
                {
                    AccessToken = token,
                    ExpiresIn = 86400,
                    User = userInfo
                };

                return response;
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Registration error";
                response.Errors.Add(ex.Message);
                return response;
            }
        }

        private List<string> ValidateSignupInput(SignupDTO signupDTO)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(signupDTO.Email))
                errors.Add("Email is required");
            else if (!signupDTO.Email.Contains("@"))
                errors.Add("Invalid email");

            if (string.IsNullOrWhiteSpace(signupDTO.Password))
                errors.Add("Password is required");
            else if (signupDTO.Password.Length < 6)
                errors.Add("Password must be at least 6 characters");

            if (signupDTO.Password != signupDTO.ConfirmPassword)
                errors.Add("Passwords do not match");

            if (signupDTO.Role?.Equals("Student", StringComparison.OrdinalIgnoreCase) == true)
            {
                if (string.IsNullOrWhiteSpace(signupDTO.FirstName))
                    errors.Add("First Name is required");
                if (string.IsNullOrWhiteSpace(signupDTO.LastName))
                    errors.Add("Last Name is required");
                if (string.IsNullOrWhiteSpace(signupDTO.Address))
                    errors.Add("Address is required");
                if (string.IsNullOrWhiteSpace(signupDTO.PhoneNumber))
                    errors.Add("Phone Number is required");
                else if (!System.Text.RegularExpressions.Regex.IsMatch(signupDTO.PhoneNumber, @"^\d{10}$"))
                    errors.Add("Phone must be 10 digits");
            }

            return errors;
        }
    }
}
