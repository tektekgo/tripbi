# TripBi Prerequisites Checklist
**Complete these tasks BEFORE starting development**

---

## 📋 Overview

This checklist ensures you have all accounts, tools, and information ready before writing code. Estimated completion time: **2-6 hours** depending on what you already have set up.

---

## 1. Domain & Branding

### Required
- [ ] **Register tripbi.app** (primary domain)
  - **Registrar options:**
    - Namecheap: https://www.namecheap.com
    - Google Domains (if available in your region)
    - Cloudflare: https://www.cloudflare.com/products/registrar
  - **Cost:** ~$12/year
  - **Tip:** Register for 2-3 years to lock in price
  - **Record confirmation:**
    - Domain: tripbi.app
    - Registrar: _______________
    - Expiration date: _______________

### Optional But Recommended
- [ ] **Register tripbi.com** (redirect to .app)
  - Use as primary if .app doesn't feel right later
  - Prevents squatters
  
- [ ] **Secure social media handles**
  - [ ] X/Twitter: @tripbi
  - [ ] Instagram: @tripbi
  - [ ] Facebook: facebook.com/tripbi
  - **Check availability:** https://namecheckr.com
  - **Note:** Claim even if not using immediately

---

## 2. Development Accounts

### GitHub
- [ ] **GitHub account exists**
  - Username: _______________
  - Email: _______________

- [ ] **Create repository: tripbi-app**
  ```
  Repository name: tripbi-app
  Description: Group trip planning and coordination platform
  Visibility: Private (change to public later if desired)
  Initialize with:
    ✅ README.md
    ✅ .gitignore (Node template)
    ❌ License (add later)
  ```
  - **Repo URL:** https://github.com/[username]/tripbi-app

### Firebase Console
- [ ] **Firebase account** (use same Google account as Splitbi)
- [ ] **Confirm Blaze plan access** (required for Cloud Functions)
  - Note: You're already on Blaze for Splitbi

---

## 3. Firebase Project Setup

### Create New Firebase Project
- [ ] **Go to:** https://console.firebase.google.com
- [ ] **Click:** "Add project"
- [ ] **Project name:** `TripBi` or `tripbi-prod`
- [ ] **Enable Google Analytics:** Yes
- [ ] **Analytics region:** Choose closest to target users
- [ ] **Record project details:**
  - Project ID: _______________
  - Project number: _______________
  - Region: _______________

### Enable Firebase Services

#### Authentication
- [ ] **Navigate to:** Authentication → Get Started
- [ ] **Enable sign-in methods:**
  - [ ] Email/Password
  - [ ] Google Sign-in
    - Configure consent screen
    - Add support email
    - Add authorized domains (will add tripbi.app later)

