# Azure Group Sync

## Overview
Automatically synchronizes Azure AD group memberships based on employee attributes such as department, location, and role. This automation runs daily to ensure group memberships are always up to date.

## How It Works
1. Timer trigger runs daily at 2 AM UTC
2. Azure Function queries Azure AD for all users
3. Logic evaluates user attributes against group membership rules
4. Group memberships are added or removed as needed
5. All changes are logged to Log Analytics

## Business Value
- Saves 40 hours per month in manual group management
- Reduces security risks from stale group memberships
- Ensures consistent access control across the organization
- Annual value: $12,000

## Technical Details
- **Platform**: Azure Functions (PowerShell)
- **Authentication**: Managed Identity with Azure AD permissions
- **Permissions Required**:
  - `Group.ReadWrite.All`
  - `User.Read.All`

## Monitoring
- Sentry alerts for execution failures
- Daily success/failure notifications in Teams
- Log Analytics dashboard for audit trail
