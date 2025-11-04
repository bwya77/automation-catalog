# Getting Started with Automation Catalog

This guide will walk you through setting up your own instance of the Automation Catalog, from cloning the repository to deploying it as an Azure Static Web App with automatic GitHub Actions deployment.

---

## Prerequisites

Before you begin, make sure you have:

- **Git** installed on your local machine
- **Node.js 20+** and npm installed ([Download Node.js](https://nodejs.org/))
- An **Azure account** with permissions to create resources ([Create free account](https://azure.microsoft.com/free/))
- A **GitHub account** ([Sign up](https://github.com/signup))
- Basic familiarity with command line/terminal
- **VSCode** (recommended) with the YAML extension for schema validation

---

## Step 1: Fork and Clone the Repository

### 1.1 Fork the Repository

1. Navigate to [https://github.com/bwya77/automation-catalog](https://github.com/bwya77/automation-catalog)
2. Click the **Fork** button in the top-right corner
3. Select your GitHub account as the destination
4. Wait for GitHub to create your fork

### 1.2 Clone Your Fork

Open your terminal and clone your forked repository:

```bash
git clone https://github.com/YOUR-USERNAME/automation-catalog.git
cd automation-catalog
```

Replace `YOUR-USERNAME` with your GitHub username.

### 1.3 Verify Local Setup

Install dependencies and test the application locally:

```bash
npm install
npm run dev
```

Open your browser to `http://localhost:4321` to verify the site runs locally. Press `Ctrl+C` to stop the development server when you're done testing.

---

## Step 2: Create an Azure Static Web App

### 2.1 Sign in to Azure Portal

1. Go to [https://portal.azure.com](https://portal.azure.com)
2. Sign in with your Azure account

### 2.2 Create a Resource Group (Optional)

If you don't already have a resource group:

1. In the search bar at the top, type **Resource groups** and select it
2. Click **+ Create**
3. Fill in the details:
   - **Subscription**: Select your subscription
   - **Resource group**: Enter a name (e.g., `automation-catalog-rg`)
   - **Region**: Choose a region close to you (e.g., `East US`)
4. Click **Review + create**, then **Create**

### 2.3 Create the Static Web App

1. In the Azure Portal search bar, type **Static Web Apps** and select it
2. Click **+ Create**
3. Fill in the **Basics** tab:
   - **Subscription**: Select your subscription
   - **Resource Group**: Select the resource group you created (or use an existing one)
   - **Name**: Enter a unique name (e.g., `automation-catalog`)
   - **Plan type**: Select **Free** (perfect for getting started)
   - **Region**: Choose a region (e.g., `East US 2`)
4. In the **Deployment details** section:
   - **Source**: Select **Other**
   - This will allow us to manually configure GitHub Actions with a deployment token
5. Click **Review + create**
6. Review your settings and click **Create**
7. Wait for deployment to complete (usually takes 1-2 minutes)
8. Click **Go to resource** when deployment finishes

---

## Step 3: Get the Deployment Token

### 3.1 Copy the Deployment Token

1. In your Azure Static Web App resource, look for the left sidebar menu
2. Under **Settings**, click on **Overview** (or you may see it directly on the Overview page)
3. Look for **Manage deployment token** button in the toolbar at the top
4. Click **Manage deployment token**
5. A deployment token will appear - click the **Copy** button to copy it to your clipboard

**Important**: Keep this token secure! Treat it like a password. You'll need it in the next step.

---

## Step 4: Configure GitHub Repository Secret

### 4.1 Navigate to Your GitHub Repository

1. Go to your forked repository on GitHub: `https://github.com/YOUR-USERNAME/automation-catalog`

### 4.2 Create the Secret

1. Click on **Settings** (tab at the top of the repository)
2. In the left sidebar, click **Secrets and variables**, then click **Actions**
3. Click the **New repository secret** button
4. Fill in the secret details:
   - **Name**: Enter exactly `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Secret**: Paste the deployment token you copied from Azure
5. Click **Add secret**

---

## Step 5: Verify the GitHub Actions Workflow

### 5.1 Check Workflow File

Your repository already includes the GitHub Actions workflow file at `.github/workflows/azure-static-web-apps.yml`. This workflow:

- Triggers automatically on every push to `main` branch
- Builds the Astro static site
- Deploys to Azure Static Web Apps using the token you configured

### 5.2 Trigger Your First Deployment

Make a small change to trigger the deployment:

```bash
# Make sure you're in the repository directory
cd automation-catalog

# Make a small change (update a comment in README)
echo "" >> README.md

# Commit and push
git add README.md
git commit -m "Initial deployment test"
git push origin main
```

### 5.3 Monitor the Deployment

1. Go to your GitHub repository
2. Click the **Actions** tab
3. You should see a workflow run called "Deploy to Azure Static Web Apps"
4. Click on the workflow run to see detailed logs
5. Wait for the workflow to complete (usually 2-5 minutes)
6. Look for a green checkmark indicating success

---

## Step 6: Access Your Live Site

### 6.1 Get Your Site URL

1. Go back to your Azure Static Web App in the Azure Portal
2. On the **Overview** page, look for **URL**
3. Click the URL to open your live Automation Catalog

Your site is now live! The URL will look something like:
`https://YOUR-SITE-NAME.azurestaticapps.net`

### 6.2 Custom Domain (Optional)

You can configure a custom domain in Azure:

1. In your Static Web App, click **Custom domains** in the left menu
2. Click **+ Add**
3. Follow the wizard to add your custom domain
4. Update your DNS records as instructed

---

## Step 7: Start Adding Content

Now that your site is deployed, you can start adding automations, engineers, and other content!

### 7.1 Learn How to Add Automations

See the **[Adding_Automations.md](./Adding_Automations.md)** guide in this same directory for detailed instructions on:

- Creating automation folders and metadata files
- Adding engineers and their profiles
- Configuring tags, departments, and systems
- Adding architecture diagrams
- Tracking API keys and expiration dates
- Writing automation documentation

### 7.2 Understanding the Deployment Process

Every time you push changes to the `main` branch:

1. GitHub Actions automatically triggers
2. The workflow builds your site using `npm run build`
3. The built site (from the `dist/` folder) is deployed to Azure
4. Your changes are live in 2-5 minutes

**No manual deployment needed!** Just commit and push to `main`.

### 7.3 Customizing Emojis

The Automation Catalog uses a centralized emoji configuration system that allows you to customize all emojis displayed throughout the site.

#### Emoji Configuration File

Emojis are defined in `data/emojis.yaml`. If this file doesn't exist, the application will use sensible defaults.

**Available emoji keys**:

```yaml
emojis:
  automation: "🤖"      # Used for automation icons
  timeSaved: "🕒"       # Time saved metrics
  money: "💰"           # Financial value indicators
  chart: "📊"           # Data visualization icons
  key: "🔑"             # API keys and credentials
  warning: "⚠️"         # Warning indicators
  calendar: "📅"        # Calendar and scheduling
  checkmark: "✅"       # Success indicators
  link: "🔗"            # External links
  computer: "💻"        # System and environment
  schedule: "⏰"        # Schedule and timing
  completed: "✓"        # Completion status
  favicon: "🤖"         # Browser tab icon (favicon with transparent background)
```

#### How to Customize

1. Create or edit `data/emojis.yaml` in your repository
2. Override any emoji keys you want to change:

```yaml
emojis:
  timeSaved: "⏱️"      # Change clock emoji
  money: "💵"          # Change money emoji to dollar bills
  checkmark: "✔️"      # Use a different checkmark style
  favicon: "🚀"        # Change browser tab icon to a rocket
```

3. Commit and push your changes
4. The emojis will update automatically on your next deployment

**Note**: You only need to include the emojis you want to change. Any keys not specified will use the default values.

### 7.4 Version Number

The version number displayed in the footer can be easily updated by editing `data/version.yaml`:

```yaml
# Version Configuration
# Update this file to change the version number displayed in the footer
version: "1.0.0"
```

Simply update the version number and commit the change. The new version will automatically appear in the footer after deployment.

### 7.5 YAML Schema Validation

The project includes JSON schemas for all YAML configuration files to help VSCode validate your files and provide autocomplete suggestions.

**Schemas are located in the `schemas/` directory:**
- `automation.schema.json` - Validates `automations/*/metadata.yaml` files
- `departments.schema.json` - Validates `data/departments.yaml`
- `engineers.schema.json` - Validates `data/engineers.yaml`
- `tags.schema.json` - Validates `data/tags.yaml`
- `emojis.schema.json` - Validates `data/emojis.yaml`
- `version.schema.json` - Validates `data/version.yaml`

**VSCode Setup:**
1. Install the [YAML extension by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)
2. The `.vscode/settings.json` file is already configured to associate schemas with the correct files
3. When you open YAML files, you'll get:
   - Real-time validation with error highlighting
   - Autocomplete suggestions for property names
   - Hover documentation for fields
   - Required field warnings

If VSCode doesn't recognize the schemas, try reloading the window: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux) → "Developer: Reload Window"

---

## Troubleshooting

### Build Failing in GitHub Actions

If the workflow fails:

1. Click on the failed workflow run in the **Actions** tab
2. Expand the failed step to see error details
3. Common issues:
   - **Syntax errors in YAML files**: Check your `metadata.yaml` files for proper formatting
   - **Missing required fields**: Ensure all automations have required fields (name, author, status, etc.)
   - **Invalid dates**: Use `YYYY-MM-DD` format for all dates
   - **TypeScript errors**: Check the logs for specific errors

### Can't Access the Site

1. Make sure the GitHub Actions workflow completed successfully
2. Check the Azure Static Web App status in Azure Portal
3. Wait a few minutes for DNS propagation if using a custom domain
4. Clear your browser cache and try again

### Local Development Issues

If `npm run dev` fails:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Deployment Token Issues

If you get authentication errors:

1. Verify the secret name is exactly `AZURE_STATIC_WEB_APPS_API_TOKEN` (case-sensitive)
2. Generate a new deployment token in Azure and update the GitHub secret
3. Make sure you're using a deployment token, not an API key

---

## Optional: Enable Single Sign-On (SSO)

The Automation Catalog supports optional Azure AD authentication to restrict access to your organization. Authentication is **pre-configured** in Azure Static Web Apps - no setup needed!

**By default, the site is publicly accessible.** SSO is an opt-in feature.

### When to Enable SSO

Consider enabling SSO if you want to:
- Restrict access to authenticated users in your organization
- Require Microsoft account login before viewing the catalog
- Limit access to specific Azure AD groups (e.g., only DevOps team members)
- Leverage existing enterprise identity management
- Use built-in auth routes: `/.auth/login/aad` and `/.auth/logout`

### How to Enable SSO (3 Simple Steps!)

Authentication routes are **pre-configured and always available**. To enable SSO:

1. **Copy the configuration template**:
   ```bash
   cp public/staticwebapp.config.json.example public/staticwebapp.config.json
   ```

2. **Deploy with SSO enabled**:
   ```bash
   git add public/staticwebapp.config.json
   git commit -m "Enable Azure AD SSO authentication"
   git push origin main
   ```

3. **Test authentication**: Visit your site - you'll be automatically redirected to Microsoft login

**That's it!** Authentication routes work automatically:
- 🔐 Login: `/.auth/login/aad`
- 🚪 Logout: `/.auth/logout`
- 👤 User Info: `/.auth/me`

For detailed instructions and customization options, see **[Enabling_SSO.md](./Enabling_SSO.md)**

### The Site is Public by Default

No action needed! When you clone this repository, the site will be publicly accessible without any authentication requirements.

**Benefits of pre-configured authentication:**
- ✅ No Azure Portal setup required
- ✅ No manual app registration in Azure AD
- ✅ No client secrets to manage
- ✅ Authentication routes always available
- ✅ Can be toggled on/off anytime

---

## Next Steps

- **Add automations**: Follow the [Adding_Automations.md](./Adding_Automations.md) guide
- **Enable SSO (optional)**: Follow the [Enabling_SSO.md](./Enabling_SSO.md) guide
- **Customize styling**: Edit files in `src/styles/` and Tailwind configuration
- **Add more features**: Explore the `src/components/` and `src/pages/` directories
- **Join the community**: Check out issues and discussions on GitHub

---

## Additional Resources

- [Astro Documentation](https://docs.astro.build/)
- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

## Support

If you encounter issues or have questions:

1. Check existing [GitHub Issues](https://github.com/bwya77/automation-catalog/issues)
2. Create a new issue with detailed information about your problem
3. Include error messages, screenshots, and steps to reproduce

Happy automating!
