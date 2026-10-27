# Akatsuki's Draft — AI-Enabled Content Sharing Platform

> **Nodevember 4.0 Post-Event Project**  
> A fully-featured REST API built with Node.js, Express, MongoDB Atlas, JWT authentication, and Google Gemini AI.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Installation & Local Setup](#installation--local-setup)
5. [MongoDB Atlas Setup](#mongodb-atlas-setup)
6. [Google Gemini API Setup](#google-gemini-api-setup)
7. [Environment Variables](#environment-variables)
8. [Running the Server Locally](#running-the-server-locally)
9. [Admin Setup](#admin-setup)
10. [API Reference](#api-reference)
11. [Testing with Postman](#testing-with-postman)
12. [Verification Checklist](#verification-checklist)
13. [Deploying to Vercel](#deploying-to-vercel)
14. [Security Notes](#security-notes)

---

## Project Overview

Akatsuki's Draft is a backend content-sharing platform where:
- **Users** can register, create posts as drafts, and submit them for review.
- **Admins** approve or reject submitted posts; only approved posts are publicly visible.
- **Gemini AI** improves a user's post content and saves the result as a brand-new draft — the original is never touched.

---

## Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Runtime        | Node.js 18+                       |
| Framework      | Express 4                         |
| Database       | MongoDB Atlas + Mongoose          |
| Authentication | JWT + bcrypt                      |
| Validation     | express-validator                  |
| AI             | Google Generative AI JS SDK       |
| Deployment     | Vercel (serverless)               |

---

## Project Structure

```
akatsuki-draft/
├── scripts/
│   └── promoteAdmin.js       ← one-time admin promotion script
├── src/
│   ├── config/
│   │   └── db.js             ← MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── post.controller.js
│   │   ├── admin.controller.js
│   │   └── ai.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js   ← JWT protect + adminOnly
│   │   └── validate.middleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── post.routes.js
│   │   ├── admin.routes.js
│   │   └── ai.routes.js
│   └── index.js              ← Express app entry point
├── postman/
│   └── Akatsuki-Draft.postman_collection.json
├── .env.example
├── .gitignore
├── package.json
├── vercel.json
└── README.md
```

---

## Installation & Local Setup

### Prerequisites
- **Node.js 18+** — download from https://nodejs.org
- **npm** (comes with Node.js)
- A **MongoDB Atlas** account (free tier is fine)
- A **Google AI Studio** account for the Gemini API key

### Steps

```bash
# 1. Clone or copy the project folder
cd akatsuki-draft

# 2. Install dependencies
npm install

# 3. Create your .env file (copy the example first)
copy .env.example .env
```

Then open `.env` in a text editor and fill in your real values (see [Environment Variables](#environment-variables)).

---

## MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com and sign up / log in.
2. Create a **free M0 cluster**.
3. Under **Database Access** → Add a new database user (username + password).
4. Under **Network Access** → Add IP address → Add `0.0.0.0/0` (allow from anywhere) *or* your specific IP.
5. Click **Connect** on your cluster → **Connect your application** → copy the connection string.
6. Paste it into `.env` as `MONGODB_URI`, replacing `<username>` and `<password>` with your Atlas credentials.

Example:
```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/akatsuki-draft?retryWrites=true&w=majority
```

---

## Google Gemini API Setup

1. Go to https://aistudio.google.com/app/apikey
2. Click **Create API Key**.
3. Copy the key and paste it into `.env` as `GEMINI_API_KEY`.

> **Note:** The free tier of Gemini API has generous limits for development use.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in every value:

| Variable              | Description                                      |
|-----------------------|--------------------------------------------------|
| `MONGODB_URI`         | Full MongoDB Atlas connection string             |
| `JWT_SECRET`          | Long random string for signing JWTs             |
| `JWT_EXPIRES_IN`      | Token expiry (e.g. `7d`)                         |
| `GEMINI_API_KEY`      | Google Gemini API key                            |
| `PORT`                | Local server port (default `5000`)               |
| `ADMIN_PROMOTE_SECRET`| Secret required to run the promote-admin script  |

Generate a strong `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Running the Server Locally

```bash
# Development mode (auto-restarts on file changes)
npm run dev

# Production mode
npm start
```

You should see:
```
✅ MongoDB connected: cluster0.xxxxx.mongodb.net
🚀 Server listening on http://localhost:5000
```

Test the health check:
```bash
curl http://localhost:5000/
```
Expected response:
```json
{ "success": true, "message": "Akatsuki's Draft API is running 🚀", "version": "1.0.0" }
```

---

## Admin Setup

Public registration always creates `role: "user"`. To promote your account to admin:

**Step 1** — Register your account normally via `POST /auth/register`.

**Step 2** — Set the required environment variables and run the promotion script:

```bash
# Windows Command Prompt
set ADMIN_EMAIL=your@email.com && set ADMIN_SECRET_INPUT=your_admin_promote_secret_here && npm run promote-admin

# Windows PowerShell
$env:ADMIN_EMAIL="your@email.com"; $env:ADMIN_SECRET_INPUT="your_admin_promote_secret_here"; npm run promote-admin

# macOS / Linux
ADMIN_EMAIL=your@email.com ADMIN_SECRET_INPUT=your_secret npm run promote-admin
```

The `ADMIN_SECRET_INPUT` must match `ADMIN_PROMOTE_SECRET` in your `.env` file.

You will see: `✅ Your Name (your@email.com) has been promoted to admin.`

Log in again to get a fresh token that includes your admin role.

---

## API Reference

> All protected routes require: `Authorization: Bearer <your_jwt_token>`

### Authentication

| Method | Endpoint          | Auth     | Description              |
|--------|-------------------|----------|--------------------------|
| POST   | `/auth/register`  | None     | Register a new user      |
| POST   | `/auth/login`     | None     | Login and receive JWT    |
| GET    | `/auth/me`        | Required | Get current user profile |

**Register body:**
```json
{ "name": "Alice", "email": "alice@example.com", "password": "secret123" }
```

**Login body:**
```json
{ "email": "alice@example.com", "password": "secret123" }
```

---

### Posts

| Method | Endpoint            | Auth     | Description                          |
|--------|---------------------|----------|--------------------------------------|
| POST   | `/posts`            | Required | Create a new post (draft/pending)    |
| GET    | `/posts`            | None     | Get all approved posts               |
| GET    | `/posts/:id`        | None     | Get a single approved post           |
| GET    | `/posts/my-posts`   | Required | Get all your posts (any status)      |
| PATCH  | `/posts/:id`        | Required | Edit your own post                   |
| DELETE | `/posts/:id`        | Required | Delete your own post                 |

**Create post body:**
```json
{
  "title": "My Post Title",
  "description": "Short summary",
  "content": "Full article content goes here...",
  "category": "Technology",
  "status": "draft"
}
```
> `status` on creation can only be `"draft"` or `"pending"`. Any other value defaults to `"draft"`.

---

### Admin

| Method | Endpoint                       | Auth  | Description              |
|--------|--------------------------------|-------|--------------------------|
| GET    | `/admin/posts/pending`         | Admin | List all pending posts   |
| PATCH  | `/admin/posts/approve/:id`     | Admin | Approve a post           |
| PATCH  | `/admin/posts/reject/:id`      | Admin | Reject a post            |

---

### AI

| Method | Endpoint               | Auth     | Description                                 |
|--------|------------------------|----------|---------------------------------------------|
| POST   | `/ai/improve/:postId`  | Required | Improve your post with Gemini AI            |

- Creates a **new** draft with `(AI Improved)` suffix in the title.
- The **original post is never modified or deleted**.
- The new draft has a **new MongoDB `_id`** and `status: "draft"`.

---

## Testing with Postman

1. Open Postman → **Import** → choose `postman/Akatsuki-Draft.postman_collection.json`.
2. The collection has three **variables**: `baseUrl`, `token`, `postId`.
3. **Run requests in order:**
   - Register → token is auto-saved to `{{token}}`
   - Create Post → `postId` is auto-saved to `{{postId}}`
   - Run remaining requests
4. For admin tests: promote your account, log in again, copy the new token, and set `{{token}}` manually.

Each request has **automated tests** visible in the "Tests" tab — green = pass.

---

## Verification Checklist

After setting up, go through each item:

- [ ] Server starts with `npm run dev` and shows MongoDB connected
- [ ] `GET /` returns the health check JSON
- [ ] Register creates a user with `role: "user"` — never `"admin"`
- [ ] Login returns a valid JWT
- [ ] `GET /auth/me` returns user without a `password` field
- [ ] Creating a post without a token returns 401
- [ ] `GET /posts` returns only approved posts
- [ ] `GET /posts/my-posts` returns drafts, pending, approved, rejected for the owner
- [ ] Editing someone else's post returns 403
- [ ] Deleting someone else's post returns 403
- [ ] Non-admin accessing `/admin/*` returns 403
- [ ] Admin can list pending posts
- [ ] Admin can approve → post becomes visible at `GET /posts`
- [ ] Admin can reject → post does NOT appear at `GET /posts`
- [ ] AI endpoint creates a NEW post with a different `_id`
- [ ] Original post is unchanged after calling AI endpoint
- [ ] AI endpoint without token returns 401
- [ ] Invalid MongoDB ID returns 400

---

## Deploying to Vercel

### Setup

1. Push your code to a **GitHub repository** (make sure `.env` is in `.gitignore` — never commit it!).
2. Go to https://vercel.com and import your GitHub repository.
3. Under **Environment Variables** in the Vercel dashboard, add all variables from `.env.example` with your real values.
4. Deploy — Vercel will detect `vercel.json` and use `@vercel/node` automatically.

### Deployment Limitations on Vercel

> **Important — read before deploying:**

| Limitation | Detail |
|---|---|
| **Serverless cold starts** | Each request may spin up a new container. MongoDB connections can be slow on first request — this is normal. |
| **No persistent file system** | Do not write files to disk on Vercel; use MongoDB for all storage. |
| **Timeout** | Vercel free tier has a 10-second function timeout. Gemini API calls can occasionally be slow — if you get timeouts, upgrade to Pro or self-host. |
| **No WebSockets** | Vercel serverless functions do not support long-lived connections. |

### Vercel Test

After deployment, test your live URL:
```bash
curl https://your-project.vercel.app/
```

---

## Security Notes

- Passwords are **bcrypt-hashed** with salt rounds = 12.
- `password` field is `select: false` on the Mongoose schema — it never appears in API responses.
- JWT secret is **never hardcoded** — always from `process.env.JWT_SECRET`.
- Admin role can **only be set** via the offline promotion script that requires a matching secret.
- Public registration **always** sets `role: "user"` regardless of what the request body contains.
- Draft, pending, and rejected posts are **invisible** to unauthenticated or non-owner requests.
- MongoDB IDs are **validated** before queries — invalid IDs return 400, not a Mongoose cast error 500.
