using Microsoft.EntityFrameworkCore;
using AccessPermits.Core.Entities.Security;
using AccessPermits.Core.Entities.Organization;
using AccessPermits.Core.Entities.Registry;
using AccessPermits.Core.Entities.Permits;
using AccessPermits.Core.Entities.GateOperations;
using AccessPermits.Core.Entities.Audit;
using AccessPermits.Core.Entities.SystemConfig;

namespace AccessPermits.Infrastructure.Data
{
    public class AccessPermitsDbContext : DbContext
    {
        public AccessPermitsDbContext(DbContextOptions<AccessPermitsDbContext> options)
            : base(options)
        {
        }

        // Security
        public DbSet<User> Users => Set<User>();
        public DbSet<UserBranch> UserBranches => Set<UserBranch>();
        public DbSet<UserBuilding> UserBuildings => Set<UserBuilding>();
        public DbSet<UserGate> UserGates => Set<UserGate>();
        public DbSet<UserPermission> UserPermissions => Set<UserPermission>();

        // Organization
        public DbSet<Branch> Branches => Set<Branch>();
        public DbSet<Building> Buildings => Set<Building>();
        public DbSet<Gate> Gates => Set<Gate>();
        public DbSet<GateDevice> GateDevices => Set<GateDevice>();
        public DbSet<FacilityPath> Paths => Set<FacilityPath>();
        public DbSet<FacilityPathGate> PathGates => Set<FacilityPathGate>();
        public DbSet<Department> Departments => Set<Department>();

        // Registry
        public DbSet<Person> Persons => Set<Person>();
        public DbSet<PersonAttachment> PersonAttachments => Set<PersonAttachment>();
        public DbSet<BlacklistEntry> Blacklist => Set<BlacklistEntry>();
        public DbSet<BannedNationality> BannedNationalities => Set<BannedNationality>();

        // Permits
        public DbSet<PermitRequest> PermitRequests => Set<PermitRequest>();
        public DbSet<PermitRequestPerson> PermitRequestPersons => Set<PermitRequestPerson>();
        public DbSet<PermitRequestDevice> PermitRequestDevices => Set<PermitRequestDevice>();
        public DbSet<PermitRequestExitItem> PermitRequestExitItems => Set<PermitRequestExitItem>();
        public DbSet<PermitRequestAttachment> PermitRequestAttachments => Set<PermitRequestAttachment>();

        public DbSet<IssuedPermit> IssuedPermits => Set<IssuedPermit>();
        public DbSet<IssuedPermitPerson> IssuedPermitPersons => Set<IssuedPermitPerson>();
        public DbSet<IssuedPermitDevice> IssuedPermitDevices => Set<IssuedPermitDevice>();
        public DbSet<IssuedPermitExitItem> IssuedPermitExitItems => Set<IssuedPermitExitItem>();
        public DbSet<IssuedPermitAttachment> IssuedPermitAttachments => Set<IssuedPermitAttachment>();

        // Gate Operations
        public DbSet<QueryLog> QueryLogs => Set<QueryLog>();
        public DbSet<GateMovementLog> MovementLogs => Set<GateMovementLog>();

