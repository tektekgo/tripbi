# CI/CD Setup Guide

> **Purpose:** Configure GitHub Actions for automated deployments
> **Time Required:** ~20-30 minutes

---

## Overview

TripBi uses GitHub Actions for CI/CD with three workflows:

1. **PR Check** (`pr-check.yml`) - Runs on pull requests to validate code
2. **Deploy Dev** (`deploy-dev.yml`) - Deploys `dev` branch to tripbi-dev
3. **Deploy Prod** (`deploy-prod.yml`) - Deploys `main` branch to tripbi-prod

---

## Prerequisites

Before setting up CI/CD, you need:

1. Firebase projects created (tripbi-dev, tripbi-prod)
2. GitHub repository with `main` and `dev` branches
3. Firebase CLI installed locally

---

## Step 1: Generate Firebase Service Account Keys

### For Development Project (tripbi-dev)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **tripbi-dev** project
3. Click **Project Settings** (gear icon)
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Save the JSON file securely (don't commit it!)
7. You'll add this to GitHub secrets as `DEV_FIREBASE_SERVICE_ACCOUNT`

### For Production Project (tripbi-prod)

Repeat the same steps for tripbi-prod and save as `PROD_FIREBASE_SERVICE_ACCOUNT`

---

## Step 2: Generate Firebase CI Token

This token is used for deploying Firestore rules and Storage rules.

```bash
firebase login:ci
```

This will open a browser for authentication. After authenticating, you'll get a token like:

```
1//0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Save this - you'll add it as `FIREBASE_TOKEN` in GitHub secrets.

---

## Step 3: Add GitHub Secrets

Go to your GitHub repository:
1. Click **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

### Development Secrets

| Secret Name | Value |
|-------------|-------|
| `DEV_FIREBASE_SERVICE_ACCOUNT` | Entire JSON content from service account key file |
| `DEV_FIREBASE_API_KEY` | API key from Firebase config |
| `DEV_FIREBASE_AUTH_DOMAIN` | tripbi-dev.firebaseapp.com |
| `DEV_FIREBASE_PROJECT_ID` | tripbi-dev |
| `DEV_FIREBASE_STORAGE_BUCKET` | tripbi-dev.appspot.com |
| `DEV_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID from Firebase config |
| `DEV_FIREBASE_APP_ID` | App ID from Firebase config |
| `DEV_FIREBASE_MEASUREMENT_ID` | Measurement ID from Firebase config |

### Production Secrets

| Secret Name | Value |
|-------------|-------|
| `PROD_FIREBASE_SERVICE_ACCOUNT` | Entire JSON content from service account key file |
| `PROD_FIREBASE_API_KEY` | API key from Firebase config |
| `PROD_FIREBASE_AUTH_DOMAIN` | tripbi-prod.firebaseapp.com |
| `PROD_FIREBASE_PROJECT_ID` | tripbi-prod |
| `PROD_FIREBASE_STORAGE_BUCKET` | tripbi-prod.appspot.com |
| `PROD_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID from Firebase config |
| `PROD_FIREBASE_APP_ID` | App ID from Firebase config |
| `PROD_FIREBASE_MEASUREMENT_ID` | Measurement ID from Firebase config |

### Shared Secret

| Secret Name | Value |
|-------------|-------|
| `FIREBASE_TOKEN` | Token from `firebase login:ci` |

---

## Step 4: Create Branches

If you haven't already:

```bash
# Create and push dev branch
git checkout -b dev
git push -u origin dev

# Switch back to main
git checkout main
```

---

## Step 5: Test the Workflows

### Test PR Check

1. Create a feature branch: `git checkout -b test-ci`
2. Make a small change
3. Push and create a PR to `dev`
4. Verify the PR Check workflow runs

### Test Dev Deployment

1. Merge the PR to `dev`
2. Verify the Deploy Dev workflow runs
3. Check https://tripbi-dev.web.app

### Test Prod Deployment

1. Create PR from `dev` to `main`
2. Merge to `main`
3. Verify the Deploy Prod workflow runs
4. Check https://tripbi.app (after custom domain setup)

---

## Workflow Details

### PR Check (`pr-check.yml`)

Triggered on: Pull requests to `main` or `dev`

Steps:
1. Install dependencies
2. Run linter
3. Type check
4. Build (with placeholder env vars)

### Deploy Dev (`deploy-dev.yml`)

Triggered on: Push to `dev` branch

Steps:
1. Install dependencies
2. Run linter
3. Build with dev Firebase config
4. Deploy to Firebase Hosting (tripbi-dev)
5. Deploy Firestore rules
6. Deploy Storage rules

### Deploy Prod (`deploy-prod.yml`)

Triggered on: Push to `main` branch

Steps:
1. Install dependencies
2. Run linter
3. Build with prod Firebase config
4. Deploy to Firebase Hosting (tripbi-prod)
5. Deploy Firestore rules
6. Deploy Storage rules
7. Create release tag

---

## Manual Deployment

You can also trigger deployments manually:

1. Go to **Actions** tab in GitHub
2. Select the workflow (Deploy Dev or Deploy Prod)
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

---

## Troubleshooting

### "Permission denied" errors

- Verify the service account has the required roles:
  - Firebase Hosting Admin
  - Cloud Functions Admin
  - Firestore Admin
  - Storage Admin

### "Invalid token" errors

- Regenerate the Firebase CI token: `firebase login:ci`
- Update the `FIREBASE_TOKEN` secret

### Build failures

- Check that all environment variables are set correctly
- Verify the Firebase config values match your project

---

## Security Notes

- Never commit service account keys to the repository
- Use GitHub secrets for all sensitive values
- Rotate service account keys periodically
- Review GitHub Actions logs for any exposed secrets

---

## Checklist

- [ ] Generated service account key for tripbi-dev
- [ ] Generated service account key for tripbi-prod
- [ ] Generated Firebase CI token
- [ ] Added all DEV_* secrets to GitHub
- [ ] Added all PROD_* secrets to GitHub
- [ ] Added FIREBASE_TOKEN secret to GitHub
- [ ] Created `dev` branch
- [ ] Tested PR Check workflow
- [ ] Tested Deploy Dev workflow
- [ ] Tested Deploy Prod workflow
