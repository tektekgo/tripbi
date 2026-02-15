# TripBi - Build & Deploy Guide

> **Last Updated:** 2026-02-14

---

## The Simple Mental Model

```
LOCAL DEV  ──►  DEV (testing)  ──►  PROD (live)
npm run dev     npm run deploy      npm run deploy:prod
localhost:5173  tripbi-dev.web.app  tripbi.app
```

| What you want to do | Command | What it does |
|---------------------|---------|-------------|
| **Work locally** | `npm run dev` | Starts local server at localhost:5173 |
| **Deploy to dev for testing** | `npm run deploy` | Builds + deploys to tripbi-dev.web.app |
| **Deploy to production** | `npm run deploy:prod` | Builds + deploys to tripbi.app |

That's it. Three commands cover 95% of your workflow.

---

## How It Works Under the Hood

### Environment Variables Control Everything

Vite reads a different `.env` file depending on the **build mode**:

| Build mode | Env file read | Firebase project | Has real keys? |
|------------|---------------|-----------------|----------------|
| `development` | `.env.development` | tripbi-dev | Yes |
| `production` | `.env.production` | tripbi-prod | Placeholders (until prod is set up) |

- `npm run dev` and `npm run deploy` both use **development** mode → `.env.development`
- `npm run build` and `npm run deploy:prod` both use **production** mode → `.env.production`

### What Each Deploy Command Does Step by Step

**`npm run deploy`** (deploy to dev):
```
1. npm run build:dev          → Bumps build number, compiles TS, bundles with .env.development
2. npx firebase use dev       → Switches Firebase CLI to tripbi-dev project
3. npx firebase deploy        → Uploads dist/ to tripbi-dev.web.app
```

**`npm run deploy:prod`** (deploy to production):
```
1. npm run build              → Bumps build number, compiles TS, bundles with .env.production
2. npx firebase use prod      → Switches Firebase CLI to tripbi-prod project
3. npx firebase deploy        → Uploads dist/ to tripbi.app
```

### The Classic Mistake (and why these scripts exist)

If you manually run `npm run build` then `npx firebase deploy` while pointed at tripbi-dev, you'll deploy **production placeholder keys** to the dev site. It will break with "API key not valid."

The `deploy` and `deploy:prod` scripts prevent this by always pairing the correct build mode with the correct Firebase project.

---

## All Available Commands

### Development

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start local dev server (localhost:5173) |
| `npm run check` | Run TypeScript compiler + ESLint (pre-deploy sanity check) |
| `npm run lint` | Run ESLint only |
| `npm run preview` | Preview a production build locally |

### Build

| Command | Purpose |
|---------|---------|
| `npm run build` | **Production** build (reads `.env.production`, bumps build number) |
| `npm run build:dev` | **Dev** build (reads `.env.development`, bumps build number) |
| `npm run build:no-bump` | Production build without bumping build number |

### Deploy

| Command | Purpose |
|---------|---------|
| `npm run deploy` | Build + deploy to **tripbi-dev.web.app** (testing) |
| `npm run deploy:dev` | Same as `deploy` (explicit alias) |
| `npm run deploy:prod` | Build + deploy to **tripbi.app** (production) |
| `npm run deploy:rules` | Deploy Firestore security rules + indexes to dev |
| `npm run deploy:functions` | Build + deploy Cloud Functions to dev |

### Version Management

| Command | Purpose |
|---------|---------|
| `npm run version:patch` | 0.1.0 → 0.1.1 (bug fixes) |
| `npm run version:minor` | 0.1.0 → 0.2.0 (new features) |
| `npm run version:major` | 0.1.0 → 1.0.0 (breaking changes) |
| `npm run version:sync` | Sync version to Android/iOS (Capacitor) |

Build number increments **automatically** on every `build` or `build:dev`. You only need the version commands for semantic version bumps.

### Testing

| Command | Purpose |
|---------|---------|
| `npm run test` | Run unit tests in watch mode |
| `npm run test:run` | Run unit tests once (CI mode) |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright end-to-end tests |

---

## Daily Workflow

### Starting Your Day

```bash
git pull origin main          # Get latest changes
npm run dev                   # Start local server → http://localhost:5173
```

### Making Changes

```bash
# 1. Code your changes locally with npm run dev running

# 2. Verify before deploying
npm run check                 # TypeScript + lint in one command

# 3. Deploy to dev for testing
npm run deploy                # Builds + deploys to tripbi-dev.web.app

# 4. Test at https://tripbi-dev.web.app

# 5. Commit when satisfied
git add <files>
git commit -m "feat: description"
git push origin main
```

### Deploying Firestore Rules or Cloud Functions

```bash
# After editing firestore.rules or firestore.indexes.json
npm run deploy:rules

# After editing functions/src/index.ts
npm run deploy:functions
```

---

## Environments Reference

| | Local | Dev (Testing) | Prod (Live) |
|---|---|---|---|
| **URL** | localhost:5173 | tripbi-dev.web.app | tripbi.app |
| **Firebase project** | tripbi-dev | tripbi-dev | tripbi-prod |
| **Env file** | .env.development | .env.development | .env.production |
| **Start/deploy** | `npm run dev` | `npm run deploy` | `npm run deploy:prod` |
| **Status** | Working | Working (build 42) | Not set up yet |

---

## Environment Files

| File | Contains | When it's read |
|------|----------|---------------|
| `.env.development` | Real tripbi-dev Firebase keys, SplitBi keys | `npm run dev`, `npm run deploy` |
| `.env.production` | tripbi-prod keys (placeholders until prod setup) | `npm run build`, `npm run deploy:prod` |
| `.env.example` | Template showing all required variables | Reference only |
| `functions/.env` | Resend API key (for Cloud Functions) | Cloud Functions runtime |

**Note:** `.env.development` is committed to git (dev keys are safe to share). `.env.production` will contain real keys once tripbi-prod is set up — at that point, consider moving prod secrets to GitHub Secrets for CI/CD only.

---

## Troubleshooting

### "API Key Not Valid" After Deploy

**Cause:** Wrong `.env` file was used during build.

```bash
# Fix: redeploy with the correct command
npm run deploy                # For dev
npm run deploy:prod           # For prod
```

### Firebase Deploy Fails

```bash
npx firebase login            # Check you're logged in
npx firebase use              # Check current project
npx firebase login --reauth   # Re-authenticate if needed
```

### Build Fails

```bash
npm run check                 # See TypeScript + lint errors
```

### Dev Server Won't Start

```bash
rm -rf node_modules && npm install && npm run dev
```