        // Audit
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        // System Config
        public DbSet<LookupItem> Lookups => Set<LookupItem>();
        public DbSet<SystemSetting> Settings => Set<SystemSetting>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Schemas and Tables
            // Security
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users", "Security");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.Username).IsUnique();
                entity.Property(e => e.Role).IsRequired().HasMaxLength(30);
                entity.Property(e => e.DepartmentId).HasMaxLength(50);
                entity.Property(e => e.Status).HasMaxLength(20);
            });

            modelBuilder.Entity<UserBranch>(entity =>
            {
                entity.ToTable("UserBranches", "Security");
                entity.HasKey(e => new { e.UserId, e.BranchId });
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Branches)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserBuilding>(entity =>
            {
                entity.ToTable("UserBuildings", "Security");
                entity.HasKey(e => new { e.UserId, e.BuildingId });
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Buildings)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserGate>(entity =>
            {
                entity.ToTable("UserGates", "Security");
                entity.HasKey(e => new { e.UserId, e.GateKey });
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Gates)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserPermission>(entity =>
            {
                entity.ToTable("UserPermissions", "Security");
                entity.HasKey(e => new { e.UserId, e.ScreenId });
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Permissions)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Organization
            modelBuilder.Entity<Branch>(entity =>
            {
                entity.ToTable("Branches", "Organization");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
                entity.HasIndex(e => e.Code).IsUnique();
            });

            modelBuilder.Entity<Building>(entity =>
            {
                entity.ToTable("Buildings", "Organization");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(30);
                entity.HasOne(e => e.Branch)
                      .WithMany(b => b.Buildings)
                      .HasForeignKey(e => e.BranchId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Gate>(entity =>
            {
                entity.ToTable("Gates", "Organization");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.HasOne(e => e.Branch)
                      .WithMany(b => b.Gates)
                      .HasForeignKey(e => e.BranchId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Building)
                      .WithMany(b => b.Gates)
                      .HasForeignKey(e => e.BuildingId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<GateDevice>(entity =>
            {
                entity.ToTable("GateDevices", "Organization");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.Property(e => e.MacAddress).IsRequired().HasMaxLength(20);
                entity.HasIndex(e => e.MacAddress);
                entity.HasOne(e => e.Gate)
                      .WithMany(g => g.Devices)
                      .HasForeignKey(e => e.GateId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<FacilityPath>(entity =>
            {
                entity.ToTable("Paths", "Organization");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.HasOne(e => e.Branch)
                      .WithMany(b => b.Paths)
                      .HasForeignKey(e => e.BranchId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Building)
                      .WithMany(b => b.Paths)
                      .HasForeignKey(e => e.BuildingId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<FacilityPathGate>(entity =>
            {
                entity.ToTable("PathGates", "Organization");
                entity.HasKey(e => new { e.PathId, e.GateName });
                entity.HasOne(e => e.Path)
                      .WithMany(p => p.Gates)
                      .HasForeignKey(e => e.PathId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Department>(entity =>
            {
                entity.ToTable("Departments", "Organization");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(30);
                entity.HasOne(e => e.Branch)
                      .WithMany(b => b.Departments)
                      .HasForeignKey(e => e.BranchId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Parent)
                      .WithMany(d => d.SubDepartments)
                      .HasForeignKey(e => e.ParentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Registry
            modelBuilder.Entity<Person>(entity =>
            {
                entity.ToTable("Persons", "Registry");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
                entity.Property(e => e.IdNumber).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => new { e.BranchId, e.IdNumber });
            });

            modelBuilder.Entity<PersonAttachment>(entity =>
            {
                entity.ToTable("PersonAttachments", "Registry");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.HasOne(e => e.Person)
                      .WithMany(p => p.Attachments)
                      .HasForeignKey(e => e.PersonId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<BlacklistEntry>(entity =>
            {
                entity.ToTable("Blacklist", "Registry");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.Property(e => e.IdNumber).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => new { e.BranchId, e.IdNumber });
            });

            modelBuilder.Entity<BannedNationality>(entity =>
            {
                entity.ToTable("BannedNationalities", "Registry");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.HasIndex(e => new { e.BranchId, e.Nationality });
            });

            // Permits
            modelBuilder.Entity<PermitRequest>(entity =>
            {
                entity.ToTable("PermitRequests", "Permits");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Status).HasMaxLength(30);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.BranchId);
            });

            modelBuilder.Entity<PermitRequestPerson>(entity =>
            {
                entity.ToTable("PermitRequestPersons", "Permits");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.HasOne(e => e.Request)
                      .WithMany(r => r.Persons)
                      .HasForeignKey(e => e.RequestId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PermitRequestDevice>(entity =>
            {
                entity.ToTable("PermitRequestDevices", "Permits");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.HasOne(e => e.Request)
                      .WithMany(r => r.Devices)
                      .HasForeignKey(e => e.RequestId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PermitRequestExitItem>(entity =>
            {
                entity.ToTable("PermitRequestExitItems", "Permits");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.HasOne(e => e.Request)
                      .WithMany(r => r.ExitItems)
                      .HasForeignKey(e => e.RequestId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PermitRequestAttachment>(entity =>
            {
                entity.ToTable("PermitRequestAttachments", "Permits");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.HasOne(e => e.Request)
                      .WithMany(r => r.Attachments)
                      .HasForeignKey(e => e.RequestId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<IssuedPermit>(entity =>
            {
                entity.ToTable("IssuedPermits", "Permits");
                entity.HasKey(e => e.PermitNumber);
                entity.Property(e => e.PermitNumber).HasMaxLength(50);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Status).HasMaxLength(30);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.BranchId);
                entity.HasIndex(e => e.BuildingId);
                entity.HasIndex(e => e.PlateNums);
            });

            modelBuilder.Entity<IssuedPermitPerson>(entity =>
            {
                entity.ToTable("IssuedPermitPersons", "Permits");
                entity.HasKey(e => new { e.PermitNumber, e.PersonId });
                entity.HasOne(e => e.Permit)
                      .WithMany(p => p.Persons)
                      .HasForeignKey(e => e.PermitNumber)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<IssuedPermitDevice>(entity =>
            {
                entity.ToTable("IssuedPermitDevices", "Permits");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.HasOne(e => e.Permit)
                      .WithMany(p => p.Devices)
                      .HasForeignKey(e => e.PermitNumber)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<IssuedPermitExitItem>(entity =>
            {
                entity.ToTable("IssuedPermitExitItems", "Permits");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.HasOne(e => e.Permit)
                      .WithMany(p => p.ExitItems)
                      .HasForeignKey(e => e.PermitNumber)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<IssuedPermitAttachment>(entity =>
            {
                entity.ToTable("IssuedPermitAttachments", "Permits");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.HasOne(e => e.Permit)
                      .WithMany(p => p.Attachments)
                      .HasForeignKey(e => e.PermitNumber)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Gate Operations
            modelBuilder.Entity<QueryLog>(entity =>
            {
                entity.ToTable("QueryLogs", "GateOperations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.HasIndex(e => e.QueryValue);
                entity.HasIndex(e => e.CreatedAt);
            });

            modelBuilder.Entity<GateMovementLog>(entity =>
            {
                entity.ToTable("MovementLogs", "GateOperations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.HasIndex(e => e.PermitNumber);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Audit
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.ToTable("AuditLogs", "Audit");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.HasIndex(e => e.CreatedAt);
            });

            // System Config
            modelBuilder.Entity<LookupItem>(entity =>
            {
                entity.ToTable("LookupItems", "SystemConfig");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => new { e.Category, e.Value });
            });

            modelBuilder.Entity<SystemSetting>(entity =>
            {
                entity.ToTable("SystemSettings", "SystemConfig");
                entity.HasKey(e => e.Key);
                entity.Property(e => e.Key).HasMaxLength(100);
            });
        }
    }
}
