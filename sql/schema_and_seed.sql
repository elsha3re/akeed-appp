-- =====================================================================================
-- نظام تصاريح الدخول - Access Permits System
-- Enterprise SQL Server Database Architecture & Schema
-- Designed by: Senior Database Architect
-- Target Database: Microsoft SQL Server 2019 / 2022 / Azure SQL
-- =====================================================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'AccessPermitsDb')
BEGIN
    CREATE DATABASE [AccessPermitsDb]
    COLLATE Arabic_100_CI_AS_SC_UTF8;
END
GO

USE [AccessPermitsDb];
GO

-- =====================================================================================
-- 1. SCHEMAS (المخططات التنظيمية)
-- =====================================================================================
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'Security')
    EXEC('CREATE SCHEMA [Security]');
GO
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'Organization')
    EXEC('CREATE SCHEMA [Organization]');
GO
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'Registry')
    EXEC('CREATE SCHEMA [Registry]');
GO
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'Permits')
    EXEC('CREATE SCHEMA [Permits]');
GO
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'GateOperations')
    EXEC('CREATE SCHEMA [GateOperations]');
GO
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'Audit')
    EXEC('CREATE SCHEMA [Audit]');
GO
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'SystemConfig')
    EXEC('CREATE SCHEMA [SystemConfig]');
GO

-- =====================================================================================
-- 2. TABLES: SECURITY & ACCESS CONTROL (الأمان والمستخدمين)
-- =====================================================================================

-- جدول المستخدمين
IF OBJECT_ID('Security.Users', 'U') IS NULL
BEGIN
    CREATE TABLE [Security].[Users] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Security_Users PRIMARY KEY CLUSTERED,
        [Name] NVARCHAR(150) NOT NULL,
        [Username] NVARCHAR(50) NOT NULL,
        [PasswordHash] NVARCHAR(256) NOT NULL,
        [Email] NVARCHAR(150) NULL,
        [Phone] NVARCHAR(50) NULL,
        [Role] NVARCHAR(30) NOT NULL CONSTRAINT DF_Users_Role DEFAULT ('requester'),
        [DepartmentId] NVARCHAR(50) NULL,
        [JobTitle] NVARCHAR(100) NULL,
        [Status] NVARCHAR(20) NOT NULL CONSTRAINT DF_Users_Status DEFAULT ('active'),
        [Avatar] NVARCHAR(10) NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_Users_IsDeleted DEFAULT (0)
    );
    CREATE UNIQUE NONCLUSTERED INDEX UQ_Users_Username ON [Security].[Users]([Username]) WHERE [IsDeleted] = 0;
    CREATE NONCLUSTERED INDEX IX_Users_Role_Status ON [Security].[Users]([Role], [Status]);
END
GO

-- ربط المستخدم بالفروع
IF OBJECT_ID('Security.UserBranches', 'U') IS NULL
BEGIN
    CREATE TABLE [Security].[UserBranches] (
        [UserId] NVARCHAR(50) NOT NULL,
        [BranchId] NVARCHAR(50) NOT NULL,
        CONSTRAINT PK_Security_UserBranches PRIMARY KEY CLUSTERED ([UserId], [BranchId]),
        CONSTRAINT FK_UserBranches_Users FOREIGN KEY ([UserId]) REFERENCES [Security].[Users]([Id]) ON DELETE CASCADE
    );
END
GO

-- ربط المستخدم بالمباني المصرح له بها
IF OBJECT_ID('Security.UserBuildings', 'U') IS NULL
BEGIN
    CREATE TABLE [Security].[UserBuildings] (
        [UserId] NVARCHAR(50) NOT NULL,
        [BuildingId] NVARCHAR(50) NOT NULL,
        CONSTRAINT PK_Security_UserBuildings PRIMARY KEY CLUSTERED ([UserId], [BuildingId]),
        CONSTRAINT FK_UserBuildings_Users FOREIGN KEY ([UserId]) REFERENCES [Security].[Users]([Id]) ON DELETE CASCADE
    );
END
GO

-- ربط الحراس بالبوابات المحددة
IF OBJECT_ID('Security.UserGates', 'U') IS NULL
BEGIN
    CREATE TABLE [Security].[UserGates] (
        [UserId] NVARCHAR(50) NOT NULL,
        [GateKey] NVARCHAR(100) NOT NULL, -- Format: 'branchId::gateName'
        CONSTRAINT PK_Security_UserGates PRIMARY KEY CLUSTERED ([UserId], [GateKey]),
        CONSTRAINT FK_UserGates_Users FOREIGN KEY ([UserId]) REFERENCES [Security].[Users]([Id]) ON DELETE CASCADE
    );
END
GO

-- صلاحيات الشاشات المباشرة لكل مستخدم
IF OBJECT_ID('Security.UserPermissions', 'U') IS NULL
BEGIN
    CREATE TABLE [Security].[UserPermissions] (
        [UserId] NVARCHAR(50) NOT NULL,
        [ScreenId] NVARCHAR(50) NOT NULL,
        CONSTRAINT PK_Security_UserPermissions PRIMARY KEY CLUSTERED ([UserId], [ScreenId]),
        CONSTRAINT FK_UserPermissions_Users FOREIGN KEY ([UserId]) REFERENCES [Security].[Users]([Id]) ON DELETE CASCADE
    );
END
GO

-- =====================================================================================
-- 3. TABLES: ORGANIZATION & FACILITY STRUCTURE (الهيكل والمباني والبوابات)
-- =====================================================================================

