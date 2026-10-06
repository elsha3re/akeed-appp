using System;
using AccessPermits.Core.Common;

namespace AccessPermits.Core.Entities.Audit
{
    public class AuditLog : BaseEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string LogTime { get; set; } = string.Empty;
        public string ActionType { get; set; } = "add"; // add, edit, del, approve, reject, query
        public string Message { get; set; } = string.Empty;
        public string? Details { get; set; }
        public string UserName { get; set; } = string.Empty;
    }
}
