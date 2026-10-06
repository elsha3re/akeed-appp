using System;
using System.Collections.Generic;
using AccessPermits.Core.Common;

namespace AccessPermits.Core.Entities.Organization
{
    public class Branch : BaseEntity
    {
        public string Id { get; set; } = string.Empty; // e.g. "riyadh", "jeddah", "dammam"
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? City { get; set; }
        public string? Manager { get; set; }
        public string? Phone { get; set; }
        public string Status { get; set; } = "active";

        // Working hours configuration
        public string WorkingHoursDays { get; set; } = "sun,mon,tue,wed,thu";
        public string WorkingHoursFrom { get; set; } = "07:00";
        public string WorkingHoursTo { get; set; } = "17:00";

        public virtual ICollection<Building> Buildings { get; set; } = new List<Building>();
        public virtual ICollection<Gate> Gates { get; set; } = new List<Gate>();
        public virtual ICollection<FacilityPath> Paths { get; set; } = new List<FacilityPath>();
        public virtual ICollection<Department> Departments { get; set; } = new List<Department>();
    }

    public class Building : BaseEntity
    {
        public string Id { get; set; } = string.Empty; // e.g. "bldg-1"
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string BranchId { get; set; } = string.Empty;
        public virtual Branch? Branch { get; set; }
        public string? Type { get; set; } // مبنى إداري، مبنى تقني...
        public int Floors { get; set; } = 1;
        public string? Manager { get; set; }
        public string? Phone { get; set; }
        public string Status { get; set; } = "active";

        public virtual ICollection<Gate> Gates { get; set; } = new List<Gate>();
        public virtual ICollection<FacilityPath> Paths { get; set; } = new List<FacilityPath>();
    }

    public class Gate : BaseEntity
    {
        public string Id { get; set; } = string.Empty; // e.g. "g1"
        public string Name { get; set; } = string.Empty; // e.g. "بوابة 1"
        public string BranchId { get; set; } = string.Empty;
        public virtual Branch? Branch { get; set; }
        public string BuildingId { get; set; } = string.Empty;
        public virtual Building? Building { get; set; }
        public string? Location { get; set; } // المدخل الرئيسي، مدخل الموظفين...
        public string Status { get; set; } = "active";

        public virtual ICollection<GateDevice> Devices { get; set; } = new List<GateDevice>();
    }

    public class GateDevice : BaseEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string GateId { get; set; } = string.Empty;
        public virtual Gate? Gate { get; set; }
        public string? Name { get; set; } // e.g. "جهاز حارس البوابة 1"
        public string MacAddress { get; set; } = string.Empty; // Normalized "AA:BB:CC:DD:EE:FF"
        public long? LastSeen { get; set; }
    }

    public class FacilityPath : BaseEntity
    {
        public string Id { get; set; } = string.Empty; // e.g. "p1"
        public string Name { get; set; } = string.Empty; // e.g. "مسار الشرقي"
        public string BranchId { get; set; } = string.Empty;
        public virtual Branch? Branch { get; set; }
        public string BuildingId { get; set; } = string.Empty;
        public virtual Building? Building { get; set; }

        public virtual ICollection<FacilityPathGate> Gates { get; set; } = new List<FacilityPathGate>();
    }

    public class FacilityPathGate
    {
        public string PathId { get; set; } = string.Empty;
        public virtual FacilityPath? Path { get; set; }
        public string GateName { get; set; } = string.Empty; // e.g. "بوابة 1"
    }

    public class Department : BaseEntity
    {
        public string Id { get; set; } = string.Empty; // e.g. "dep-hq", "dep-it"
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int Level { get; set; } = 1; // 1 = الرئيسية, 2 = فرعية, 3 = قسم
        public string? ParentId { get; set; }
        public virtual Department? Parent { get; set; }
        public virtual ICollection<Department> SubDepartments { get; set; } = new List<Department>();
        public string BranchId { get; set; } = string.Empty;
        public virtual Branch? Branch { get; set; }
        public string? Manager { get; set; }
        public string? Email { get; set; }
        public string Status { get; set; } = "active";
    }
}