-- جدول الفروع
IF OBJECT_ID('Organization.Branches', 'U') IS NULL
BEGIN
    CREATE TABLE [Organization].[Branches] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Organization_Branches PRIMARY KEY CLUSTERED,
        [Name] NVARCHAR(100) NOT NULL,
        [Code] NVARCHAR(20) NOT NULL,
        [City] NVARCHAR(50) NULL,
        [Manager] NVARCHAR(100) NULL,
        [Phone] NVARCHAR(50) NULL,
        [Status] NVARCHAR(20) NOT NULL CONSTRAINT DF_Branches_Status DEFAULT ('active'),
        [WorkingHoursDays] NVARCHAR(100) NOT NULL CONSTRAINT DF_Branches_Days DEFAULT ('sun,mon,tue,wed,thu'),
        [WorkingHoursFrom] NVARCHAR(10) NOT NULL CONSTRAINT DF_Branches_From DEFAULT ('07:00'),
        [WorkingHoursTo] NVARCHAR(10) NOT NULL CONSTRAINT DF_Branches_To DEFAULT ('17:00'),
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_Branches_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_Branches_IsDeleted DEFAULT (0)
    );
    CREATE UNIQUE NONCLUSTERED INDEX UQ_Branches_Code ON [Organization].[Branches]([Code]) WHERE [IsDeleted] = 0;
END
GO

-- جدول المباني
IF OBJECT_ID('Organization.Buildings', 'U') IS NULL
BEGIN
    CREATE TABLE [Organization].[Buildings] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Organization_Buildings PRIMARY KEY CLUSTERED,
        [Name] NVARCHAR(100) NOT NULL,
        [Code] NVARCHAR(30) NOT NULL,
        [BranchId] NVARCHAR(50) NOT NULL,
        [Type] NVARCHAR(50) NULL,
        [Floors] INT NOT NULL CONSTRAINT DF_Buildings_Floors DEFAULT (1),
        [Manager] NVARCHAR(100) NULL,
        [Phone] NVARCHAR(50) NULL,
        [Status] NVARCHAR(20) NOT NULL CONSTRAINT DF_Buildings_Status DEFAULT ('active'),
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_Buildings_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_Buildings_IsDeleted DEFAULT (0),
        CONSTRAINT FK_Buildings_Branch FOREIGN KEY ([BranchId]) REFERENCES [Organization].[Branches]([Id])
    );
    CREATE NONCLUSTERED INDEX IX_Buildings_BranchId ON [Organization].[Buildings]([BranchId]);
END
GO

-- جدول البوابات
IF OBJECT_ID('Organization.Gates', 'U') IS NULL
BEGIN
    CREATE TABLE [Organization].[Gates] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Organization_Gates PRIMARY KEY CLUSTERED,
        [Name] NVARCHAR(100) NOT NULL,
        [BranchId] NVARCHAR(50) NOT NULL,
        [BuildingId] NVARCHAR(50) NOT NULL,
        [Location] NVARCHAR(100) NULL,
        [Status] NVARCHAR(20) NOT NULL CONSTRAINT DF_Gates_Status DEFAULT ('active'),
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_Gates_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_Gates_IsDeleted DEFAULT (0),
        CONSTRAINT FK_Gates_Branch FOREIGN KEY ([BranchId]) REFERENCES [Organization].[Branches]([Id]),
        CONSTRAINT FK_Gates_Building FOREIGN KEY ([BuildingId]) REFERENCES [Organization].[Buildings]([Id])
    );
    CREATE NONCLUSTERED INDEX IX_Gates_Branch_Building ON [Organization].[Gates]([BranchId], [BuildingId]);
END
GO

-- جدول أجهزة البوابات (يدعم تعدد الأجهزة لكل بوابة والتعريف التلقائي بالـ MAC)
IF OBJECT_ID('Organization.GateDevices', 'U') IS NULL
BEGIN
    CREATE TABLE [Organization].[GateDevices] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Organization_GateDevices PRIMARY KEY CLUSTERED,
        [GateId] NVARCHAR(50) NOT NULL,
        [Name] NVARCHAR(100) NULL,
        [MacAddress] NVARCHAR(20) NOT NULL,
        [LastSeen] BIGINT NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_GateDevices_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_GateDevices_IsDeleted DEFAULT (0),
        CONSTRAINT FK_GateDevices_Gate FOREIGN KEY ([GateId]) REFERENCES [Organization].[Gates]([Id]) ON DELETE CASCADE
    );
    CREATE NONCLUSTERED INDEX IX_GateDevices_MacAddress ON [Organization].[GateDevices]([MacAddress]);
END
GO

-- جدول المسارات الأمنية
IF OBJECT_ID('Organization.Paths', 'U') IS NULL
BEGIN
    CREATE TABLE [Organization].[Paths] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Organization_Paths PRIMARY KEY CLUSTERED,
        [Name] NVARCHAR(100) NOT NULL,
        [BranchId] NVARCHAR(50) NOT NULL,
        [BuildingId] NVARCHAR(50) NOT NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_Paths_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_Paths_IsDeleted DEFAULT (0),
        CONSTRAINT FK_Paths_Branch FOREIGN KEY ([BranchId]) REFERENCES [Organization].[Branches]([Id]),
        CONSTRAINT FK_Paths_Building FOREIGN KEY ([BuildingId]) REFERENCES [Organization].[Buildings]([Id])
    );
    CREATE NONCLUSTERED INDEX IX_Paths_Branch_Building ON [Organization].[Paths]([BranchId], [BuildingId]);
