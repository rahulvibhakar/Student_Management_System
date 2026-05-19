using Microsoft.EntityFrameworkCore;
using StudentManagementSystem.Models;

namespace StudentManagementSystem.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<Attendance> Attendance { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Student)
                .WithOne(s => s.User)
                .HasForeignKey<Student>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<int>();

            modelBuilder.Entity<Student>()
                .HasIndex(s => s.UserId)
                .IsUnique();

            modelBuilder.Entity<Course>().HasData(
                new Course { CourseId = 1, CourseName = "Computer Science Engineering", CourseCode = "CSE101", Department = "Engineering" },
                new Course { CourseId = 2, CourseName = "Electronics and Communication Engineering", CourseCode = "ECE101", Department = "Engineering" },
                new Course { CourseId = 3, CourseName = "Mechanical Engineering", CourseCode = "ME101", Department = "Engineering" },
                new Course { CourseId = 4, CourseName = "Civil Engineering", CourseCode = "CE101", Department = "Engineering" },
                new Course { CourseId = 5, CourseName = "Information Technology", CourseCode = "IT101", Department = "Engineering" }
            );
        }
    }
}
