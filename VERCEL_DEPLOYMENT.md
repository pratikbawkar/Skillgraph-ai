# Vercel Deployment Guide - Phase 2

**Purpose:** Deploy SkillGraph frontend to Vercel for validation before AWS Phase 3 (Terraform/Lambda)

---

## 📋 Prerequisites

- ✅ GitHub account with push access to skillgraph-ai repo
- ✅ Vercel account (free tier is sufficient)
- ✅ GitHub Actions secrets configured in repo settings

---

## 🚀 Step-by-Step Setup

### **Step 1: Create Vercel Project**

1. Go to [vercel.com](https://vercel.com)
2. Sign in or create a free account
3. Click **"Add New"** → **"Project"**
4. Select **"Import Git Repository"**
5. Search for and select `skillgraph-ai` (or your fork)
6. Click **"Import"**

### **Step 2: Configure Vercel Project Settings**

On the **Import Project** screen:

**Framework:** Next.js (auto-detected)

**Root Directory:** `./frontend`

**Build Command:** `npm run build`

**Install Command:** `npm install`

**Output Directory:** `.next`

**Environment Variables:**
```
NEXT_PUBLIC_USE_MOCKS=true
NEXT_PUBLIC_API_BASE_URL=
```

Click **"Deploy"** and wait for initial build to complete.

### **Step 3: Get Vercel Tokens**

1. On Vercel, go to **Settings** → **Tokens** (in account menu)
2. Create a new token:
   - **Name:** `GitHub Actions`
   - **Scope:** `Full Account`
   - **Expiration:** No expiration (or 90 days)
3. Copy the token (save it securely)

4. Get your **Organization ID** and **Project ID**:
   - Go to your project settings
   - **URL** will look like: `https://vercel.com/YOUR-ORG/skillgraph-ai/settings`
   - **Organization ID** is in the URL (`YOUR-ORG` part or in project overview)
   - **Project ID** is on the **General** tab under "Project ID"

### **Step 4: Add GitHub Actions Secrets**

1. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**

2. Create three secrets:

| Secret Name | Value | Source |
|-------------|-------|--------|
| `VERCEL_TOKEN` | Your Vercel token from Step 3 | Vercel account |
| `VERCEL_ORG_ID` | Your organization ID | Vercel project settings |
| `VERCEL_PROJECT_ID` | Your project ID | Vercel project settings |

3. Click **"New repository secret"** for each and paste the value

---

## 🔄 How the CI/CD Pipeline Works

### **Workflow on Every Push to `develop`:**

```
Step 1: GitHub Actions CI
├─ Linting (ESLint, ruff)
├─ Type Checking (TypeScript, mypy)
├─ Security Audits (npm audit, bandit, pip-audit)
├─ Unit Tests (Vitest, pytest)
├─ Coverage Reports (80%+ threshold)
└─ Frontend Build

↓ If all tests PASS:

Step 2: Vercel Deployment
├─ Install dependencies
├─ Build Next.js app
├─ Deploy to Vercel preview
└─ Generate preview URL

↓ On Success:

Step 3: Smoke Tests
├─ Wait for Vercel to boot
├─ Health checks
└─ Report deployment status
```

### **If Tests FAIL:**
- ❌ Deployment is blocked
- ❌ GitHub Actions reports failure
- ✅ Fix the issue locally
- ✅ Push fix to `develop`
- ✅ CI/CD automatically re-runs

---

## 📊 CI/CD Status Checks

### **GitHub Actions Tab**

After each push to `develop`, check:

1. **Actions** tab in your GitHub repo
2. Look for the most recent push
3. Three jobs should run:
   - ✅ `test-and-verify` (Backend + Frontend tests)
   - ✅ `deploy-to-vercel` (Vercel deployment)
   - ✅ `smoke-tests` (Basic health checks)

### **View Results:**

```
✅ All tests passed          → Green check
❌ Tests failed              → Red X (see logs)
⏳ Still running             → Yellow dot
```

Click a job to see detailed logs.

---

## 🌍 Accessing Your Vercel App

### **After Successful Deployment:**

1. **From GitHub Actions:**
   - Check the "Deploy to Vercel" job
   - Look for the deployment URL in logs

2. **From Vercel Dashboard:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click your `skillgraph-ai` project
   - Under **Deployments**, click the latest build
   - Click **"Visit"** to see live preview

### **Preview URLs:**

Each deployment gets a unique preview URL:
- **Main URL:** `https://skillgraph-ai.vercel.app`
- **Branch Preview:** `https://skillgraph-ai-BRANCH.vercel.app`
- **Commit Preview:** `https://skillgraph-ai-git-HASH.vercel.app`

---

## ✅ Validation Checklist

After Vercel deployment, test the app:

- [ ] **Homepage loads** - Can you see role selection?
- [ ] **Styling works** - Is Tailwind CSS applied? Dark mode toggle works?
- [ ] **Mock data loads** - Do roles show with descriptions?
- [ ] **Navigation works** - Can you click between pages?
- [ ] **Authentication UI** - Can you see login/register pages?
- [ ] **Forms work** - Can you type in input fields?
- [ ] **Mock APIs work** - Can you submit forms (with mock backend)?
- [ ] **No console errors** - Open browser DevTools → Console tab (no red errors)

### **Testing Environment Variables:**

Vercel is using mock data by default:
```
NEXT_PUBLIC_USE_MOCKS=true    ← Frontend uses local mock data
NEXT_PUBLIC_API_BASE_URL=     ← Backend API not yet connected
```

This is correct for Phase 2 validation. Real API connection comes in Phase 3.

---

## 🔐 Environment Variables Explained

### **Current Setup (Phase 2 - Vercel Only):**

```yaml
NEXT_PUBLIC_USE_MOCKS: true
  # Frontend uses mock data instead of calling backend
  # Safe for validation; no backend running yet

NEXT_PUBLIC_API_BASE_URL: ""
  # Backend API URL (empty = disabled)
  # Will be set to AWS Lambda URL in Phase 3
```

### **Future Setup (Phase 3 - AWS):**

```yaml
NEXT_PUBLIC_USE_MOCKS: false
  # Disable mocks; use real API

NEXT_PUBLIC_API_BASE_URL: "https://api.skillgraph.example.com"
  # AWS API Gateway + Lambda URL
```

---

## 📝 Redeployment & Updates

### **To Redeploy After Code Changes:**

```bash
# Make changes locally
git add .
git commit -m "feat: your feature"

# Push to develop
git push origin develop

# GitHub Actions automatically:
# 1. Runs tests
# 2. Builds frontend
# 3. Deploys to Vercel
# 4. Reports status
```

No manual action needed. The pipeline is automatic.

---

## 🐛 Troubleshooting

### **Deployment Failed - Check Logs**

1. Go to GitHub Actions tab
2. Click the failed job
3. Expand the step that failed
4. Look for error messages

### **Common Issues:**

| Issue | Cause | Fix |
|-------|-------|-----|
| `VERCEL_TOKEN not found` | Secret not configured | Add secret to GitHub repo settings |
| `npm install fails` | Missing frontend/package-lock.json | Regenerate lock file: `cd frontend && npm install` |
| `Build fails with TypeScript error` | Code has type errors | Run `npm run type-check` locally and fix |
| `Vercel deployment blocked` | Tests didn't pass | Check `test-and-verify` job logs, fix locally |

### **Check GitHub Secrets:**

```bash
# Make sure secrets exist in GitHub:
# Repo Settings → Secrets and variables → Actions

# Should see:
✅ VERCEL_TOKEN
✅ VERCEL_ORG_ID
✅ VERCEL_PROJECT_ID
```

---

## 🎯 Phase 2 Success Criteria

Phase 2 is complete when:

- ✅ Vercel deployment succeeds on every push
- ✅ Frontend UI loads and works perfectly
- ✅ All tests pass in GitHub Actions
- ✅ Mock data displays correctly
- ✅ No console errors in browser DevTools
- ✅ Dark mode, navigation, forms all work
- ✅ CI/CD pipeline is reliable (no random failures)

---

## 📚 Next Steps: Phase 3 (AWS + Terraform)

Once Phase 2 validation is complete and you're confident the app works:

1. **Create Terraform files** for AWS infrastructure
2. **Deploy backend** to AWS Lambda
3. **Set environment variables** to point to AWS
4. **Run integration tests** against AWS
5. **Deploy full stack** (Frontend on Vercel/S3+CloudFront + Backend on Lambda)

See `plan.md` section 2 (Phase 2 exit criteria) and section 3 (Phase 3 details).

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Actions:** [repo]/settings/actions
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment/vercel
- **SkillGraph Plan:** See `plan.md` sections 3, 8

---

## ❓ Questions?

Check the following in order:

1. **GitHub Actions Logs:** See actual error messages
2. **Vercel Build Logs:** Detailed build output
3. **Browser Console:** JavaScript runtime errors
4. **plan.md:** Architecture and design decisions
5. **CONTRIBUTING.md:** Development guidelines

---

**Phase 2 Deployment Ready!** 🚀