END
GO

-- ربط المسار بالبوابات المصرح بالعبور منها
IF OBJECT_ID('Organization.PathGates', 'U') IS NULL
BEGIN
    CREATE TABLE [Organization].[PathGates] (
        [PathId] NVARCHAR(50) NOT NULL,
        [GateName] NVARCHAR(100) NOT NULL,
        CONSTRAINT PK_Organization_PathGates PRIMARY KEY CLUSTERED ([PathId], [GateName]),
        CONSTRAINT FK_PathGates_Path FOREIGN KEY ([PathId]) REFERENCES [Organization].[Paths]([Id]) ON DELETE CASCADE
    );
END
GO

-- شجرة الإدارات والأقسام (Hierarchy)
IF OBJECT_ID('Organization.Departments', 'U') IS NULL
BEGIN
    CREATE TABLE [Organization].[Departments] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Organization_Departments PRIMARY KEY CLUSTERED,
        [Name] NVARCHAR(150) NOT NULL,
        [Code] NVARCHAR(30) NOT NULL,
        [Level] INT NOT NULL CONSTRAINT DF_Departments_Level DEFAULT (1), -- 1=رئيسية, 2=فرعية, 3=قسم
        [ParentId] NVARCHAR(50) NULL,
        [BranchId] NVARCHAR(50) NOT NULL,
        [Manager] NVARCHAR(100) NULL,
        [Email] NVARCHAR(150) NULL,
        [Status] NVARCHAR(20) NOT NULL CONSTRAINT DF_Departments_Status DEFAULT ('active'),
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_Departments_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_Departments_IsDeleted DEFAULT (0),
        CONSTRAINT FK_Departments_Branch FOREIGN KEY ([BranchId]) REFERENCES [Organization].[Branches]([Id]),
        CONSTRAINT FK_Departments_Parent FOREIGN KEY ([ParentId]) REFERENCES [Organization].[Departments]([Id])
    );
    CREATE NONCLUSTERED INDEX IX_Departments_Branch_Parent ON [Organization].[Departments]([BranchId], [ParentId]);
END
GO

-- =====================================================================================
-- 4. TABLES: PERSONS REGISTRY & SECURITY WATCHLISTS (سجل الأشخاص والحظر)
-- =====================================================================================

-- سجل الأشخاص والزوار والموظفين
IF OBJECT_ID('Registry.Persons', 'U') IS NULL
BEGIN
    CREATE TABLE [Registry].[Persons] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Registry_Persons PRIMARY KEY CLUSTERED,
        [BranchId] NVARCHAR(50) NOT NULL,
        [Name] NVARCHAR(150) NOT NULL,
        [IdNumber] NVARCHAR(50) NOT NULL,
        [MaskedId] NVARCHAR(50) NOT NULL,
        [Entity] NVARCHAR(150) NULL,
        [PersonType] NVARCHAR(50) NOT NULL CONSTRAINT DF_Persons_PersonType DEFAULT ('مواطن'),
        [IdType] NVARCHAR(50) NOT NULL CONSTRAINT DF_Persons_IdType DEFAULT ('هوية وطنية'),
        [Nationality] NVARCHAR(50) NOT NULL CONSTRAINT DF_Persons_Nationality DEFAULT ('سعودي'),
        [AddedByUserId] NVARCHAR(50) NULL,
        [Status] NVARCHAR(20) NOT NULL CONSTRAINT DF_Persons_Status DEFAULT ('active'),
        [WorkingHoursDays] NVARCHAR(100) NULL,
        [WorkingHoursFrom] NVARCHAR(10) NULL,
        [WorkingHoursTo] NVARCHAR(10) NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_Persons_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_Persons_IsDeleted DEFAULT (0),
        CONSTRAINT FK_Persons_Branch FOREIGN KEY ([BranchId]) REFERENCES [Organization].[Branches]([Id])
    );
    CREATE NONCLUSTERED INDEX IX_Persons_Branch_IdNumber ON [Registry].[Persons]([BranchId], [IdNumber]);
    CREATE NONCLUSTERED INDEX IX_Persons_Search ON [Registry].[Persons]([Name], [IdNumber], [Entity]);
END
GO

-- مرفقات الأشخاص (الصورة الشخصية، صورة الهوية، مستندات إضافية)
IF OBJECT_ID('Registry.PersonAttachments', 'U') IS NULL
BEGIN
    CREATE TABLE [Registry].[PersonAttachments] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Registry_PersonAttachments PRIMARY KEY CLUSTERED,
        [PersonId] NVARCHAR(50) NOT NULL,
        [AttachmentType] NVARCHAR(30) NOT NULL, -- 'personal', 'idPhoto', 'other'
        [FileName] NVARCHAR(200) NOT NULL,
        [FileSize] BIGINT NOT NULL CONSTRAINT DF_PersonAttachments_Size DEFAULT (0),
        [ContentType] NVARCHAR(100) NOT NULL CONSTRAINT DF_PersonAttachments_Type DEFAULT ('image/jpeg'),
        [Base64Data] NVARCHAR(MAX) NOT NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_PersonAttachments_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_PersonAttachments_IsDeleted DEFAULT (0),
        CONSTRAINT FK_PersonAttachments_Person FOREIGN KEY ([PersonId]) REFERENCES [Registry].[Persons]([Id]) ON DELETE CASCADE
    );
    CREATE NONCLUSTERED INDEX IX_PersonAttachments_PersonId ON [Registry].[PersonAttachments]([PersonId]);
