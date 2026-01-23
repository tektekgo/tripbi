# Firebase Project Setup Guide

> **Purpose:** Step-by-step instructions to create Firebase projects for TripBi
> **Time Required:** ~30-45 minutes

---

## Overview

You'll create two Firebase projects:
1. **tripbi-dev** - Development/testing environment
2. **tripbi-prod** - Production environment

---

## Prerequisites

- Google account (same one used for Splitbi recommended)
- Firebase Blaze plan access (pay-as-you-go, required for Cloud Functions)

---

## Part 1: Create Development Project (tripbi-dev)

### Step 1: Create the Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name: `tripbi-dev`
4. Click **Continue**
5. **Google Analytics:** Enable (recommended)
   - Select your existing Analytics account or create new
   - Accept terms
6. Click **Create project**
7. Wait for project creation, then click **Continue**

### Step 2: Record Project Details

After creation, go to **Project Settings** (gear icon) → **General**

Record these values:
```
Project name: tripbi-dev
Project ID: ____________________
Project number: ____________________
```

### Step 3: Enable Authentication

1. In left sidebar, click **Build** → **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password**:
   - Click Email/Password
   - Toggle "Enable" ON
   - Click **Save**
5. Enable **Google**:
   - Click Google
   - Toggle "Enable" ON
   - Enter a support email (your email)
   - Click **Save**

### Step 4: Set Up Firestore Database

