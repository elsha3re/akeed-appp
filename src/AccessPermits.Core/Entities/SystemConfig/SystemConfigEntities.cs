using System;
using AccessPermits.Core.Common;

namespace AccessPermits.Core.Entities.SystemConfig
{
    public class LookupItem : BaseEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Category { get; set; } = string.Empty; // nationalities, personTypes, idTypes, visitTypes, devices, vehicleTypes, vehicleColors, vehicleMakes, gateLocations, exitItemCategories, exitItemTypes, buildingTypes
        public string Value { get; set; } = string.Empty;
        public string? ParentValue { get; set; } // for sub-lookups (e.g. make -> model, category -> itemType)
        public int SortOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;
    }

    public class SystemSetting : BaseEntity
    {
        public string Key { get; set; } = string.Empty; // Primary Key
        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