END
GO

-- القائمة السوداء والممنوعين
IF OBJECT_ID('Registry.Blacklist', 'U') IS NULL
BEGIN
    CREATE TABLE [Registry].[Blacklist] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Registry_Blacklist PRIMARY KEY CLUSTERED,
        [BranchId] NVARCHAR(50) NOT NULL,
        [IdNumber] NVARCHAR(50) NOT NULL,
        [Name] NVARCHAR(150) NOT NULL,
        [Nationality] NVARCHAR(50) NULL,
        [Reason] NVARCHAR(500) NOT NULL,
        [AddedByUserId] NVARCHAR(50) NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_Blacklist_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_Blacklist_IsDeleted DEFAULT (0),
        CONSTRAINT FK_Blacklist_Branch FOREIGN KEY ([BranchId]) REFERENCES [Organization].[Branches]([Id])
    );
    CREATE NONCLUSTERED INDEX IX_Blacklist_Branch_IdNumber ON [Registry].[Blacklist]([BranchId], [IdNumber]);
END
GO

-- الجنسيات المحظورة في كل فرع
IF OBJECT_ID('Registry.BannedNationalities', 'U') IS NULL
BEGIN
    CREATE TABLE [Registry].[BannedNationalities] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Registry_BannedNationalities PRIMARY KEY CLUSTERED,
        [BranchId] NVARCHAR(50) NOT NULL,
        [Nationality] NVARCHAR(50) NOT NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_BannedNats_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_BannedNats_IsDeleted DEFAULT (0),
        CONSTRAINT FK_BannedNats_Branch FOREIGN KEY ([BranchId]) REFERENCES [Organization].[Branches]([Id])
    );
    CREATE NONCLUSTERED INDEX IX_BannedNats_Branch_Nationality ON [Registry].[BannedNationalities]([BranchId], [Nationality]);
END
GO

-- =====================================================================================
-- 5. TABLES: PERMIT REQUESTS & ISSUED PERMITS (طلبات التصاريح والتصاريح الصادرة)
-- =====================================================================================

-- جدول طلبات التصاريح (Workflow)
IF OBJECT_ID('Permits.PermitRequests', 'U') IS NULL
BEGIN
    CREATE TABLE [Permits].[PermitRequests] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Permits_PermitRequests PRIMARY KEY CLUSTERED,
        [Mode] NVARCHAR(20) NOT NULL, -- 'single', 'multi', 'vehicle', 'exit'
        [Title] NVARCHAR(200) NOT NULL,
        [Subtitle] NVARCHAR(200) NULL,
        [RequestingDept] NVARCHAR(150) NULL,
        [DepartmentId] NVARCHAR(50) NULL,
        [DepartmentName] NVARCHAR(150) NULL,
        [BranchId] NVARCHAR(50) NOT NULL,
        [BuildingId] NVARCHAR(50) NOT NULL,
        [BuildingName] NVARCHAR(100) NULL,
        [DefaultPath] NVARCHAR(100) NOT NULL,
        [VisitDate] NVARCHAR(10) NOT NULL, -- YYYY-MM-DD
        [ExpiryDate] NVARCHAR(10) NOT NULL, -- YYYY-MM-DD
        [SubmitterId] NVARCHAR(50) NOT NULL,
        [SubmitterName] NVARCHAR(100) NOT NULL,
        [RequesterNotes] NVARCHAR(MAX) NULL,
        [GuardNotes] NVARCHAR(MAX) NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT DF_PermitRequests_Status DEFAULT ('pending'), -- pending, approved, rejected
        [PlateNumbers] NVARCHAR(20) NULL,
        [PlateLetters] NVARCHAR(20) NULL,
        [DriverId] NVARCHAR(50) NULL,
        [DriverName] NVARCHAR(150) NULL,
        [RelatedEntryPermitNo] NVARCHAR(50) NULL,
        [IsRenewal] BIT NOT NULL CONSTRAINT DF_PermitRequests_IsRenewal DEFAULT (0),
        [OriginalPermitNumber] NVARCHAR(50) NULL,
        [RenewGroupRef] NVARCHAR(50) NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_PermitRequests_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_PermitRequests_IsDeleted DEFAULT (0)
    );
    CREATE NONCLUSTERED INDEX IX_PermitRequests_Status ON [Permits].[PermitRequests]([Status]);
    CREATE NONCLUSTERED INDEX IX_PermitRequests_Branch ON [Permits].[PermitRequests]([BranchId]);
    CREATE NONCLUSTERED INDEX IX_PermitRequests_Submitter ON [Permits].[PermitRequests]([SubmitterId]);
END
GO

