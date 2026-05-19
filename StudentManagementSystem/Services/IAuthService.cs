using StudentManagementSystem.DTOs;
using System.Threading.Tasks;

namespace StudentManagementSystem.Services
{
    public interface IAuthService
    {
        Task<ApiResponse<TokenDTO>> LoginAsync(LoginDTO loginDTO);
        Task<ApiResponse<TokenDTO>> SignupAsync(SignupDTO signupDTO);
    }
}