#### Firestore Database
- [ ] **Navigate to:** Firestore Database → Create database
- [ ] **Mode:** Production mode (add security rules later)
- [ ] **Location:** Choose closest region (can't change later!)
  - Recommended: us-central1, europe-west1, or asia-southeast1
- [ ] **Record location:** _______________

#### Cloud Functions
- [ ] **Navigate to:** Functions → Get started
- [ ] **Confirm Blaze plan** (pay-as-you-go)
- [ ] **Note:** Will set up later during implementation

#### Firebase Storage
- [ ] **Navigate to:** Storage → Get started
- [ ] **Mode:** Production mode (add security rules later)
- [ ] **Location:** Same as Firestore (auto-selected)
- [ ] **Bucket name:** _______________

#### Firebase Hosting
- [ ] **Navigate to:** Hosting → Get started
- [ ] **Note:** Will configure during deployment

### Get Firebase Configuration
- [ ] **Navigate to:** Project Settings → General
- [ ] **Scroll to:** "Your apps" → Add app → Web
- [ ] **App nickname:** TripBi Web
- [ ] **Copy configuration object:**

```javascript
const firebaseConfig = {
  apiKey: "_______________",
  authDomain: "_______________",
  projectId: "_______________",
  storageBucket: "_______________",
  messagingSenderId: "_______________",
  appId: "_______________",
  measurementId: "_______________"
};
```

**Save this!** You'll need it for environment variables.

---

## 4. Email Service (Resend)

### Resend Account
- [ ] **Account exists** (you use for Splitbi)
- [ ] **Login to:** https://resend.com/dashboard

### Create API Key for TripBi
- [ ] **Navigate to:** API Keys → Create API Key
- [ ] **Name:** TripBi Production
- [ ] **Permission:** Full Access (or Sending Access only)
- [ ] **Copy key:** `re_________________` (starts with "re_")
- [ ] **Store securely!** (Can't retrieve again)

### Configure Sending Domain
- [ ] **Navigate to:** Domains → Add Domain
- [ ] **Domain:** mail.tripbi.app
- [ ] **Add DNS records** (in your domain registrar):
  - TXT record for verification
  - MX records (if using for receiving)
  - DKIM records (for authentication)
- [ ] **Verify domain**
- [ ] **Test send** (Resend provides test tool)

### Record Details
```
Resend API Key: _______________
Sending Domain: mail.tripbi.app
Verified: [ ] Yes  [ ] No
```

---

## 5. Splitbi API Integration Planning

Since you'll build the API bridge between TripBi and Splitbi:

### Document Splitbi Details
- [ ] **Splitbi Firebase Project ID:** _______________
- [ ] **Splitbi Project Region:** _______________
- [ ] **Splitbi Cloud Functions URL:** https://________________

### API Endpoints to Create (in Splitbi)

Document these - you'll implement them during TripBi development:

**Endpoint 1: Create Expense Group**
```
POST /api/groups/create
Headers: { Authorization: "Bearer [API_KEY]" }
Body: {
  name: string,           // e.g., "Paris Trip - expenses"
  tripId: string,         // TripBi trip ID (for reference)
  createdBy: string,      // userId
  members: string[]       // array of userIds or emails
}
Response: {
  groupId: string,
  inviteLinks: string[]   // invitation links for members
}
```

**Endpoint 2: Get Group Summary**
```
GET /api/groups/{groupId}/summary
Headers: { Authorization: "Bearer [API_KEY]" }
Response: {
  groupId: string,
  name: string,
  totalExpenses: number,
  memberBalances: [
    { userId: string, balance: number, settled: boolean }
  ],
  lastUpdated: timestamp
}
```

**Endpoint 3: Invite Member (Optional)**
```
POST /api/groups/{groupId}/invite
Headers: { Authorization: "Bearer [API_KEY]" }
Body: {
  email: string
}
Response: {
  inviteLink: string,
  invited: boolean
}
```

### Authentication Strategy Decision
Choose one and implement consistently:

- [ ] **Option A: API Keys** (simpler for MVP)
  - Generate static API key in Splitbi
  - TripBi includes key in requests
  - **Pros:** Simple, fast to implement
  - **Cons:** Less secure (key in environment vars)

- [ ] **Option B: Firebase Custom Tokens** (more secure)
  - TripBi requests token from Splitbi
  - Token expires, more secure
  - **Pros:** Secure, follows OAuth pattern
  - **Cons:** More complex, requires token refresh logic

**Chosen approach:** _______________

### Record API Details
```
Splitbi API Base URL: _______________
Authentication method: _______________
API Key (if using): _______________
```

---

## 6. Development Environment

### Node.js & Package Managers
- [ ] **Node.js installed**
  - **Required version:** v18+ (v20 recommended)
  - **Check:** `node --version`
  - **Download:** https://nodejs.org
  - **Installed version:** _______________

- [ ] **npm installed** (comes with Node.js)
  - **Check:** `npm --version`
  - **Version:** _______________

### Git Configuration
- [ ] **Git installed**
  - **Check:** `git --version`
  - **Download:** https://git-scm.com

- [ ] **Configure Git user**
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```

- [ ] **GitHub authentication set up**
  - Use SSH keys or GitHub CLI
  - **Test:** `git clone` a private repo

### Firebase CLI
- [ ] **Install Firebase CLI globally**
  ```bash
  npm install -g firebase-tools
  ```

- [ ] **Login to Firebase**
  ```bash
  firebase login
  ```
  - Authenticates with your Google account
  - **Confirm:** `firebase projects:list` shows your projects

- [ ] **Record Firebase CLI version**
  - **Check:** `firebase --version`
  - **Version:** _______________

### Cursor IDE
- [ ] **Cursor installed** (you already have Pro subscription)
- [ ] **Cursor logged in**
- [ ] **Test Cursor AI:** Ask it a quick TypeScript question

---

## 7. Reference Information from Splitbi

Since you'll reuse patterns from Splitbi, gather this info:

### Splitbi Codebase Patterns
- [ ] **Project structure** (folder organization)
  - Where do components live?
  - How are routes organized?
  - Where are utilities/helpers?

- [ ] **Authentication patterns**
  - How do you handle Firebase Auth context?
  - Where is auth state managed?
  - How do you protect routes?

- [ ] **Firestore patterns**
  - How do you structure collection queries?
  - Do you use custom hooks for Firestore?
  - How do you handle real-time listeners?

- [ ] **Styling approach**
  - CSS modules? Tailwind? Styled components?
  - Component library (if any)?
  - Color scheme/theme setup?

- [ ] **Error handling**
  - How do you display errors to users?
  - Toast notifications? Modal alerts?

- [ ] **Common utilities**
  - Date formatting
  - Currency formatting
  - Validation helpers
  - API request wrappers

**Action:** Have Splitbi codebase accessible during TripBi development for reference.

---

## 8. Design & Branding (Optional for MVP)

You can start without these and add later:

### Visual Identity
- [ ] **Logo designed** (or use text logo initially)
- [ ] **Brand colors chosen**
  - Primary: _______________
  - Secondary: _______________
  - Accent: _______________
  - Error: _______________
  - Success: _______________

- [ ] **Typography**
  - Headings: _______________
  - Body: _______________
  - (Or use system fonts for MVP)

### Design Tools (Optional)
- [ ] **Figma account** (for mockups/prototypes)
- [ ] **Excalidraw** (for quick diagrams)
- [ ] **Unsplash** (for placeholder images)

**MVP approach:** Use Tailwind's default colors and fonts, refine later.

---

## 9. Additional Services (Can Add Later)

These are helpful but not required for initial development:

### Monitoring & Analytics
- [ ] **Google Analytics** (already enabled in Firebase)
- [ ] **Sentry** (error tracking)
  - Create account: https://sentry.io
  - Add Sentry SDK later in development

### Deployment & Hosting Alternatives
- [ ] **Vercel account** (alternative to Firebase Hosting)
- [ ] **Netlify account** (alternative to Firebase Hosting)
- **Note:** Firebase Hosting is fine for MVP

### Documentation
- [ ] **Notion workspace** (for project documentation)
- [ ] **Linear/GitHub Issues** (for task tracking)

---

## 10. Environment Variables Setup

Prepare a template for your `.env` files:

### .env.local (for development)
```bash
# Firebase Config
VITE_FIREBASE_API_KEY=_______________
VITE_FIREBASE_AUTH_DOMAIN=_______________
VITE_FIREBASE_PROJECT_ID=_______________
VITE_FIREBASE_STORAGE_BUCKET=_______________
VITE_FIREBASE_MESSAGING_SENDER_ID=_______________
VITE_FIREBASE_APP_ID=_______________
VITE_FIREBASE_MEASUREMENT_ID=_______________

# Resend (Email)
RESEND_API_KEY=_______________

# Splitbi Integration
SPLITBI_API_URL=_______________
SPLITBI_API_KEY=_______________

# App Config
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=TripBi
```

**Note:** Fill these in during initial project setup. Never commit .env files to Git!

---

## 11. Mobile Development (Capacitor)

### For App Store Deployment
- [ ] **Apple Developer Account** ($99/year)
  - Required for iOS app store
  - **Link:** https://developer.apple.com

- [ ] **Google Play Developer Account** ($25 one-time)
  - Required for Android app store (you already have from Splitbi)

- [ ] **Xcode installed** (Mac only, for iOS)
- [ ] **Android Studio installed** (for Android)

**Note:** Can handle mobile deployment after web MVP is working.

---

## ✅ Pre-Development Checklist Summary

Before starting implementation, confirm you have:

**Essential:**
- ✅ tripbi.app domain registered
- ✅ Firebase project created and services enabled
- ✅ Firebase config object saved
- ✅ Resend API key created
- ✅ GitHub repository initialized
- ✅ Node.js, npm, Git installed
- ✅ Firebase CLI installed and authenticated
- ✅ Cursor IDE ready
- ✅ Splitbi API plan documented

**Nice to Have:**
- ✅ Social handles secured
- ✅ Design/branding defined
- ✅ Error tracking set up
- ✅ Mobile developer accounts

---

## 🚀 Next Steps

Once this checklist is complete:

1. **Start implementation chat** in separate conversation
2. **Reference this document** and product spec
3. **Begin with:** "Ready to build TripBi - let's start with project setup"
4. **Follow:** The step-by-step build sequence Claude provides

---

## Estimated Time Investment

| Task Category | Time Estimate |
|---------------|---------------|
| Domain registration | 15 minutes |
| Firebase setup | 1-2 hours |
| Email service config | 30 minutes |
| Development tools | 30 minutes |
| Splitbi API planning | 1 hour |
| Documentation gathering | 30 minutes |
| **Total (minimum)** | **3-4 hours** |
| **Total (with optional)** | **5-7 hours** |

---

## Questions or Issues?

If you encounter problems during setup:
- Check Firebase documentation: https://firebase.google.com/docs
- Verify Node.js version compatibility
- Ensure Git is properly authenticated with GitHub
- Test Firebase CLI with: `firebase projects:list`

**When ready to code:** Start fresh implementation chat with all prerequisites complete!
