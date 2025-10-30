# Automation of Mitel Call Routing of Known Contacts

## Objective
As part of project _Lockstep_, all Ntiva clients are assigned to a designated "_market pod_". Phone calls for new tickets should be routed to the call queue of the market pod associated with the client. Phone calls for existing tickets should be routed to the Customer Service Coordinator (CSC) associated with this client / market. Unrecognized phone numbers should route to CSCs.

## Solution
MiContact center has robust workflow automations for determining call routing and flow. Calls can be routed to specific queues based on a SQL database query. 

An Azure SQL database ["MITELCALLOROUTE"](https://portal.azure.com/#@ntiva.net/resource/subscriptions/140c0639-524b-4e65-a7f1-f490039f13f1/resourceGroups/Azure_Ntiva_Internal_East/providers/Microsoft.Sql/servers/ntazintsql/databases/MITELCALLROUTE/overview) has been created to store all known phone numbers of clients / contacts in Connectwise Manage. 

## Database Details

* Database Name: [MITELCALLOROUTE](https://portal.azure.com/#@ntiva.net/resource/subscriptions/140c0639-524b-4e65-a7f1-f490039f13f1/resourceGroups/Azure_Ntiva_Internal_East/providers/Microsoft.Sql/servers/ntazintsql/databases/MITELCALLROUTE/overview)
* Server: [NTAZINTSQL](https://portal.azure.com/#@ntiva.net/resource/subscriptions/140c0639-524b-4e65-a7f1-f490039f13f1/resourceGroups/Azure_Ntiva_Internal_East/providers/Microsoft.Sql/servers/ntazintsql)
* Table: AniLookup

### Table Schema Mapping

| Azure Database Property | Connectwise Property |
| --- | --- |
| ObjectId | Contact.Id |
| ContactName | Contact.firstName + ' ' + Contact.lastName |
| CompanyName | Contact.company.name |
| ObjectType | 'Contact' / 'Company' |
| PhoneType | Contact.CommunicationItems.Type ['Home','Direct','Mobile','Office'] |
| Number | Contact.CommunicationItems.Value |
| Queue | Company.CustomFields.'PBX Route To' |
| CSC | Company.CustomFields.'CSC Rollover' |
| Active | if (Contact.inactiveFlag) {0} else {1} |
| ModifiedDate | NA
| CreatedDate | NA


### Table creation Procedure
```SQL
-- Create AniLookup table
CREATE TABLE AniLookup (
    ID INT IDENTITY(1,1) PRIMARY KEY,          -- Unique row identifier (auto-increment)
    Number BIGINT NOT NULL,                    -- Phone number (10 or 11 digits)
    Queue INT NOT NULL,                        -- MiConnect queue assignment
    
    -- ConnectWise Manage object references
    ObjectType NVARCHAR(20) NOT NULL,          -- 'Company' or 'Contact'
    ObjectID INT NOT NULL,                     -- ConnectWise Company ID or Contact ID
    
    -- Additional ConnectWise fields for easier lookups/debugging
    CompanyName NVARCHAR(100) NULL,            -- Company name for reference
    ContactName NVARCHAR(100) NULL,            -- Contact name (if applicable)
    
    -- Phone number metadata
    PhoneType NVARCHAR(20) NULL,               -- 'Main', 'Direct', 'Mobile', 'Fax', 'Home', etc.
    CSC NVARCHAR(50) NULL,                     -- Custom field for CSC data
    IsActive BIT DEFAULT 1,                    -- Enable/disable without deleting
    
    -- Audit fields
    CreatedDate DATETIME2 DEFAULT GETDATE(),
    ModifiedDate DATETIME2 DEFAULT GETDATE(),
    LastSyncDate DATETIME2 NULL,               -- When last synced from ConnectWise
    
    -- Constraints
    CONSTRAINT CHK_ObjectType CHECK (ObjectType IN ('Company', 'Contact')),
    CONSTRAINT CHK_ContactFields CHECK (
        (ObjectType = 'Contact' AND ContactName IS NOT NULL) OR
        (ObjectType = 'Company' AND ContactName IS NULL) -- If ObjectType is 'Company', ContactName should be NULL
    ),
);

-- *** ADD CSC COLUMN TO EXISTING TABLE ***
-- Run this if you already have the table and just need to add CSC column:
-- ALTER TABLE AniLookup ADD CSC NVARCHAR(50) NULL;

-- Create indexes for performance
CREATE INDEX IX_AniLookup_Number ON AniLookup (Number);
CREATE INDEX IX_AniLookup_Queue ON AniLookup (Queue);
CREATE INDEX IX_AniLookup_ObjectType_ObjectID ON AniLookup (ObjectType, ObjectID);
CREATE INDEX IX_AniLookup_IsActive ON AniLookup (IsActive);

-- Composite index for number lookup with company preference
CREATE INDEX IX_AniLookup_Number_ObjectType ON AniLookup (Number, ObjectType, IsActive);
```

## Table Population Automation

An Azure Automation PowerShell runbook handles the Anilookup table population and daily updates.

* Runbook Name: **UpdateCallRouteTable**
* Automation Account: [**aa-hybridsherwebapi**](https://portal.azure.com/#@ntiva.net/resource/subscriptions/140c0639-524b-4e65-a7f1-f490039f13f1/resourceGroups/rg-hybridRW/providers/Microsoft.Automation/automationAccounts/aa-hybridsherwebapi/overview)
* Hybrid Worker: **vm-hybridRW**

### Process Flow
1. Get All Companies from Connectwise Manage in status ['Active', 'Custom Alert', 'Offboarding' , 'Accounting Hold']
2. For each company
    * Create a hashmap with key of *Company Id* for *'PBX Route To'* and *'CSC Roll Over'* values
    * Get all contacts (both active and inactive)
3. For each contact
    * Parse each phone number under communication items
        * If contact has no phone numbers - Skip
    * For each phone number
        * Create object with database property mapping of the contact / company properties

### Automation Diagram
```Mermaid
graph TB
    Start([Start Script]) --> Init[Initialize Sentry Monitoring]
    Init --> Creds[Load Credentials<br/>- DB Password<br/>- CW API Keys<br/>- Client ID]
    
    Creds --> TestMode{Testing Mode?}
    TestMode -->|Yes| GetSecret[Get Secrets from<br/>Local Store]
    TestMode -->|No| GetAuto[Get Secrets from<br/>Automation Variables]
    
    GetSecret --> Auth
    GetAuto --> Auth
    
    Auth[Set CW Authorization Headers] --> FetchCompanies[Fetch Companies from ConnectWise<br/>Status: Active/Custom Alert/<br/>Accounting Hold/Offboarding]
    
    FetchCompanies --> BuildHash[Build Hash Tables<br/>- QueueHash: Company ID → PBX Route<br/>- CSCHash: Company ID → CSC Rollover]
    
    BuildHash --> ParallelFetch[Parallel Fetch Contacts<br/>ThrottleLimit: 20]
    
    ParallelFetch --> ProcessContacts[Process Contact Entries]
    ProcessContacts --> FilterPhone1[Filter Valid Phone Numbers<br/>- Home, Direct, Mobile, Office<br/>- Remove non-numeric chars]
    
    FilterPhone1 --> ContactEntry[Create Contact Entries<br/>- ObjectID, Name, Company<br/>- Phone Type, Number<br/>- Queue, CSC, Active Status]
    
    BuildHash --> ProcessCompanies[Process Company Entries]
    ProcessCompanies --> FilterPhone2[Filter Valid Company<br/>Phone Numbers]
    
    FilterPhone2 --> CompanyEntry[Create Company Entries<br/>- ObjectID, Company Name<br/>- Phone Number<br/>- Queue, CSC]
    
    ContactEntry --> Merge[Merge & Deduplicate<br/>All Entries]
    CompanyEntry --> Merge
    
    Merge --> DBConnect[Connect to Azure SQL<br/>Server: ntazintsql.database.windows.net<br/>Database: MITELCALLROUTE]
    
    DBConnect --> ClearTable[Clear AniLookup Table<br/>Delete All Existing Rows]
    
    ClearTable --> BatchInsert[Batch Insert New Data<br/>BatchSize: 250 records<br/>Using MERGE statement]
    
    BatchInsert --> Success{Operation<br/>Successful?}
    Success -->|Yes| Report[Report Metrics<br/>- Records Processed<br/>- Duration<br/>- Records/Second]
    Success -->|No| SentryError[Log Error to Sentry]
    
    Report --> End([End])
    SentryError --> End
    
    subgraph Database Functions
        GetData[Get-AniLookupData<br/>Query with filters]
        SetData[Set-AniLookupData<br/>Single record upsert]
        SetBatch[Set-AniLookupDataBatched<br/>Bulk upsert with MERGE]
        RemoveData[Remove-AniLookupData<br/>Delete specific records]
        ClearData[Clear-AniLookupData<br/>Delete all records]
    end
    
    subgraph Data Structure
        AniTable[AniLookup Table<br/>- Number: Phone number<br/>- Queue: PBX route<br/>- ObjectType: Company/Contact<br/>- ObjectID: CW ID<br/>- CompanyName<br/>- ContactName<br/>- PhoneType<br/>- CSC: Rollover code<br/>- IsActive: Status<br/>- ModifiedDate]
    end
```

## Mitel MiContact Workflows

Two workflows are used

* Ntiva Existing Ticket ANI Lookup by Database
    * If number matches existing row in AniLookupTable, return and route to 'CSC' column value. This is equivalent to the CSC Rollover property in Connectwise Manage
* Ntiva New Ticket ANI Lookup by Database
    * If number matches existing row in AniLookupTable, return and route to 'Queue' column value. This is equivalent to the PBX Route To property in Connectwise Manage.
* In either case, the the incoming phone number (ANI) is not matched, transfer to CQ Client Service 1 (27699)

### SQL Query Used In Workflows

```SQL
SELECT TOP 1 
    Queue, 
    ObjectType, 
    CASE 
        WHEN ObjectType = 'Company' THEN CompanyName 
        WHEN ObjectType = 'Contact' THEN ContactName + ' (' + CompanyName + ')' 
    END as DisplayName 
FROM AniLookup 
WHERE (Number = CAST(@ANI AS BIGINT) 
       OR (LEN(@ANI) = 11 AND LEFT(@ANI, 1) = '1' AND Number = CAST(RIGHT(@ANI, 10) AS BIGINT))) -- Normalize Number
ORDER BY 
    CASE WHEN ObjectType = 'Company' THEN 1 ELSE 2 END;  -- Company first
```

