# Enabling Single Sign-On (SSO) for Automation Catalog

This guide shows you how to enable optional Azure AD authentication for your Automation Catalog. Once enabled, users are automatically redirected to login when they access the site.

---

## Overview

**By default, SSO is DISABLED** - the site is publicly accessible. When you enable SSO:

- Users must sign in with Azure AD (Microsoft Entra ID) to access the site
- Users are automatically redirected to login
- Authentication routes are **pre-configured and always available**: `/.auth/login/aad` and `/.auth/logout`
- You can optionally restrict access to specific Azure AD groups
- The feature is completely optional and easy to enable/disable

---

## How It Works

Azure Static Web Apps **pre-configures authentication** - no Azure Portal setup required!

1. **Authentication routes are already available** on your site
   - `/.auth/login/aad` - Microsoft Entra ID login
   - `/.auth/logout` - Sign out
   - `/.auth/me` - Get current user info

2. **Configure route protection** via `staticwebapp.config.json`
   - Define which routes require authentication
   - Set where unauthenticated users are redirected

3. **Deploy** - Users are automatically redirected to login when they access protected routes

---

## Enable SSO (3 Steps)

### Step 1: Copy the Configuration File

```bash
cp public/staticwebapp.config.json.example public/staticwebapp.config.json
```

**Note:** The file is in `public/` so Astro copies it to `dist/` during build (where Azure Static Web Apps expects it).

### Step 2: Review the Configuration

The default configuration looks like this:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "routes": [
    {
      "route": "/*",
      "allowedRoles": ["authenticated"]
    }
  ],
  "responseOverrides": {
    "401": {
      "statusCode": 302,
      "redirect": "/.auth/login/aad"
    }
  }
}
```

**What this does:**
- `"route": "/*"` - Protects all routes
- `"allowedRoles": ["authenticated"]` - Only authenticated users can access
- `"401": { "redirect": "/.auth/login/aad" }` - Redirects unauthenticated users to Microsoft login
- `"navigationFallback"` - Ensures SPA routing works correctly

### Step 3: Deploy

```bash
git add public/staticwebapp.config.json
git commit -m "Enable Azure AD SSO authentication"
git push origin main
```

**Note:** No `-f` flag needed - the file is meant to be committed!

### Step 4: Test

1. Wait 2-5 minutes for deployment
2. Visit your site - you'll be automatically redirected to Microsoft login
3. After signing in, you'll have access to the site

**That's it!** The pre-configured authentication routes handle everything automatically.

---

## Disable SSO

To disable SSO and restore public access:

```bash
git rm public/staticwebapp.config.json
git commit -m "Disable SSO - restore public access"
git push origin main
```

The site will be publicly accessible after deployment.

---

## Optional: Group-Based Access Control

To restrict access to specific Azure AD groups:

### Step 1: Find Your Azure AD Group

1. In Azure Portal, go to **Microsoft Entra ID** → **Groups**
2. Find or create the group for access control
3. Copy the **Object ID** (GUID)

### Step 2: Configure Role Management in Azure Portal

1. Go to your Static Web App → **Settings** → **Authentication** → **Role management**
2. Click **+ Invite**
3. Fill in:
   - **Role name**: `authorized` (or any name)
   - **Principal type**: **Group**
   - **Principal ID**: Paste the Group Object ID
4. Click **Add**

### Step 3: Update Configuration

Edit `public/staticwebapp.config.json` to use your custom role:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "routes": [
    {
      "route": "/*",
      "allowedRoles": ["authorized"]
    }
  ],
  "responseOverrides": {
    "401": {
      "statusCode": 302,
      "redirect": "/.auth/login/aad"
    }
  }
}
```

Replace `"authenticated"` with your custom role name (e.g., `"authorized"`).

### Step 4: Deploy

```bash
git add public/staticwebapp.config.json
git commit -m "Add group-based access control"
git push origin main
```

Now only members of that Azure AD group can access the site.

---

## Customizing Routes

### Allow Public Access to Specific Routes

If you want some routes public while protecting others:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "routes": [
    {
      "route": "/public/*",
      "allowedRoles": ["anonymous", "authenticated"]
    },
    {
      "route": "/*",
      "allowedRoles": ["authenticated"]
    }
  ],
  "responseOverrides": {
    "401": {
      "statusCode": 302,
      "redirect": "/.auth/login/aad"
    }
  }
}
```

**Note:** More specific routes must come before general routes.

### Create Friendly Login/Logout URLs

Map friendly URLs to the authentication routes:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "routes": [
    {
      "route": "/login",
      "redirect": "/.auth/login/aad"
    },
    {
      "route": "/logout",
      "redirect": "/.auth/logout"
    },
    {
      "route": "/*",
      "allowedRoles": ["authenticated"]
    }
  ]
}
```

Now users can visit `/login` and `/logout` instead of the longer `/.auth/*` paths.

---

## Authentication Routes

Azure Static Web Apps provides these built-in endpoints:

- **Login**: `/.auth/login/aad` - Initiates Microsoft login
- **Logout**: `/.auth/logout` - Signs the user out
- **User Info**: `/.auth/me` - Returns current user information (JSON)

**Example usage:**

```html
<a href="/.auth/login/aad">Sign In</a>
<a href="/.auth/logout">Sign Out</a>
```

---

## Troubleshooting

### Site doesn't redirect to login

1. Verify `public/staticwebapp.config.json` is committed to git: `git ls-files | grep staticwebapp`
2. Check GitHub Actions deployment succeeded
3. Wait 2-5 minutes for deployment
4. Hard refresh browser (Ctrl+Shift+R)

### User authenticates but sees 401/403

- **401**: Check `"allowedRoles": ["authenticated"]` in config
- **403**: User not in authorized group - verify group membership in Azure Portal

### Changes not taking effect

1. Verify file is committed: `git log --oneline -1`
2. Check GitHub Actions deployment succeeded
3. Wait 2-5 minutes for CDN cache to clear
4. Try incognito mode

### Config file not being deployed

Make sure the file is in `public/` folder - Astro automatically copies it to `dist/` during build.

---

## Summary

**Authentication is pre-configured - enabling SSO is incredibly simple:**

1. ✅ Copy `public/staticwebapp.config.json.example` → `public/staticwebapp.config.json`
2. ✅ Commit and deploy
3. ✅ Users are automatically redirected to login

**Authentication routes (pre-configured and always available):**
- Login: `/.auth/login/aad`
- Logout: `/.auth/logout`
- User Info: `/.auth/me`

**Optional:** Add group-based access control via Role management in Azure Portal.

**No Azure Portal authentication setup required!** Authentication routes work automatically. The SSO feature is completely optional and can be toggled on/off easily!

---

## Additional Resources

- [Azure Static Web Apps Authentication](https://learn.microsoft.com/en-us/azure/static-web-apps/authentication-authorization)
- [Azure Static Web Apps Configuration Reference](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)
