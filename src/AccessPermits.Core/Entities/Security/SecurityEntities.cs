using System;
using System.Collections.Generic;
using AccessPermits.Core.Common;

namespace AccessPermits.Core.Entities.Security
{
    public class User : BaseEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string Role { get; set; } = "requester"; // admin, approver, requester, guard
        public string? DepartmentId { get; set; }
        public string? JobTitle { get; set; }
        public string Status { get; set; } = "active"; // active, inactive
        public string? Avatar { get; set; }

        public virtual ICollection<UserBranch> Branches { get; set; } = new List<UserBranch>();
        public virtual ICollection<UserBuilding> Buildings { get; set; } = new List<UserBuilding>();
        public virtual ICollection<UserGate> Gates { get; set; } = new List<UserGate>();
        public virtual ICollection<UserPermission> Permissions { get; set; } = new List<UserPermission>();
    }

    public class UserBranch
    {
        public string UserId { get; set; } = string.Empty;
        public virtual User? User { get; set; }
        public string BranchId { get; set; } = string.Empty;
    }

    public class UserBuilding
    {
        public string UserId { get; set; } = string.Empty;
        public virtual User? User { get; set; }
        public string BuildingId { get; set; } = string.Empty;
    }

    public class UserGate
    {
        public string UserId { get; set; } = string.Empty;
        public virtual User? User { get; set; }
        public string GateKey { get; set; } = string.Empty; // e.g. "riyadh::بوابة 1"
    }

    public class UserPermission
    {
        public string UserId { get; set; } = string.Empty;
        public virtual User? User { get; set; }
        public string ScreenId { get; set; } = string.Empty;
    }
}
