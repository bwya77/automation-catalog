# Next Steps for Automation Catalog Deployment

This document outlines all the steps needed to complete the setup and deployment of the Automation Catalog to Azure Static Web Apps.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Azure Setup](#azure-setup)
3. [GitHub Repository Setup](#github-repository-setup)
4. [GitHub Environment Variables](#github-environment-variables)
5. [Initial Deployment](#initial-deployment)
6. [Adding New Automations](#adding-new-automations)
7. [Local Development](#local-development)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:
- ✅ An active Azure subscription
- ✅ A GitHub account with this repository
- ✅ Azure CLI installed (optional, but recommended)
- ✅ Node.js 20+ and pnpm installed for local development

---

## Azure Setup

### Step 1: Create Azure Static Web App Resource

1. **Via Azure Portal:**
   - Navigate to [Azure Portal](https://portal.azure.com)
   - Click **"Create a resource"**
   - Search for **"Static Web App"**
   - Click **"Create"**

2. **Configure the Static Web App:**
   - **Subscription:** Select your Azure subscription
   - **Resource Group:** Create new or select existing (e.g., `rg-automation-catalog`)
   - **Name:** Choose a unique name (e.g., `automation-catalog-prod`)
   - **Plan type:** Select **"Free"** (suitable for static sites) or **"Standard"** (for advanced features)
   - **Region:** Select the region closest to your users (e.g., `East US 2`)
   - **Deployment details:**
     - **Source:** GitHub
     - **Organization:** Your GitHub username/org
     - **Repository:** automation-catalog
     - **Branch:** main

3. **Build Configuration:**
   - **Build Presets:** Custom
   - **App location:** `/`
   - **Api location:** (leave empty)
   - **Output location:** `dist`

4. Click **"Review + create"** then **"Create"**

5. **Important:** After creation, navigate to your Static Web App resource and copy the **Deployment Token** (you'll need this for GitHub Secrets)

### Step 2: Get Deployment Token

Option A - Via Azure Portal:
1. Navigate to your Static Web App resource
2. Go to **"Overview"** or **"Manage deployment token"**
3. Click **"Manage deployment token"**
4. Copy the deployment token (keep this secure!)

Option B - Via Azure CLI:
```bash
az staticwebapp secrets list \
  --name automation-catalog-prod \
  --resource-group rg-automation-catalog \
  --query properties.apiKey \
  --output tsv
```

---

## GitHub Repository Setup

### Step 1: Configure Repository Settings

1. Navigate to your GitHub repository: `https://github.com/<your-username>/automation-catalog`
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

### Step 2: Add GitHub Secrets

Add the following secret:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | `<your-deployment-token>` | The deployment token from Azure Static Web Apps |

**How to add:**
1. Click **"New repository secret"**
2. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
3. Secret: Paste the deployment token from Azure
4. Click **"Add secret"**

---

## Initial Deployment

### Step 1: Install Dependencies Locally

Before pushing to GitHub, test locally:

```bash
# Navigate to project directory
cd automation-catalog

# Install dependencies
pnpm install

# Run dev server
pnpm run dev
```

Visit `http://localhost:4321` to verify the site works locally.

### Step 2: Commit and Push

```bash
# Add all files
git add .

# Commit changes
git commit -m "Initial automation catalog setup"

# Push to main branch
git push origin main
```

### Step 3: Monitor Deployment

1. Go to your GitHub repository
2. Click on **"Actions"** tab
3. You should see the **"Deploy to Azure Static Web Apps"** workflow running
4. Click on the workflow run to see detailed logs
5. Once complete (green checkmark), your site is live!

### Step 4: Access Your Site

Your site will be available at:
- **Production URL:** `https://<your-static-web-app-name>.azurestaticapps.net`
- You can also configure a custom domain in Azure Portal under Static Web App → **Custom domains**

---

## Adding New Automations

### Step 1: Create Automation Folder

```bash
mkdir -p automations/your-automation-name
```

### Step 2: Create metadata.yaml

Create `automations/your-automation-name/metadata.yaml`:

```yaml
name: Your Automation Name
author: bradley-wyatt  # Must match ID from data/engineers.yaml
department: it  # sales, it, hr, finance, or operations
description: Brief description of what this automation does
tags:
  - azure
  - python
  - ai
systems:
  - Azure Functions
  - System 2
time_saved_hours_per_month: 40
annual_value_usd: 12000
created: 2024-11-15
last_updated: 2025-10-29
links:
  runbook: https://docs.example.com/runbooks/your-automation
  sentry: https://sentry.io/your-project
  repo: https://dev.azure.com/your-org/_git/your-repo
api_keys:
  - name: API_KEY_NAME
    system: Azure
    expiration: 2026-06-01
    notes: Optional notes about this credential
```

### Step 3: Create diagram.svg

Export your draw.io diagram as SVG and save it as:
```
automations/your-automation-name/diagram.svg
```

### Step 4: Create README.md (Optional)

Create `automations/your-automation-name/README.md` with detailed documentation.

### Step 5: Commit and Deploy

```bash
git add automations/your-automation-name
git commit -m "Add your-automation-name automation"
git push origin main
```

The site will automatically rebuild and deploy!

---

## Local Development

### Running the Dev Server

```bash
# Install dependencies (first time only)
pnpm install

# Start dev server with hot reload
pnpm run dev

# Build for production (test before deploying)
pnpm run build

# Preview production build locally
pnpm run preview
```

### Project Structure

```
automation-catalog/
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml    # Deployment workflow
├── automations/                          # Your automation metadata
│   ├── azure-group-sync/
│   │   ├── metadata.yaml
│   │   ├── diagram.svg
│   │   └── README.md
│   └── ...
├── data/                                 # Reference data
│   ├── departments.yaml
│   ├── engineers.yaml
│   └── tags.yaml
├── public/                               # Static assets
│   └── favicon.svg
├── src/
│   ├── components/                       # Reusable components
│   ├── layouts/                          # Page layouts
│   ├── pages/                            # Route pages
│   ├── styles/                           # Global styles
│   └── utils/                            # Helper functions
├── astro.config.mjs                      # Astro configuration
├── package.json                          # Dependencies
├── tailwind.config.mjs                   # Tailwind CSS config
└── tsconfig.json                         # TypeScript config
```

### Updating Reference Data

**Add a new engineer:**
Edit `data/engineers.yaml`:
```yaml
engineers:
  - id: john-doe
    name: John Doe
    role: DevOps Engineer
    avatar: /assets/avatars/john.png
```

**Add a new department:**
Edit `data/departments.yaml`:
```yaml
departments:
  - id: marketing
    name: Marketing
    description: Marketing automations
```

**Add a new tag:**
Edit `data/tags.yaml`:
```yaml
tags:
  - id: kubernetes
    name: Kubernetes
    color: '#326CE5'
```

---

## Troubleshooting

### Build Fails in GitHub Actions

1. **Check the Actions tab** for detailed error logs
2. **Common issues:**
   - Invalid YAML in metadata files
   - Missing required fields in metadata.yaml
   - TypeScript errors in custom components

**Fix:** Run `pnpm run build` locally to catch errors before pushing

### Deployment Token Invalid

**Symptoms:** GitHub Actions fails with authentication error

**Solution:**
1. Regenerate the deployment token in Azure Portal
2. Update the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret in GitHub
3. Re-run the failed workflow

### Site Not Updating After Push

1. Check **Actions** tab to verify the workflow ran
2. Verify the workflow completed successfully (green checkmark)
3. Clear browser cache or try incognito mode
4. Azure Static Web Apps may take 1-2 minutes to update

### API Keys Not Showing on Calendar

**Check:**
1. Ensure `api_keys` section exists in metadata.yaml
2. Verify `expiration` field is in `YYYY-MM-DD` format
3. Rebuild the site: `git commit --allow-empty -m "Rebuild" && git push`

### Local Dev Server Won't Start

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Check Node.js version (must be 20+)
node --version

# Try running with verbose logging
pnpm run dev --verbose
```

---

## Optional: Custom Domain Setup

### Step 1: Add Custom Domain in Azure

1. Navigate to your Static Web App in Azure Portal
2. Go to **Custom domains**
3. Click **"+ Add"**
4. Choose **"Custom domain on other DNS"**
5. Enter your domain (e.g., `automations.yourdomain.com`)

### Step 2: Configure DNS

Add a CNAME record in your DNS provider:
- **Type:** CNAME
- **Name:** automations (or your subdomain)
- **Value:** `<your-static-web-app-name>.azurestaticapps.net`
- **TTL:** 3600 (or automatic)

### Step 3: Validate

1. Return to Azure Portal
2. Click **"Validate"**
3. Once validated, your site will be available at your custom domain
4. SSL certificate is automatically provisioned (may take up to 10 minutes)

---

## Monitoring and Maintenance

### View Application Insights (Optional)

1. In Azure Portal, navigate to your Static Web App
2. Go to **Application Insights**
3. Click **"Enable"** to track:
   - Page views
   - Performance metrics
   - User analytics

### Update Dependencies

Run periodically to keep dependencies up-to-date:

```bash
# Update all dependencies
pnpm update

# Check for outdated packages
pnpm outdated

# Test after updates
pnpm run build
```

### Backup Your Data

Your automation data is stored in Git, but consider:
1. Keeping draw.io source files in a separate folder
2. Documenting any custom configuration changes
3. Exporting automation data periodically for reports

---

## Security Best Practices

1. **Never commit secrets** - Keep all API keys and tokens in Azure Key Vault or environment variables
2. **Review access** - Regularly audit who has access to the GitHub repo and Azure subscription
3. **Update credentials** - Use the calendar view to track and rotate API keys before expiration
4. **Enable branch protection** - Require pull request reviews for the main branch
5. **Monitor logs** - Set up alerts in Azure for failed deployments

---

## Support and Resources

- **Astro Documentation:** https://docs.astro.build
- **Azure Static Web Apps Docs:** https://learn.microsoft.com/azure/static-web-apps/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Project Issues:** Report issues in your GitHub repository

---

## Summary Checklist

Before considering the setup complete:

- [ ] Azure Static Web App resource created
- [ ] Deployment token added to GitHub Secrets
- [ ] Initial deployment successful (check Actions tab)
- [ ] Site accessible at Azure URL
- [ ] All example automations visible on dashboard
- [ ] Calendar view showing API key expirations
- [ ] Filtering works on /automations page
- [ ] Individual automation pages load correctly
- [ ] (Optional) Custom domain configured
- [ ] (Optional) Application Insights enabled
- [ ] Team members added to data/engineers.yaml
- [ ] Documentation shared with team

---

**You're all set!** 🎉

Your Automation Catalog is now live and ready to track all your DevOps automations. Start adding your real automation data and share the site with your team.
