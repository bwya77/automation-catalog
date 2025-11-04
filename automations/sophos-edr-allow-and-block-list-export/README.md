# Disable Computer when User Gets Locked-Out

## Overview
Automation that disables a computer when a user gets locked out. It monitors Azure/Microsoft 365 signals for user lockout events, looks up devices associated with the affected user, and disables the device(s) (via Microsoft Graph / Intune) to limit risk and enable security investigation/response.

## Metadata
- Name: Disable Computer when User Gets Locked-Out  
- Author: derek-lee  
- Department: security  
- Customer: internal  
- Status: live  
- Description: Automation that will disable a computer when a user gets locked out.  
- Tags: azure, powershell  
- Systems: Azure  
- Time saved (hours/month): 375  
- Annual value (USD): 700  
- Created: 2025-09-09  
- Last updated: 2025-10-15  
- Closed: 2025-09-17

## Links
- Source Code: https://gitlab.com/  
- Runbook: https://runbooks.example.com/disable-computer-on-lockout

## API Keys / Credentials
- Microsoft_Graph_API_Key_1 (system: Microsoft 365)  
   - Expiration: 2026-06-10  
   - Notes: Directory.Read.All permission for Microsoft Graph API  
   - Management portal: https://portal.azure.com/

---

## Requirements
* PowerShell 7+  
* Registered Azure AD app with Microsoft Graph permissions:
   - Directory.Read.All (to enumerate user devices/users)
   - DeviceManagementManagedDevices.ReadWrite (to manage devices via Intune) or Device.ReadWrite.All depending on approach
* Network access to Microsoft Graph (https://graph.microsoft.com)  
* Optional: Azure Monitor / Sentinel or Event Grid subscription to forward lockout alerts to the automation trigger
* Logging/Notification channel (e.g., Teams, email, SIEM)

## High-level Automation Flow

1. Triggered by a "user lockout" event
    - Source can be Azure AD sign-in logs, Azure Monitor alert, Microsoft Sentinel analytic rule, or Event Grid.
2. Validate event and extract the affected user principal (UPN / objectId).
3. Acquire a Microsoft Graph access token (client credentials flow) using the registered app credentials.
4. Query Graph to enumerate devices associated with the user:
    - /users/{id}/registeredDevices
    - /users/{id}/ownedDevices
    - or use Intune managed devices queries to map to corporate devices.
5. Apply policy decision (e.g., only disable corporate-managed devices, skip BYOD).
6. For each target device, call Graph/Intune API to disable/retire/disable login:
    - Example actions: managedDevices/managedDeviceId/disable, retire, or mark as non-compliant.
7. Record audit log and notify security operators with details of actions taken.
8. Optionally create a ticket or incident in ITSM for manual follow-up and remediation.

---

## Implementation Notes

- Triggering options:
   - Azure Monitor alert that fires on sign-in/logon failure thresholds.
   - Microsoft Sentinel analytic rule that emits an alert on account lockouts.
   - Event Grid subscription for Azure AD Activity Logs if available.
- Safety checks:
   - Whitelist service accounts, break-glass accounts, and emergency admin accounts.
   - Require device to be corporate-managed (Intune managed) before disabling.
   - Rate-limit and retry on transient Graph errors (HTTP 429/5xx).
   - Preserve auditability: store request/response and decision rationale.
- Idempotency:
   - Track actions taken per user/event to avoid repeated disables for the same incident.
- Notifications:
   - Immediate alert to security ops with user, device, action, and timestamp.
   - Optionally notify device owner / helpdesk.

---

### Step-by-step Script Breakdown

| # | Action | What the script does |
|---|--------|----------------------|
| 1 | Set configuration | Load variables: TenantId, ClientId, ClientSecret (or certificate), Graph scope, allowed device types, export/log path. |
| 2 | Define helper functions | `Get-GraphToken`, `Get-UserDevices`, `Disable-ManagedDevice`, `Send-Notification`, `Log-Action`. |
| 3 | Event handler / trigger | Accepts a lockout event payload (UPN / userId / event timestamp). |
| 4 | Validate event | Confirm event source and not a duplicate; check whitelist. |
| 5 | Acquire token | `Get-GraphToken` performs client credentials flow against `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`. |
| 6 | Enumerate devices | `Get-UserDevices -UserId` calls Graph to list registered/managed devices and maps to Intune managedDevice ids if applicable. |
| 7 | Filter targets | Keep only corporate-managed devices and those meeting configured criteria (OS, management state). |
| 8 | Apply action | For each target device call `Disable-ManagedDevice` (Graph/Intune endpoint). Handle HTTP 403/404/429 with retry/backoff. |
| 9 | Record audit | `Log-Action` stores event, device id, action, success/failure and API responses. |
|10 | Notify | `Send-Notification` posts summary to security channel and creates a ticket if configured. |
|11 | Exit | Return a structured result for the pipeline (success/failure and artifacts). |

---

## Result
- When triggered, the automation will:
   - Disable corporate-managed device(s) associated with the locked-out user.
   - Produce an audit record and notify security operations.
   - Reduce time to contain potential compromise and accelerate remediation.

---

## Operational Considerations
- Test in a staged environment before production.  
- Maintain allowlist/exception lists to avoid impacting critical accounts or services.  
- Ensure least-privilege permissions for the app; rotate credentials per org policy.  
- Monitor failures and adjust thresholds for triggering to balance security and availability.

For implementation details, runbook, and source code, see the links above.
