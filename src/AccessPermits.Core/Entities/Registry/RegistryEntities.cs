using System;
using System.Collections.Generic;
using AccessPermits.Core.Common;

namespace AccessPermits.Core.Entities.Registry
{
    public class Person : BaseEntity
    {
        public string Id { get; set; } = string.Empty; // e.g. "p1"
        public string BranchId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string IdNumber { get; set; } = string.Empty;
        public string MaskedId { get; set; } = string.Empty; // e.g. "1023••••56"
        public string? Entity { get; set; } // الشركة أو الجهة
        public string PersonType { get; set; } = "مواطن"; // مواطن، مقيم، زائر، دبلوماسي
        public string IdType { get; set; } = "هوية وطنية"; // هوية وطنية، إقامة، جواز سفر...
        public string Nationality { get; set; } = "سعودي";
        public string? AddedByUserId { get; set; }
        public string Status { get; set; } = "active";

        // Custom working hours (Optional)
        public string? WorkingHoursDays { get; set; }
        public string? WorkingHoursFrom { get; set; }
        public string? WorkingHoursTo { get; set; }

        public virtual ICollection<PersonAttachment> Attachments { get; set; } = new List<PersonAttachment>();
    }

    public class PersonAttachment : BaseEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string PersonId { get; set; } = string.Empty;
        public virtual Person? Person { get; set; }
        public string AttachmentType { get; set; } = "personal"; // personal, idPhoto, other
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string ContentType { get; set; } = "image/jpeg";
        public string Base64Data { get; set; } = string.Empty;
    }

    public class BlacklistEntry : BaseEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string BranchId { get; set; } = string.Empty;
        public string IdNumber { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Nationality { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? AddedByUserId { get; set; }
    }

    public class BannedNationality : BaseEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string BranchId { get; set; } = string.Empty;
        public string Nationality { get; set; } = string.Empty;
    }
}
