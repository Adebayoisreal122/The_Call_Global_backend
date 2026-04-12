# The Call Global Ministry — Full Stack Application

A complete ministry website with React frontend and Node.js/Express/MongoDB backend.

---

## Project Structure

```
thecall-global/     ← React frontend (Vite + Tailwind)
thecall-api/        ← Express REST API (Node.js + MongoDB)
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local) OR a free MongoDB Atlas account (cloud)
- npm

---

## 1. Backend Setup (`thecall-api`)

### Install dependencies
```bash
cd thecall-api
npm install
```

### Configure environment
```bash
cp .env.example .env
```

Open `.env` and set your values:

```env
PORT=5000
NODE_ENV=development

# Local MongoDB:
MONGO_URI=mongodb://localhost:27017/thecall-global

# OR MongoDB Atlas (recommended for production):
# MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/thecall-global

JWT_SECRET=your_long_random_secret_at_least_32_chars
JWT_EXPIRES_IN=7d

ADMIN_EMAIL=admin@thecallglobal.org
ADMIN_PASSWORD=YourSecurePassword123!

CLIENT_URL=http://localhost:5173
```

### Seed the database
This creates the admin account + sample programs, devotionals, and testimonies:
```bash
npm run seed
```

Output:
```
🌱 Starting database seed...
🗑️  Cleared existing data
👤 Admin created: admin@thecallglobal.org
📅 Programs seeded
📖 Devotionals seeded
⭐ Testimonies seeded
✅ Seed complete!
```

### Start the API server
```bash
npm run dev       # development (auto-restarts on file changes)
npm start         # production
```

Server runs at: `http://localhost:5000`
Health check: `http://localhost:5000/health`

---

## 2. Frontend Setup (`thecall-global`)

### Install dependencies
```bash
cd thecall-global
npm install
```

### Configure environment
```bash
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

For production, change this to your deployed API URL:
```env
VITE_API_URL=https://your-api-domain.com/api
```

### Start the dev server
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

### Build for production
```bash
npm run build     # outputs to dist/
```

---

## 3. Admin Panel

Navigate to: `http://localhost:5173/admin/login`

Login with the credentials from your `.env`:
- **Email:** `admin@thecallglobal.org`
- **Password:** `Admin@2024!` (or whatever you set)

**What the admin can do:**
| Section | Actions |
|---------|---------|
| Dashboard | Overview of all stats, recent registrations, pending testimonies |
| Programs | Create, edit, delete upcoming programs |
| Devotionals | Post daily Word of God messages with scripture & category |
| Testimonies | Review submitted testimonies, approve or delete them |
| Prayer Requests | View all prayer requests, mark as prayed for |
| Registrations | View all registered members, search, export CSV |

---

## 4. API Reference

All protected routes require: `Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | Admin login → returns JWT |
| GET | `/api/auth/me` | ✅ | Validate token, get current admin |
| PUT | `/api/auth/change-password` | ✅ | Change admin password |

### Programs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/programs` | ❌ | All programs (add `?upcoming=true` to filter) |
| GET | `/api/programs/:id` | ❌ | Single program |
| POST | `/api/programs` | ✅ | Create program |
| PUT | `/api/programs/:id` | ✅ | Update program |
| DELETE | `/api/programs/:id` | ✅ | Delete program |

### Devotionals
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/devotionals` | ❌ | All devotionals (newest first) |
| GET | `/api/devotionals/latest` | ❌ | Single latest devotional (for homepage) |
| GET | `/api/devotionals/:id` | ❌ | Single devotional |
| POST | `/api/devotionals` | ✅ | Create devotional |
| DELETE | `/api/devotionals/:id` | ✅ | Delete devotional |

### Testimonies
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/testimonies` | ❌ | Approved testimonies only (public site) |
| GET | `/api/testimonies/all` | ✅ | All testimonies including pending (admin) |
| POST | `/api/testimonies` | ❌ | Submit a testimony (starts unapproved) |
| PATCH | `/api/testimonies/:id/approve` | ✅ | Approve a testimony |
| DELETE | `/api/testimonies/:id` | ✅ | Delete a testimony |

### Prayer Requests
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/prayers` | ❌ | Submit a prayer request |
| GET | `/api/prayers` | ✅ | All prayer requests (admin) |
| PATCH | `/api/prayers/:id/prayed` | ✅ | Mark as prayed for |
| DELETE | `/api/prayers/:id` | ✅ | Delete a request |

### Registrations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/registrations` | ❌ | Register as a member |
| GET | `/api/registrations` | ✅ | All registrations (admin) |
| DELETE | `/api/registrations/:id` | ✅ | Remove a registration |

---

## 5. Deployment

### Backend → Railway (recommended)

1. Push `thecall-api` to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add a MongoDB plugin OR use MongoDB Atlas
4. Set all environment variables in Railway dashboard
5. Railway auto-detects `npm start` as the start command

### Frontend → Vercel

1. Push `thecall-global` to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import
3. Add environment variable: `VITE_API_URL=https://your-railway-api-url.com/api`
4. Vercel auto-detects Vite and runs `npm run build`

### Update CORS for production
In `thecall-api/.env`:
```env
CLIENT_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

---

## 6. Security Notes

- **JWT tokens** expire in 7 days (configurable via `JWT_EXPIRES_IN`)
- **Passwords** are hashed with bcrypt (12 salt rounds) — never stored in plain text
- **Rate limiting**: 100 req/15min globally, 10 req/15min on `/api/auth/login`
- **Helmet.js** sets secure HTTP headers automatically
- **CORS** only allows your specific frontend domain
- **Admin route** `/admin` is fully client-side protected — unauthenticated users are redirected to `/admin/login`
- **Testimony moderation** — all submissions are `approved: false` by default and must be reviewed by admin before appearing publicly

---

## 7. Folder Structure

### Backend (`thecall-api/src/`)
```
config/
  db.js           ← MongoDB connection
  seed.js         ← Database seeder script

models/
  Admin.js        ← Admin user schema + bcrypt hook
  Program.js      ← Ministry programs
  Devotional.js   ← Daily devotionals
  Testimony.js    ← Member testimonies
  PrayerRequest.js← Prayer requests
  Registration.js ← Member registrations

controllers/
  authController.js
  programController.js
  devotionalController.js
  testimonyController.js
  prayerController.js
  registrationController.js

routes/
  auth.js
  programs.js
  devotionals.js
  testimonies.js
  prayers.js
  registrations.js

middleware/
  auth.js         ← JWT protect + restrictTo
  errorHandler.js ← Global error handler + 404

server.js         ← App entry point
```

### Frontend (`thecall-global/src/`)
```
services/
  api.js          ← All fetch calls to the backend

context/
  AuthContext.jsx     ← Admin JWT state
  ThemeContext.jsx    ← Dark/light theme
  MinistryContext.jsx ← All data (fetched from API)

admin/
  AdminLogin.jsx      ← Login page
  ProtectedRoute.jsx  ← Route guard
  AdminLayout.jsx     ← Sidebar + topbar
  AdminDashboard.jsx
  AdminPrograms.jsx
  AdminDevotionals.jsx
  AdminTestimonies.jsx
  AdminPrayerRequests.jsx
  AdminRegistrations.jsx

components/
  Navbar.jsx
  Footer.jsx
  Hero.jsx
  Features.jsx
  About.jsx
  Programs.jsx
  Testimonies.jsx
  Join.jsx
  Contact.jsx

pages/
  HomePage.jsx
  DevotionalsPage.jsx
```