-- تفاصيل الأشخاص في كل طلب (يدعم التخصيص لكل شخص والاعتماد الجزئي)
IF OBJECT_ID('Permits.PermitRequestPersons', 'U') IS NULL
BEGIN
    CREATE TABLE [Permits].[PermitRequestPersons] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Permits_PermitRequestPersons PRIMARY KEY CLUSTERED,
        [RequestId] NVARCHAR(50) NOT NULL,
        [PersonId] NVARCHAR(50) NOT NULL,
        [PersonName] NVARCHAR(150) NOT NULL,
        [PersonSub] NVARCHAR(100) NULL,
        [CustomPath] NVARCHAR(100) NULL,
        [DateFrom] NVARCHAR(10) NULL,
        [DateTo] NVARCHAR(10) NULL,
        [TimeFrom] NVARCHAR(10) NULL,
        [TimeTo] NVARCHAR(10) NULL,
        [CustomDays] NVARCHAR(100) NULL,
        [CustomDevices] NVARCHAR(MAX) NULL,
        [IsApproved] BIT NOT NULL CONSTRAINT DF_RequestPersons_Approved DEFAULT (1),
        [ApproverNote] NVARCHAR(500) NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_RequestPersons_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_RequestPersons_IsDeleted DEFAULT (0),
        CONSTRAINT FK_RequestPersons_Request FOREIGN KEY ([RequestId]) REFERENCES [Permits].[PermitRequests]([Id]) ON DELETE CASCADE
    );
    CREATE NONCLUSTERED INDEX IX_RequestPersons_RequestId ON [Permits].[PermitRequestPersons]([RequestId]);
END
GO

-- الأجهزة المصرح بها في الطلب
IF OBJECT_ID('Permits.PermitRequestDevices', 'U') IS NULL
BEGIN
    CREATE TABLE [Permits].[PermitRequestDevices] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Permits_PermitRequestDevices PRIMARY KEY CLUSTERED,
        [RequestId] NVARCHAR(50) NOT NULL,
        [DeviceName] NVARCHAR(100) NOT NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_RequestDevices_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_RequestDevices_IsDeleted DEFAULT (0),
        CONSTRAINT FK_RequestDevices_Request FOREIGN KEY ([RequestId]) REFERENCES [Permits].[PermitRequests]([Id]) ON DELETE CASCADE
    );
END
GO

-- أصول الخروج في الطلب
IF OBJECT_ID('Permits.PermitRequestExitItems', 'U') IS NULL
BEGIN
    CREATE TABLE [Permits].[PermitRequestExitItems] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Permits_PermitRequestExitItems PRIMARY KEY CLUSTERED,
        [RequestId] NVARCHAR(50) NOT NULL,
        [Category] NVARCHAR(100) NOT NULL,
        [ItemType] NVARCHAR(100) NOT NULL,
        [Quantity] NVARCHAR(20) NOT NULL CONSTRAINT DF_RequestExitItems_Qty DEFAULT ('1'),
        [SerialOrDetail] NVARCHAR(500) NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_RequestExitItems_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_RequestExitItems_IsDeleted DEFAULT (0),
        CONSTRAINT FK_RequestExitItems_Request FOREIGN KEY ([RequestId]) REFERENCES [Permits].[PermitRequests]([Id]) ON DELETE CASCADE
    );
END
GO

-- مرفقات الطلب
IF OBJECT_ID('Permits.PermitRequestAttachments', 'U') IS NULL
BEGIN
    CREATE TABLE [Permits].[PermitRequestAttachments] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Permits_PermitRequestAttachments PRIMARY KEY CLUSTERED,
        [RequestId] NVARCHAR(50) NOT NULL,
        [FileName] NVARCHAR(200) NOT NULL,
        [FileSize] BIGINT NOT NULL CONSTRAINT DF_RequestAttachments_Size DEFAULT (0),
        [ContentType] NVARCHAR(100) NOT NULL CONSTRAINT DF_RequestAttachments_Type DEFAULT ('image/jpeg'),
        [Base64Data] NVARCHAR(MAX) NOT NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_RequestAttachments_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_RequestAttachments_IsDeleted DEFAULT (0),
        CONSTRAINT FK_RequestAttachments_Request FOREIGN KEY ([RequestId]) REFERENCES [Permits].[PermitRequests]([Id]) ON DELETE CASCADE
    );
END
GO

-- جدول التصاريح المعتمدة والصادرة (The Master Permits Table)
IF OBJECT_ID('Permits.IssuedPermits', 'U') IS NULL
BEGIN
    CREATE TABLE [Permits].[IssuedPermits] (
        [PermitNumber] NVARCHAR(50) NOT NULL CONSTRAINT PK_Permits_IssuedPermits PRIMARY KEY CLUSTERED, -- e.g. TSR-2026-08341
        [Mode] NVARCHAR(20) NOT NULL, -- single, vehicle, exit
        [Title] NVARCHAR(200) NOT NULL,
        [Subtitle] NVARCHAR(200) NULL,
        [IdMasked] NVARCHAR(100) NOT NULL,
        [RequestingDept] NVARCHAR(150) NOT NULL,
        [DepartmentId] NVARCHAR(50) NULL,
        [BranchId] NVARCHAR(50) NOT NULL,
        [BranchName] NVARCHAR(100) NOT NULL,
        [BuildingId] NVARCHAR(50) NOT NULL,
        [BuildingName] NVARCHAR(100) NOT NULL,
        [PathName] NVARCHAR(100) NOT NULL,
        [VisitDate] NVARCHAR(10) NOT NULL, -- YYYY-MM-DD
        [ExpiryDate] NVARCHAR(10) NOT NULL, -- YYYY-MM-DD
        [TimeFrom] NVARCHAR(10) NULL,
        [TimeTo] NVARCHAR(10) NULL,
        [WorkingDays] NVARCHAR(100) NULL,
        [SubmitterId] NVARCHAR(50) NOT NULL,
        [Notes] NVARCHAR(MAX) NULL,
        [GuardNotes] NVARCHAR(MAX) NULL,
        [ApprovedBy] NVARCHAR(100) NULL,
        [ApprovalNote] NVARCHAR(500) NULL,
        [ApproverNote] NVARCHAR(500) NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT DF_IssuedPermits_Status DEFAULT ('active'), -- active, expired, suspended
        [SuspendReason] NVARCHAR(500) NULL,
        [PlateNums] NVARCHAR(20) NULL,
        [PlateLetters] NVARCHAR(20) NULL,
        [DriverId] NVARCHAR(50) NULL,
        [GroupRef] NVARCHAR(50) NULL,
        [RenewedFromPermitNo] NVARCHAR(50) NULL,
        [RelatedEntryPermit] NVARCHAR(50) NULL,
        [CardNumber] NVARCHAR(50) NOT NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_IssuedPermits_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_IssuedPermits_IsDeleted DEFAULT (0)
    );
    CREATE NONCLUSTERED INDEX IX_IssuedPermits_Status_Expiry ON [Permits].[IssuedPermits]([Status], [ExpiryDate]);
    CREATE NONCLUSTERED INDEX IX_IssuedPermits_Branch_Building ON [Permits].[IssuedPermits]([BranchId], [BuildingId]);
    CREATE NONCLUSTERED INDEX IX_IssuedPermits_PlateNums ON [Permits].[IssuedPermits]([PlateNums]) WHERE [PlateNums] IS NOT NULL;
    CREATE NONCLUSTERED INDEX IX_IssuedPermits_GroupRef ON [Permits].[IssuedPermits]([GroupRef]) WHERE [GroupRef] IS NOT NULL;
