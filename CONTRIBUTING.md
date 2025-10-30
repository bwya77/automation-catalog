# Contributing to the Automation Catalog

This guide will walk you through adding a new automation to the catalog. When you add a new automation, all dashboard metrics and charts will automatically update!

## Table of Contents
- [Quick Start](#quick-start)
- [Step-by-Step Guide](#step-by-step-guide)
- [Metadata Reference](#metadata-reference)
- [Creating Diagrams](#creating-diagrams)
- [Best Practices](#best-practices)

---

## Quick Start

**Adding a new automation takes 3 simple steps:**

1. Create a folder in `automations/your-automation-name/`
2. Add a `metadata.yaml` file with automation details
3. Add a `diagram.svg` file (exported from draw.io)
4. Commit and push - that's it! 🎉

The dashboard automatically updates with:
- ✅ Total automation count
- ✅ Time saved calculations
- ✅ Annual value totals
- ✅ Time saved trend chart
- ✅ Expiring API keys calendar
- ✅ Department breakdowns

---

## Step-by-Step Guide

### Step 1: Create Your Automation Folder

```bash
# Navigate to the automations directory
cd automations/

# Create a new folder (use lowercase with hyphens)
mkdir my-awesome-automation

# Create the required files
cd my-awesome-automation/
touch metadata.yaml
touch diagram.svg
touch README.md  # Optional but recommended
```

**Folder naming conventions:**
- ✅ `azure-vm-backup` (lowercase, hyphens)
- ✅ `m365-license-cleanup` (lowercase, hyphens)
- ❌ `Azure_VM_Backup` (no uppercase or underscores)
- ❌ `m365 license cleanup` (no spaces)

---

### Step 2: Create metadata.yaml

Copy this template and fill in your automation's details:

```yaml
name: Your Automation Name
author: your-engineer-id  # Must match an ID from data/engineers.yaml
department: it  # Options: sales, it, hr, finance, operations
description: A brief description of what this automation does (1-2 sentences)

tags:
  - azure
  - python
  - ai

systems:
  - Azure Functions
  - Microsoft Graph API
  - SharePoint

time_saved_hours_per_month: 40
annual_value_usd: 12000

created: 2024-11-15
last_updated: 2025-10-29

links:
  runbook: https://docs.example.com/runbooks/your-automation
  sentry: https://sentry.io/your-project/your-automation
  repo: https://dev.azure.com/org/_git/your-automation

api_keys:
  - name: AZURE_CLIENT_SECRET
    system: Azure AD
    expiration: 2026-06-01
    notes: App registration for Graph API access
    link: https://itglue.example.com/passwords/12345  # Optional: Link to credential in IT Glue or other password manager
  - name: SHAREPOINT_SECRET
    system: SharePoint
    expiration: 2025-12-15
    notes: Client credentials for SharePoint access
    link: https://itglue.example.com/passwords/67890
```

---

### Step 3: Create Your Diagram

**Using draw.io:**

1. Go to [draw.io](https://app.diagrams.net/)
2. Create your automation flow diagram
3. Use these recommended elements:
   - **Rectangles** for processes/services
   - **Cylinders** for databases
   - **Arrows** for data flow
   - **Colors** for different systems:
     - Blue (#4A90E2) for Azure services
     - Green (#10A37F) for AI services
     - Orange (#D83B01) for M365 services
4. **Export as SVG:**
   - File → Export as → SVG
   - ✅ Check "Embed Fonts"
   - ✅ Check "Include a copy of my diagram"
   - Save as `diagram.svg`

**Example diagram structure:**
```
[Timer Trigger] → [Azure Function] → [External API]
                        ↓
                  [Azure SQL Database]
                        ↓
                  [Power BI Dashboard]
```

5. Move the exported `diagram.svg` to your automation folder

---

### Step 4: Create README.md (Optional)

Add detailed documentation about your automation:

```markdown
# Your Automation Name

## Overview
Detailed description of what this automation does and why it was created.

## How It Works
1. Step-by-step explanation
2. Of the automation flow
3. And key processes

## Business Value
- Saves X hours per month
- Reduces errors by Y%
- Improves process Z

## Technical Details
- **Platform**: Azure Functions (Python)
- **Authentication**: Managed Identity
- **Permissions Required**:
  - `Permission.One`
  - `Permission.Two`

## Monitoring
- Sentry alerts for failures
- Weekly summary emails
- Metrics dashboard in Power BI

## Troubleshooting
Common issues and solutions...
```

---

### Step 5: Update Reference Data (If Needed)

#### Adding a New Engineer

Edit `data/engineers.yaml`:

```yaml
engineers:
  - id: john-doe  # Use this ID in metadata.yaml author field
    name: John Doe
    role: DevOps Engineer
    avatar: /assets/avatars/john.png  # Optional
```

#### Adding a New Department

Edit `data/departments.yaml`:

```yaml
departments:
  - id: marketing
    name: Marketing
    description: Marketing automation projects
```

#### Adding a New Tag

Edit `data/tags.yaml`:

```yaml
tags:
  - id: kubernetes
    name: Kubernetes
    color: '#326CE5'
```

---

### Step 6: Test Locally

```bash
# From project root
npm install  # If first time
npm run dev
```

Open http://localhost:4321 and verify:
- ✅ Your automation appears in the catalog
- ✅ Dashboard metrics updated
- ✅ Time saved increased
- ✅ Diagram displays correctly
- ✅ All links work
- ✅ API key expirations show in calendar

---

### Step 7: Commit and Deploy

```bash
# Add your new automation
git add automations/your-automation-name/

# If you added new engineers/departments/tags
git add data/

# Commit with a descriptive message
git commit -m "Add your-automation-name automation"

# Push to GitHub
git push origin main
```

**GitHub Actions will automatically:**
1. Build the site
2. Deploy to Azure Static Web Apps
3. Your automation will be live in ~2 minutes! 🚀

---

## Metadata Reference

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | String | Display name of automation | `"Azure VM Backup"` |
| `author` | String | Engineer ID from `engineers.yaml` | `"bradley-wyatt"` |
| `department` | String | Department ID | `"it"` (sales, it, hr, finance, operations) |
| `description` | String | Brief description (1-2 sentences) | `"Automated backup of Azure VMs..."` |
| `tags` | Array | Technology tags | `["azure", "powershell"]` |
| `systems` | Array | Integrated systems | `["Azure Functions", "Azure AD"]` |
| `time_saved_hours_per_month` | Number | Hours saved monthly | `40` |
| `annual_value_usd` | Number | Annual dollar value | `12000` |
| `created` | Date | Creation date (YYYY-MM-DD) | `"2024-11-15"` |
| `last_updated` | Date | Last update date (YYYY-MM-DD) | `"2025-10-29"` |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `links.runbook` | URL | Link to runbook documentation |
| `links.sentry` | URL | Link to Sentry monitoring |
| `links.repo` | URL | Link to source code repository |
| `api_keys` | Array | API keys and credentials (see below) |

### API Keys Structure

```yaml
api_keys:
  - name: KEY_NAME               # Environment variable or key name
    system: System Name          # Which system this key is for
    expiration: 2026-06-01      # Expiration date (YYYY-MM-DD) or null
    notes: Optional description  # Additional context
    link: https://itglue.example.com/passwords/12345  # Optional: Link to credential manager (IT Glue, etc.)
```

**Tips for API Keys:**
- Use `null` for `expiration` if the key doesn't expire (e.g., Managed Identity)
- Keys expiring in ≤30 days show in RED on dashboard
- Keys expiring in 31-90 days show in YELLOW
- Add `link` field to provide direct access to the credential in IT Glue or other password managers
- The link opens in a new tab and displays with a key icon on the automation detail page
- All expirations appear in the calendar view

---

## Available Tags

Current tags (from `data/tags.yaml`):

- `azure` - Azure services
- `m365` - Microsoft 365
- `gitlab` - GitLab
- `connectwise` - ConnectWise Manage
- `ai` - AI/Machine Learning
- `azure-functions` - Azure Functions
- `power-automate` - Power Automate
- `powershell` - PowerShell scripts
- `python` - Python applications

**To add a new tag**, edit `data/tags.yaml`:

```yaml
tags:
  - id: new-tag        # Use in metadata.yaml
    name: Display Name # Shows in UI
    color: '#FF5733'   # Hex color code
```

---

## Dashboard Auto-Updates

When you add a new automation, these metrics update automatically:

### 📊 Stats Cards
- **Total Automations**: Counts all automation folders
- **Monthly Time Saved**: Sums all `time_saved_hours_per_month` values
- **Annual Value**: Sums all `annual_value_usd` values
- **Keys Expiring Soon**: Counts API keys expiring in next 90 days

### 📈 Time Saved Trend Chart
- Automatically groups automations by creation month
- Shows cumulative time saved over time
- Updates when you add/modify automations

### 🗓️ Calendar View
- Automatically pulls all `api_keys` with expiration dates
- Groups by month
- Color-codes by urgency (red = ≤30 days, yellow = 31-90 days)

### 👥 Department Breakdown
- Counts automations per department
- Calculates time saved per department
- Updates when you change `department` field

---

## Best Practices

### Writing Good Descriptions
✅ **Good**: "Automatically provisions M365 licenses based on AD group membership, saving manual assignment time"

❌ **Bad**: "License automation"

### Calculating Time Saved
Consider these factors:
- How often the task runs (daily, weekly, monthly)
- Time per manual execution
- Number of people affected

**Example:**
- Manual task takes 30 minutes
- Runs 3 times per week
- Calculation: 30 min × 3 × 4.3 weeks = 387 minutes ≈ 6.5 hours/month

### Calculating Annual Value
Use your hourly rate or average team rate:

**Example:**
- Time saved: 40 hours/month
- Hourly rate: $50/hour
- Monthly value: 40 × $50 = $2,000
- Annual value: $2,000 × 12 = **$24,000**

### Keeping Metadata Current
- Update `last_updated` when you modify the automation
- Update `time_saved_hours_per_month` if efficiency improves
- Add new `api_keys` when you add credentials
- Update expiration dates when you rotate keys

### Diagram Tips
- Keep it simple - focus on key components
- Use consistent colors for similar services
- Add labels to all boxes and arrows
- Show data flow direction clearly
- Include external systems

---

## Validation

Before committing, ensure:

- [ ] Folder name is lowercase with hyphens
- [ ] `metadata.yaml` has all required fields
- [ ] `author` ID exists in `data/engineers.yaml`
- [ ] `department` is valid (sales, it, hr, finance, operations)
- [ ] All dates are in `YYYY-MM-DD` format
- [ ] `diagram.svg` exists and displays correctly
- [ ] All URLs in `links` are valid and accessible
- [ ] API key expirations are accurate
- [ ] `time_saved_hours_per_month` is realistic
- [ ] `annual_value_usd` is calculated correctly

---

## Troubleshooting

### Build Fails After Adding Automation

**Check:**
1. YAML syntax is valid (use [yamllint.com](http://www.yamllint.com/))
2. All required fields are present
3. Dates are in correct format
4. Author ID exists in `engineers.yaml`
5. No special characters in folder name

**Test locally:**
```bash
npm run build
```

### Automation Doesn't Appear on Site

**Verify:**
1. Folder is in `automations/` directory
2. `metadata.yaml` is named correctly (not `metadata.yml`)
3. No syntax errors in YAML
4. File was committed and pushed
5. GitHub Actions deployment succeeded

**Check GitHub Actions:**
- Go to repository → Actions tab
- Look for errors in latest workflow run

### Diagram Doesn't Display

**Solutions:**
1. Ensure file is named `diagram.svg`
2. Re-export from draw.io with "Embed Fonts" checked
3. Verify SVG file isn't empty (should be >1KB)
4. Check browser console for errors

### API Keys Don't Show in Calendar

**Verify:**
1. `api_keys` section exists in `metadata.yaml`
2. `expiration` field is in `YYYY-MM-DD` format
3. Expiration date is within 90 days (for dashboard widget)
4. No typos in YAML structure

---

## Examples

See the `automations/` folder for complete examples:

- `azure-group-sync/` - Azure AD automation
- `cw-sales-order-sync/` - AI-powered data sync
- `m365-user-provisioning/` - M365 provisioning workflow

Each example includes:
- Complete `metadata.yaml`
- Professional `diagram.svg`
- Detailed `README.md`

---

## Support

**Having issues?**
1. Check this guide first
2. Review example automations
3. Test locally with `npm run dev`
4. Check GitHub Actions logs
5. Ask the team in #devops-automation channel

---

## Summary Checklist

Adding a new automation:

```bash
# 1. Create folder and files
mkdir automations/my-automation
cd automations/my-automation
touch metadata.yaml diagram.svg README.md

# 2. Fill in metadata.yaml (see template above)
# 3. Create and export diagram.svg from draw.io
# 4. Write README.md (optional)

# 5. Test locally
npm run dev

# 6. Commit and push
git add automations/my-automation/
git commit -m "Add my-automation"
git push origin main

# 7. Verify deployment
# Check GitHub Actions → Wait for green checkmark
# Visit site → See your automation listed!
```

**That's it! Your automation is now part of the catalog and all metrics update automatically! 🎉**
