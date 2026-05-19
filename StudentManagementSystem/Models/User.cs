using System;
using System.ComponentModel.DataAnnotations;

namespace StudentManagementSystem.Models
{
    /// <summary>
    /// User entity - Represents Admin and Student users
    /// </summary>
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; }

        [Required]
        [StringLength(500)]
        public string PasswordHash { get; set; }

        [Required]
        public UserRole Role { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation property
        public virtual Student Student { get; set; }
    }

    /// <summary>
    /// Enum for user roles
    /// </summary>
    public enum UserRole
    {
        Admin = 1,
        Student = 2
    }
}