END
GO

-- ربط التصريح بالأشخاص
IF OBJECT_ID('Permits.IssuedPermitPersons', 'U') IS NULL
BEGIN
    CREATE TABLE [Permits].[IssuedPermitPersons] (
        [PermitNumber] NVARCHAR(50) NOT NULL,
        [PersonId] NVARCHAR(50) NOT NULL,
        CONSTRAINT PK_Permits_IssuedPermitPersons PRIMARY KEY CLUSTERED ([PermitNumber], [PersonId]),
        CONSTRAINT FK_IssuedPermitPersons_Permit FOREIGN KEY ([PermitNumber]) REFERENCES [Permits].[IssuedPermits]([PermitNumber]) ON DELETE CASCADE
    );
    CREATE NONCLUSTERED INDEX IX_IssuedPermitPersons_PersonId ON [Permits].[IssuedPermitPersons]([PersonId]);
END
GO

-- أجهزة التصريح المصدر
IF OBJECT_ID('Permits.IssuedPermitDevices', 'U') IS NULL
BEGIN
    CREATE TABLE [Permits].[IssuedPermitDevices] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Permits_IssuedPermitDevices PRIMARY KEY CLUSTERED,
        [PermitNumber] NVARCHAR(50) NOT NULL,
        [DeviceName] NVARCHAR(100) NOT NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_IssuedPermitDevices_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_IssuedPermitDevices_IsDeleted DEFAULT (0),
        CONSTRAINT FK_IssuedPermitDevices_Permit FOREIGN KEY ([PermitNumber]) REFERENCES [Permits].[IssuedPermits]([PermitNumber]) ON DELETE CASCADE
    );
END
GO

-- أصول تصريح الخروج المصدر
IF OBJECT_ID('Permits.IssuedPermitExitItems', 'U') IS NULL
BEGIN
    CREATE TABLE [Permits].[IssuedPermitExitItems] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Permits_IssuedPermitExitItems PRIMARY KEY CLUSTERED,
        [PermitNumber] NVARCHAR(50) NOT NULL,
        [Category] NVARCHAR(100) NOT NULL,
        [ItemType] NVARCHAR(100) NOT NULL,
        [Quantity] NVARCHAR(20) NOT NULL,
        [Detail] NVARCHAR(500) NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_IssuedPermitExitItems_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_IssuedPermitExitItems_IsDeleted DEFAULT (0),
        CONSTRAINT FK_IssuedPermitExitItems_Permit FOREIGN KEY ([PermitNumber]) REFERENCES [Permits].[IssuedPermits]([PermitNumber]) ON DELETE CASCADE
    );
END
GO

-- =====================================================================================
-- 6. TABLES: GATE OPERATIONS & AUDIT (عمليات البوابة وسجلات التدقيق)
-- =====================================================================================

-- سجل الاستعلامات المباشر عند البوابات
IF OBJECT_ID('GateOperations.QueryLogs', 'U') IS NULL
BEGIN
    CREATE TABLE [GateOperations].[QueryLogs] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_GateOperations_QueryLogs PRIMARY KEY CLUSTERED,
        [QueryTime] NVARCHAR(30) NOT NULL,
        [QueryValue] NVARCHAR(50) NOT NULL,
        [SubjectName] NVARCHAR(150) NOT NULL,
        [ResultType] NVARCHAR(30) NOT NULL, -- active, expired, blacklist, notfound, exit
        [ResultLabel] NVARCHAR(50) NOT NULL,
        [OfficerName] NVARCHAR(100) NULL,
        [Nationality] NVARCHAR(50) NULL,
        [GateName] NVARCHAR(100) NULL,
        [BranchName] NVARCHAR(100) NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_QueryLogs_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_QueryLogs_IsDeleted DEFAULT (0)
    );
    CREATE NONCLUSTERED INDEX IX_QueryLogs_QueryValue ON [GateOperations].[QueryLogs]([QueryValue]);
    CREATE NONCLUSTERED INDEX IX_QueryLogs_CreatedAt ON [GateOperations].[QueryLogs]([CreatedAt] DESC);
