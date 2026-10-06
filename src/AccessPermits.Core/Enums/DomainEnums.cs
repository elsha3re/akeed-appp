namespace AccessPermits.Core.Enums
{
    public enum PermitMode
    {
        Single = 1,
        Multi = 2,
        Vehicle = 3,
        Exit = 4
    }

    public enum PermitStatus
    {
        Pending = 1,
        Active = 2,
        Expired = 3,
        Suspended = 4,
        Rejected = 5
    }

    public enum DepartmentLevel
    {
        Main = 1,
        Sub = 2,
        Section = 3
    }

    public enum SystemActionType
    {
        Add,
        Edit,
        Delete,
        Approve,
        Reject,
        Query,
        Entry,
        Exit
    }

    public enum CardCodeType
    {
        Barcode = 1,
        QrCode = 2
    }
}