1. In left sidebar, click **Build** → **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode** (we'll add rules later)
4. Choose location:
   - **Recommended:** `us-central1` (Iowa) for US users
   - Or `europe-west1` (Belgium) for EU users
   - **Important:** Location cannot be changed later!
5. Click **Enable**

Record location:
```
Firestore location: __nam5__________________
```

### Step 5: Set Up Cloud Storage

1. In left sidebar, click **Build** → **Storage**
2. Click **Get started**
3. Select **Start in production mode**
4. Location will match Firestore (auto-selected)
5. Click **Done**

Record bucket name:
```
Storage bucket: gs://tripbi-dev.firebasestorage.app____________________
```

### Step 6: Enable Cloud Functions

1. In left sidebar, click **Build** → **Functions**
2. Click **Get started**
3. If prompted, upgrade to Blaze plan:
   - Click **Upgrade project**
   - Add billing account (or use existing from Splitbi)
   - Set budget alerts if desired
4. Once Blaze is enabled, Functions are ready

### Step 7: Set Up Hosting

1. In left sidebar, click **Build** → **Hosting**
2. Click **Get started**
3. Follow the prompts (we'll configure via CLI later)
4. Click through until complete

### Step 8: Register Web App

1. Go to **Project Settings** → **General**
2. Scroll to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Enter app nickname: `TripBi Web Dev`
5. Check **"Also set up Firebase Hosting"**
6. Click **Register app**
7. **Copy the Firebase config object** - you'll need this!

```javascript
// SAVE THIS - tripbi-dev config
const firebaseConfig = {
  apiKey: "____________________",
  authDomain: "____________________",
  projectId: "____________________",
  storageBucket: "____________________",
  messagingSenderId: "____________________",
  appId: "____________________",
  measurementId: "____________________"
};
```

8. Click **Continue to console**

---

## Part 2: Create Production Project (tripbi-prod)

Repeat all steps from Part 1 with these differences:

### Changes for Production

| Setting | Development | Production |
|---------|-------------|------------|
| Project name | `tripbi-dev` | `tripbi-prod` |
| Web app nickname | `TripBi Web Dev` | `TripBi Web` |
| Firestore location | Same region | **Same region as dev** |

### Record Production Config

```javascript
// SAVE THIS - tripbi-prod config
const firebaseConfig = {
  apiKey: "____________________",
  authDomain: "____________________",
  projectId: "____________________",
  storageBucket: "____________________",
  messagingSenderId: "____________________",
  appId: "____________________",
  measurementId: "____________________"
};
```

---

## Part 3: Configure Firebase CLI

### Step 1: Install Firebase CLI (if not installed)

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

This opens a browser - authenticate with your Google account.

### Step 3: Verify Access

```bash
firebase projects:list
```

You should see both `tripbi-dev` and `tripbi-prod` in the list.

---

## Part 4: Configure Project Aliases

In your TripBi project directory, you'll create a `.firebaserc` file:

```json
{
  "projects": {
    "dev": "tripbi-dev",
    "prod": "tripbi-prod",
    "default": "tripbi-dev"
  }
}
```

### Switching Between Projects

```bash
# Use development project
firebase use dev

# Use production project
firebase use prod

# Check current project
firebase use
```

---

## Part 5: Set Up Custom Domain (Production Only)

After initial deployment, configure your custom domain:

### Step 1: Add Custom Domain

1. Go to Firebase Console → `tripbi-prod` → Hosting
2. Click **Add custom domain**
3. Enter: `tripbi.app`
4. Follow verification steps (add DNS records)
5. Wait for SSL certificate provisioning (can take up to 24 hours)

### Step 2: DNS Records to Add

At your domain registrar (where you registered tripbi.app), add:

```
Type: A
Host: @
Value: (Firebase will provide IP addresses)

Type: TXT
Host: @
Value: (Firebase will provide verification string)
```

---

## Part 6: Set Up Email Domain in Resend

If you haven't already configured mail.tripbi.app:

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click **Add Domain**
3. Enter: `mail.tripbi.app`
4. Add the DNS records Resend provides:
   - SPF record (TXT)
   - DKIM records (TXT)
   - Optional: MX records if receiving email
5. Click **Verify**

---

## Configuration Summary

After completing setup, you should have:

### Development Project (tripbi-dev)
```
Project ID: tripbi-dev
Auth: Email/Password + Google enabled
Firestore: Enabled, location: ________
Storage: Enabled
Functions: Enabled (Blaze plan)
Hosting: Enabled
```

### Production Project (tripbi-prod)
```
Project ID: tripbi-prod
Auth: Email/Password + Google enabled
Firestore: Enabled, location: ________ (same as dev)
Storage: Enabled
Functions: Enabled (Blaze plan)
Hosting: Enabled
Custom domain: tripbi.app (pending)
```

### Environment Files to Create

Create these files in your TripBi project (we'll do this during scaffolding):

**`.env.development`**
```bash
VITE_FIREBASE_API_KEY=dev_api_key
VITE_FIREBASE_AUTH_DOMAIN=tripbi-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tripbi-dev
VITE_FIREBASE_STORAGE_BUCKET=tripbi-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=dev_sender_id
VITE_FIREBASE_APP_ID=dev_app_id
VITE_FIREBASE_MEASUREMENT_ID=dev_measurement_id
```

**`.env.production`**
```bash
VITE_FIREBASE_API_KEY=prod_api_key
VITE_FIREBASE_AUTH_DOMAIN=tripbi-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tripbi-prod
VITE_FIREBASE_STORAGE_BUCKET=tripbi-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=prod_sender_id
VITE_FIREBASE_APP_ID=prod_app_id
VITE_FIREBASE_MEASUREMENT_ID=prod_measurement_id
```

---

## Security Rules (Initial Setup)

After the project is scaffolded, we'll add proper security rules. For now, Firestore and Storage are in production mode (locked down).

---

## Next Steps

After completing Firebase setup:

1. Share your config values with Claude (or update .env files)
2. Continue with project scaffolding
3. Test authentication locally

---

## Troubleshooting

### "Permission denied" on Firestore
- Check that security rules allow your operation
- Verify you're authenticated

### Functions not deploying
- Ensure Blaze plan is active
- Check `firebase use` points to correct project

### Custom domain not working
- DNS propagation can take up to 48 hours
- Verify DNS records are correct at registrar
- Check Firebase Hosting for SSL status

---

## Checklist

- [ ] Created tripbi-dev project
- [ ] Enabled Auth (Email + Google) on dev
- [ ] Created Firestore database on dev
- [ ] Created Storage bucket on dev
- [ ] Enabled Cloud Functions on dev (Blaze plan)
- [ ] Registered Web app on dev
- [ ] Saved dev Firebase config
- [ ] Created tripbi-prod project
- [ ] Enabled Auth (Email + Google) on prod
- [ ] Created Firestore database on prod
- [ ] Created Storage bucket on prod
- [ ] Enabled Cloud Functions on prod (Blaze plan)
- [ ] Registered Web app on prod
- [ ] Saved prod Firebase config
- [ ] Installed Firebase CLI
- [ ] Logged in to Firebase CLI
- [ ] Verified both projects visible in CLI
- [ ] (Later) Configured custom domain
- [ ] (Later) Configured email domain in Resend