END
GO

-- سجل حركات الدخول والخروج الفعلية
IF OBJECT_ID('GateOperations.MovementLogs', 'U') IS NULL
BEGIN
    CREATE TABLE [GateOperations].[MovementLogs] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_GateOperations_MovementLogs PRIMARY KEY CLUSTERED,
        [MovementTime] NVARCHAR(30) NOT NULL,
        [Direction] NVARCHAR(20) NOT NULL, -- 'Entry', 'Exit'
        [PermitNumber] NVARCHAR(50) NOT NULL,
        [SubjectName] NVARCHAR(150) NOT NULL,
        [GateName] NVARCHAR(100) NOT NULL,
        [BranchName] NVARCHAR(100) NOT NULL,
        [OfficerName] NVARCHAR(100) NOT NULL,
        [Notes] NVARCHAR(500) NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_MovementLogs_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_MovementLogs_IsDeleted DEFAULT (0)
    );
    CREATE NONCLUSTERED INDEX IX_MovementLogs_PermitNumber ON [GateOperations].[MovementLogs]([PermitNumber]);
    CREATE NONCLUSTERED INDEX IX_MovementLogs_CreatedAt ON [GateOperations].[MovementLogs]([CreatedAt] DESC);
END
GO

-- سجل أحداث النظام (Audit Log)
IF OBJECT_ID('Audit.AuditLogs', 'U') IS NULL
BEGIN
    CREATE TABLE [Audit].[AuditLogs] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_Audit_AuditLogs PRIMARY KEY CLUSTERED,
        [LogTime] NVARCHAR(30) NOT NULL,
        [ActionType] NVARCHAR(30) NOT NULL, -- add, edit, del, approve, reject, query
        [Message] NVARCHAR(250) NOT NULL,
        [Details] NVARCHAR(MAX) NULL,
        [UserName] NVARCHAR(100) NOT NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_AuditLogs_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_AuditLogs_IsDeleted DEFAULT (0)
    );
    CREATE NONCLUSTERED INDEX IX_AuditLogs_CreatedAt ON [Audit].[AuditLogs]([CreatedAt] DESC);
END
GO

-- =====================================================================================
-- 7. TABLES: SYSTEM CONFIGURATION & LOOKUPS (قوائم الاختيار وإعدادات النظام)
-- =====================================================================================

IF OBJECT_ID('SystemConfig.LookupItems', 'U') IS NULL
BEGIN
    CREATE TABLE [SystemConfig].[LookupItems] (
        [Id] NVARCHAR(50) NOT NULL CONSTRAINT PK_SystemConfig_LookupItems PRIMARY KEY CLUSTERED,
        [Category] NVARCHAR(50) NOT NULL,
        [Value] NVARCHAR(150) NOT NULL,
        [ParentValue] NVARCHAR(150) NULL,
        [SortOrder] INT NOT NULL CONSTRAINT DF_LookupItems_SortOrder DEFAULT (0),
        [IsActive] BIT NOT NULL CONSTRAINT DF_LookupItems_IsActive DEFAULT (1),
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_LookupItems_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_LookupItems_IsDeleted DEFAULT (0)
    );
    CREATE NONCLUSTERED INDEX IX_LookupItems_Category_Value ON [SystemConfig].[LookupItems]([Category], [Value]);
END
GO

IF OBJECT_ID('SystemConfig.SystemSettings', 'U') IS NULL
BEGIN
    CREATE TABLE [SystemConfig].[SystemSettings] (
        [Key] NVARCHAR(100) NOT NULL CONSTRAINT PK_SystemConfig_SystemSettings PRIMARY KEY CLUSTERED,
        [Value] NVARCHAR(MAX) NOT NULL,
        [Description] NVARCHAR(250) NULL,
        [CreatedAt] DATETIME2(3) NOT NULL CONSTRAINT DF_SystemSettings_CreatedAt DEFAULT SYSUTCDATETIME(),
        [CreatedBy] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2(3) NULL,
        [UpdatedBy] NVARCHAR(50) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT DF_SystemSettings_IsDeleted DEFAULT (0)
    );
END
GO

-- =====================================================================================
-- 8. ENTERPRISE VIEWS (واجهات عرض تحليلية عالية الأداء)
-- =====================================================================================

-- عرض ملخص التصاريح النشطة مع الأشخاص والبوابات
CREATE OR ALTER VIEW [Permits].[vw_ActivePermitsOverview]
AS
SELECT 
    p.[PermitNumber],
    p.[Mode],
    p.[Title],
    p.[Subtitle],
    p.[IdMasked],
    p.[RequestingDept],
    p.[BranchName],
    p.[BuildingName],
    p.[PathName],
    p.[VisitDate],
    p.[ExpiryDate],
    p.[Status],
    p.[CardNumber],
    (SELECT COUNT(*) FROM [Permits].[IssuedPermitPersons] WHERE [PermitNumber] = p.[PermitNumber]) AS [PersonsCount],
    (SELECT COUNT(*) FROM [Permits].[IssuedPermitDevices] WHERE [PermitNumber] = p.[PermitNumber]) AS [DevicesCount],
    p.[CreatedAt]
FROM [Permits].[IssuedPermits] p
WHERE p.[IsDeleted] = 0;
GO

