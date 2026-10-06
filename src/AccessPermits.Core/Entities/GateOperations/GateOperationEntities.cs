using System;
using AccessPermits.Core.Common;

namespace AccessPermits.Core.Entities.GateOperations
{
    public class QueryLog : BaseEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string QueryTime { get; set; } = string.Empty;
        public string QueryValue { get; set; } = string.Empty; // e.g. "0056"
        public string SubjectName { get; set; } = string.Empty;
        public string ResultType { get; set; } = "active"; // active, expired, blacklist, notfound, exit
        public string ResultLabel { get; set; } = "✔ ساري";
        public string? OfficerName { get; set; }
        public string? Nationality { get; set; }
        public string? GateName { get; set; }
        public string? BranchName { get; set; }
    }

    public class GateMovementLog : BaseEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string MovementTime { get; set; } = string.Empty;
        public string Direction { get; set; } = "Entry"; // Entry, Exit
        public string PermitNumber { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string GateName { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;
        public string OfficerName { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
}
