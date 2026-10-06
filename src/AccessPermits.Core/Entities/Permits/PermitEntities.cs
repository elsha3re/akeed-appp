using System;
using System.Collections.Generic;
using AccessPermits.Core.Common;

namespace AccessPermits.Core.Entities.Permits
{
    public class PermitRequest : BaseEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString(); // e.g. "req1"
        public string Mode { get; set; } = "single"; // single, multi, vehicle, exit
        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string? RequestingDept { get; set; }
        public string? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public string BranchId { get; set; } = string.Empty;
        public string BuildingId { get; set; } = string.Empty;
        public string? BuildingName { get; set; }
        public string DefaultPath { get; set; } = string.Empty;
        public string VisitDate { get; set; } = string.Empty; // YYYY-MM-DD
        public string ExpiryDate { get; set; } = string.Empty; // YYYY-MM-DD

        public string SubmitterId { get; set; } = string.Empty;
        public string SubmitterName { get; set; } = string.Empty;
        public string? RequesterNotes { get; set; }
        public string? GuardNotes { get; set; }
        public string Status { get; set; } = "pending"; // pending, approved, rejected

        // Vehicle mode specific
        public string? PlateNumbers { get; set; }
        public string? PlateLetters { get; set; }
        public string? DriverId { get; set; }
        public string? DriverName { get; set; }

        // Exit mode specific
        public string? RelatedEntryPermitNo { get; set; }

        // Renewal specific
        public bool IsRenewal { get; set; } = false;
        public string? OriginalPermitNumber { get; set; }
        public string? RenewGroupRef { get; set; }

        public virtual ICollection<PermitRequestPerson> Persons { get; set; } = new List<PermitRequestPerson>();
        public virtual ICollection<PermitRequestDevice> Devices { get; set; } = new List<PermitRequestDevice>();
        public virtual ICollection<PermitRequestExitItem> ExitItems { get; set; } = new List<PermitRequestExitItem>();
        public virtual ICollection<PermitRequestAttachment> Attachments { get; set; } = new List<PermitRequestAttachment>();
    }

    public class PermitRequestPerson : BaseEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string RequestId { get; set; } = string.Empty;
        public virtual PermitRequest? Request { get; set; }
        public string PersonId { get; set; } = string.Empty;
        public string PersonName { get; set; } = string.Empty;
        public string? PersonSub { get; set; }

        // Per-person customization
        public string? CustomPath { get; set; }
        public string? DateFrom { get; set; }
        public string? DateTo { get; set; }
        public string? TimeFrom { get; set; }
        public string? TimeTo { get; set; }
        public string? CustomDays { get; set; } // comma separated "sun,mon..."
        public string? CustomDevices { get; set; } // JSON or comma separated devices

        // Approval per-person
        public bool IsApproved { get; set; } = true;
        public string? ApproverNote { get; set; }
    }

    public class PermitRequestDevice : BaseEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string RequestId { get; set; } = string.Empty;
        public virtual PermitRequest? Request { get; set; }
        public string DeviceName { get; set; } = string.Empty;
    }

    public class PermitRequestExitItem : BaseEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string RequestId { get; set; } = string.Empty;
        public virtual PermitRequest? Request { get; set; }
        public string Category { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public string Quantity { get; set; } = "1";
        public string? SerialOrDetail { get; set; }
    }

    public class PermitRequestAttachment : BaseEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string RequestId { get; set; } = string.Empty;
        public virtual PermitRequest? Request { get; set; }
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string ContentType { get; set; } = "image/jpeg";
        public string Base64Data { get; set; } = string.Empty;
    }

    public class IssuedPermit : BaseEntity
    {
        public string PermitNumber { get; set; } = string.Empty; // Primary Key e.g. "TSR-2026-08341"
        public string Mode { get; set; } = "single"; // single, vehicle, exit
        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string IdMasked { get; set; } = string.Empty;
        public string RequestingDept { get; set; } = string.Empty;
        public string? DepartmentId { get; set; }
        public string BranchId { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;
        public string BuildingId { get; set; } = string.Empty;
        public string BuildingName { get; set; } = string.Empty;
        public string PathName { get; set; } = string.Empty;
        public string VisitDate { get; set; } = string.Empty;
        public string ExpiryDate { get; set; } = string.Empty;
        public string? TimeFrom { get; set; }
        public string? TimeTo { get; set; }
        public string? WorkingDays { get; set; }

        public string SubmitterId { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? GuardNotes { get; set; }
        public string? ApprovedBy { get; set; }
        public string? ApprovalNote { get; set; }
        public string? ApproverNote { get; set; }

        public string Status { get; set; } = "active"; // active, expired, suspended
        public string? SuspendReason { get; set; }

        // Vehicle
        public string? PlateNums { get; set; }
        public string? PlateLetters { get; set; }
        public string? DriverId { get; set; }

        // Multi / group reference
        public string? GroupRef { get; set; }
        public string? RenewedFromPermitNo { get; set; }
        public string? RelatedEntryPermit { get; set; }

        public string CardNumber { get; set; } = string.Empty; // e.g. "CRD-20260001"

        public virtual ICollection<IssuedPermitPerson> Persons { get; set; } = new List<IssuedPermitPerson>();
        public virtual ICollection<IssuedPermitDevice> Devices { get; set; } = new List<IssuedPermitDevice>();
        public virtual ICollection<IssuedPermitExitItem> ExitItems { get; set; } = new List<IssuedPermitExitItem>();
        public virtual ICollection<IssuedPermitAttachment> Attachments { get; set; } = new List<IssuedPermitAttachment>();
    }

    public class IssuedPermitPerson
    {
        public string PermitNumber { get; set; } = string.Empty;
        public virtual IssuedPermit? Permit { get; set; }
        public string PersonId { get; set; } = string.Empty;
    }

    public class IssuedPermitDevice : BaseEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string PermitNumber { get; set; } = string.Empty;
        public virtual IssuedPermit? Permit { get; set; }
        public string DeviceName { get; set; } = string.Empty;
    }

    public class IssuedPermitExitItem : BaseEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string PermitNumber { get; set; } = string.Empty;
        public virtual IssuedPermit? Permit { get; set; }
        public string Category { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public string Quantity { get; set; } = "1";
        public string? Detail { get; set; }
    }

    public class IssuedPermitAttachment : BaseEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string PermitNumber { get; set; } = string.Empty;
        public virtual IssuedPermit? Permit { get; set; }
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string ContentType { get; set; } = "image/jpeg";
        public string Base64Data { get; set; } = string.Empty;
    }
}