-- عرض إحصائيات الاستعلامات المجمعة
CREATE OR ALTER VIEW [GateOperations].[vw_GateQuerySummary]
AS
SELECT 
    CAST([CreatedAt] AS DATE) AS [QueryDate],
    [BranchName],
    [GateName],
    [ResultType],
    COUNT(*) AS [TotalQueries]
FROM [GateOperations].[QueryLogs]
WHERE [IsDeleted] = 0
GROUP BY CAST([CreatedAt] AS DATE), [BranchName], [GateName], [ResultType];
GO

-- =====================================================================================
-- 9. STORED PROCEDURES (إجراءات مخزنة احترافية)
-- =====================================================================================

-- إجراء فحص واستعلام البوابة السريع (High-Performance Gate Verification)
CREATE OR ALTER PROCEDURE [GateOperations].[sp_VerifyGateAccess]
    @BranchId NVARCHAR(50),
    @GateName NVARCHAR(100),
    @QueryDigits NVARCHAR(50), -- Last 4 digits of ID or Plate Number
    @Mode NVARCHAR(20) = 'person', -- 'person', 'vehicle', 'exit'
    @OfficerName NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Today NVARCHAR(10) = CONVERT(NVARCHAR(10), GETDATE(), 23);
    DECLARE @CurrentTime NVARCHAR(5) = FORMAT(GETDATE(), 'HH:mm');

    -- 1. Check Blacklist first
    IF EXISTS (SELECT 1 FROM [Registry].[Blacklist] WHERE [BranchId] = @BranchId AND [IdNumber] LIKE '%' + @QueryDigits AND [IsDeleted] = 0)
    BEGIN
        SELECT 
            'blacklist' AS [Status],
            N'⛔ ممنوع من الدخول' AS [Title],
            b.[Name],
            b.[Reason] AS [Subtitle],
            b.[Nationality],
            NULL AS [PermitNumber]
        FROM [Registry].[Blacklist] b
        WHERE b.[BranchId] = @BranchId AND b.[IdNumber] LIKE '%' + @QueryDigits AND b.[IsDeleted] = 0;
        RETURN;
    END

    -- 2. Vehicle Mode
    IF @Mode = 'vehicle'
    BEGIN
        SELECT TOP 1
            CASE 
                WHEN p.[Status] = 'suspended' THEN 'suspended'
                WHEN p.[VisitDate] > @Today THEN 'upcoming'
                WHEN p.[ExpiryDate] < @Today THEN 'expired'
                ELSE 'active'
            END AS [Status],
            p.[Title],
            p.[Subtitle],
            p.[PermitNumber],
            p.[PathName],
            p.[BuildingName]
        FROM [Permits].[IssuedPermits] p
        WHERE p.[Mode] = 'vehicle' AND p.[BranchId] = @BranchId AND p.[PlateNums] = @QueryDigits AND p.[IsDeleted] = 0
        ORDER BY CASE WHEN p.[Status] = 'active' THEN 0 ELSE 1 END;
        RETURN;
    END

    -- 3. Person / Exit Mode
    DECLARE @TargetMode NVARCHAR(20) = CASE WHEN @Mode = 'exit' THEN 'exit' ELSE 'single' END;

    SELECT TOP 1
        CASE 
            WHEN p.[Status] = 'suspended' THEN 'suspended'
            WHEN p.[VisitDate] > @Today THEN 'upcoming'
            WHEN p.[ExpiryDate] < @Today THEN 'expired'
            WHEN @Mode = 'exit' THEN 'exit'
            ELSE 'active'
        END AS [Status],
        p.[Title],
        p.[Subtitle],
        p.[PermitNumber],
        p.[PathName],
        p.[BuildingName],
        per.[Nationality],
        per.[IdNumber]
    FROM [Permits].[IssuedPermits] p
    INNER JOIN [Permits].[IssuedPermitPersons] pp ON p.[PermitNumber] = pp.[PermitNumber]
    INNER JOIN [Registry].[Persons] per ON pp.[PersonId] = per.[Id]
    WHERE p.[Mode] = @TargetMode 
      AND p.[BranchId] = @BranchId 
      AND per.[IdNumber] LIKE '%' + @QueryDigits
      AND p.[IsDeleted] = 0
    ORDER BY CASE WHEN p.[Status] = 'active' THEN 0 ELSE 1 END;
END
GO

-- إجراء سحب مؤشرات لوحة التحكم (Dashboard KPIs)
CREATE OR ALTER PROCEDURE [Permits].[sp_GetDashboardKpis]
    @BranchId NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Today NVARCHAR(10) = CONVERT(NVARCHAR(10), GETDATE(), 23);

    SELECT 
        COUNT(CASE WHEN p.[Status] = 'active' AND p.[ExpiryDate] >= @Today THEN 1 END) AS [ActivePermits],
        COUNT(CASE WHEN p.[Status] = 'expired' OR (p.[Status] = 'active' AND p.[ExpiryDate] < @Today) THEN 1 END) AS [ExpiredPermits],
        (SELECT COUNT(*) FROM [Permits].[PermitRequests] WHERE [Status] = 'pending' AND (@BranchId IS NULL OR [BranchId] = @BranchId)) AS [PendingRequests],
        (SELECT COUNT(*) FROM [GateOperations].[QueryLogs] WHERE (@BranchId IS NULL OR [BranchName] = @BranchId)) AS [TotalQueries]
    FROM [Permits].[IssuedPermits] p
    WHERE p.[IsDeleted] = 0 AND (@BranchId IS NULL OR p.[BranchId] = @BranchId);
END
GO
