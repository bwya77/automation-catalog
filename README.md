
# Automation Catalog

A central hub for discovering, tracking, and visualizing all automations built by the DevOps Automation team.  
This platform provides visibility into every automation’s purpose, ownership, value, dependencies, and key lifecycle data — all in one place.

---

## 🚀 Overview

The **Automation Catalog** is a static site built from structured metadata and diagrams stored in this repository.  
It enables the team to easily:

- Browse all automations by department, engineer, or system
- View and search automation metadata (time saved, author, date created, etc.)
- Track API key and permission expirations with visual reminders
- View automation architecture diagrams (SVG from draw.io)
- Filter by technologies (e.g., Azure, Graph API, ConnectWise, AI, etc.)
- Quickly access runbooks, source code, or monitoring dashboards
- Visualize time-saved trends and upcoming expirations with graphs and calendars

---

## 🏗️ Project Structure

```

automation-catalog/
├── automations/
│   ├── azure-group-sync/
│   │   ├── metadata.yaml
│   │   ├── diagram.svg
│   │   └── README.md
│   ├── cw-sales-order-sync/
│   │   ├── metadata.yaml
│   │   ├── diagram.svg
│   │   └── README.md
│   └── ...
├── data/
│   ├── departments.yaml
│   ├── engineers.yaml
│   ├── tags.yaml
│   ├── emojis.yaml
│   └── version.yaml
├── docs/
│   ├── Getting_Started.md
│   └── Adding_Automations.md
├── schemas/
│   └── *.schema.json
├── public/
│   └── assets/
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   └── utils/
├── package.json
├── astro.config.mjs
└── README.md

````

---

## 🧩 Data Structure

Each automation has its own folder under `/automations/` containing:

**metadata.yaml**
```yaml
name: CW Sales Order Sync
author: bradley-wyatt  # Must match ID from data/engineers.yaml
department: sales
customer: "Example Customer"  # Optional: for filtering by customer
status: live  # Options: live, development, backlog
description: Automates synchronization of sales orders between ConnectWise and Azure
tags:
  - azure
  - connectwise
  - ai
systems:
  - ConnectWise Manage
  - Azure Functions
time_saved_hours_per_month: 120
annual_value_usd: 18000
created: 2024-06-01
last_updated: 2025-10-15
closed: 2024-06-15  # Date automation went live (used for metrics)
links:
  - name: Runbook
    url: https://docs.example.com/runbooks/cw-sales-order-sync
  - name: Sentry
    url: https://sentry.io/project/cw-sales-order-sync
  - name: Source Code
    url: https://dev.azure.com/org/_git/cw-sales-order-sync
schedules:
  - frequency: Daily at 2 AM
api_keys:
  - name: CW_API
    system: ConnectWise
    expiration: 2026-01-01
    notes: ConnectWise API credentials
    url: https://itglue.example.com/passwords/123
````

**diagram.svg**

* The automation flow exported directly from draw.io

**README.md**

* Optional detailed explanation or notes

---

## 🧠 Features

### 📂 Catalog Browsing

* List all automations with advanced filtering
* Filter by:
  * Customer (global filter across all pages)
  * Department
  * Status (Live, Development, Backlog)
  * Tags (e.g., AI, Azure, M365)
  * System integration

### 📊 Analytics Dashboard

* **Time series chart** showing cumulative time saved and value over time
* **Total metrics** for LIVE automations only:
  * Total automations count
  * Monthly time saved
  * Annual value
  * API keys expiring soon
* **Department breakdown** with time saved and value per department
* **Engineer leaderboard** showing automations per engineer with status badges

### 📅 Calendar View

* API key expirations with visual urgency indicators
* Filter by customer to see customer-specific expirations
* Color-coded by urgency:
  * 🔴 Red: Expiring in ≤30 days
  * 🟡 Yellow: Expiring in 31-90 days

### 🧷 Quick Links

Each automation page includes customizable links such as:

* Runbook documentation
* Monitoring dashboards (Sentry, Application Insights)
* Source repository (Azure DevOps, GitLab, GitHub)
* IT Glue password manager links for API keys

---

## ⚙️ Tech Stack

| Purpose               | Tool                                      |
| --------------------- | ----------------------------------------- |
| Static Site Generator | [Astro](https://astro.build)              |
| Styling               | TailwindCSS                               |
| Charts                | Recharts                                  |
| Calendar              | Custom React Component                    |
| Diagrams              | Mermaid.js                                |
| Hosting               | Azure Static Web Apps (via GitHub Actions) |
| Data Format           | YAML                                      |
| Version Control       | GitHub                                    |

---

## 🔄 Deployment

### Automatic Deployment

Every commit to the `main` branch triggers a GitHub Actions workflow to:

1. Validate YAML metadata structure
2. Build the static site
3. Deploy to **Azure Static Web Apps**

Workflow file: `.github/workflows/azure-static-web-apps.yml`

Example snippet:

```yaml
name: Deploy to Azure Static Web Apps

on:
  push:
    branches: [ main ]
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches: [ main ]

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "dist"
```

### Required GitHub Secrets

- `AZURE_STATIC_WEB_APPS_API_TOKEN`: Deployment token from Azure Static Web Apps resource

---

## 🧪 Local Development

### Prerequisites

* Node.js 20+
* npm (included with Node.js)

### Run Locally

```bash
npm install
npm run dev
```

Then open: `http://localhost:4321`

---

## 📘 Adding New Automations

**Want to add a new automation to the catalog?** See **[docs/Adding_Automations.md](docs/Adding_Automations.md)** for the complete guide!

**Quick start:**
1. Create folder: `automations/your-automation-name/`
2. Add `metadata.yaml` with automation details
3. Add `diagram.svg` from draw.io
4. Commit and push - the dashboard updates automatically! 🎉

**All metrics auto-update (only LIVE automations counted):**
- ✅ Total automation count (LIVE only)
- ✅ Time saved calculations (LIVE only)
- ✅ Time saved trend chart (based on closed dates)
- ✅ Annual value totals (LIVE only)
- ✅ Department breakdowns (LIVE only)
- ✅ Expiring keys calendar (LIVE automations only)

**Additional Features:**
- 🔍 Filter by customer across all views
- 📊 Dark mode support
- 📅 Calendar view for API key expirations
- 🎨 Customizable emojis via `data/emojis.yaml`
- ✅ YAML schema validation in VSCode

See [docs/Adding_Automations.md](docs/Adding_Automations.md) for detailed instructions, templates, and best practices.

