# 🎓 University Event Management — Backend with Neo4j

Full backend for your VIT University Event Management system using **Node.js + Express + Neo4j**.

---

## 📁 Project Structure

```
event-management-backend/
├── server.js                    # Main entry point
├── package.json
├── .env.example                 # Copy to .env and fill in values
├── config/
│   └── db.js                    # Neo4j driver & connection
├── middleware/
│   └── auth.js                  # JWT protect + adminOnly guards
├── routes/
│   ├── auth.js                  # Register, Login, /me
│   ├── events.js                # CRUD events + registrations
│   └── admin.js                 # Admin: stats, users, attendees
└── frontend-integration/        # Drop these into your existing frontend
    ├── api.js                   # API helper (include in all pages)
    ├── login.js                 # Replace your login.js
    ├── register.js              # Replace your register.js
    ├── index.js                 # Replace your index.js
    └── admin.js                 # Replace your admin.js
```

---

## 🚀 Setup Instructions

### Step 1: Get a Neo4j Database

**Option A — Neo4j AuraDB (Free Cloud, Recommended)**
1. Go to https://neo4j.com/cloud/platform/aura-graph-database/
2. Create a free account → Create a Free instance
3. Download the credentials file shown — it contains your URI, username, password
4. Your URI will look like: `neo4j+s://xxxxxxxx.databases.neo4j.io`

**Option B — Local Neo4j Desktop**
1. Download Neo4j Desktop from https://neo4j.com/download/
2. Create a new project and database
3. Your URI will be: `bolt://localhost:7687`

---

### Step 2: Install & Configure Backend

```bash
# 1. Clone/copy this folder to your machine
cd event-management-backend

# 2. Install dependencies
npm install

# 3. Copy .env.example to .env and fill in your values
cp .env.example .env
```

Edit your `.env` file:
```env
NEO4J_URI=neo4j+s://xxxxxxxx.databases.neo4j.io   # from AuraDB
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_aura_password_here

JWT_SECRET=any_long_random_string_here_min_32_chars

PORT=5000

ADMIN_SECRET=university_admin_2026   # change this! only admins who know this can register as admin
```

---

### Step 3: Run the Backend

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

You should see:
```
✅ Connected to Neo4j successfully
✅ Neo4j constraints and indexes initialized
🚀 Server running on http://localhost:5000
```

---

### Step 4: Integrate with Your Frontend

1. Copy all files from `frontend-integration/` into your frontend project root
2. In **every** HTML file, add `api.js` before other scripts:

```html
<!-- Add this BEFORE your other script tags -->
<script src="api.js"></script>
```

3. Then include the page-specific script:
```html
<!-- In login.html -->
<script src="api.js"></script>
<script src="login.js"></script>

<!-- In register.html -->
<script src="api.js"></script>
<script src="register.js"></script>

<!-- In index.html -->
<script src="api.js"></script>
<script src="index.js"></script>

<!-- In admin.html -->
<script src="api.js"></script>
<script src="admin.js"></script>
```

4. Update the `API_BASE` in `api.js` to your deployed backend URL when hosting:
```js
const API_BASE = "https://your-backend.railway.app/api";  // after deploying
```

---

### Step 5: Add Required HTML Element IDs

Add these IDs to your existing HTML elements so the JS can find them:

**All pages:**
```html
<button id="logout-btn" style="display:none">Logout</button>
```

**login.html:**
```html
<input id="email" type="email">
<input id="password" type="password">
<p id="error-message"></p>
```

**register.html:**
```html
<input id="name" type="text">
<input id="email" type="email">
<input id="password" type="password">
<input id="phone" type="tel">
<p id="error-message"></p>
<p id="success-message"></p>
```

**index.html:**
```html
<div class="events-container"><!-- events render here --></div>
<a id="login-link" href="login.html">Login</a>
```

**admin.html:**
```html
<span id="admin-name"></span>
<span id="stat-students"></span>
<span id="stat-total-events"></span>
<span id="stat-upcoming"></span>
<span id="stat-completed"></span>
<span id="stat-registrations"></span>
<div id="admin-events-list"></div>

<!-- Create Event Form -->
<form id="create-event-form">
  <input id="event-title" type="text" required>
  <input id="event-date" type="date" required>
  <input id="event-location" type="text" required>
  <textarea id="event-description"></textarea>
  <input id="event-image" type="url">
  <input id="event-capacity" type="number" value="100">
  <button type="submit">Create Event</button>
</form>
```

---

## 🔐 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register student |
| POST | `/api/auth/login` | Public | Login (student or admin) |
| GET | `/api/auth/me` | Any | Get current user + registered events |
| GET | `/api/events` | Public | All upcoming events |
| GET | `/api/events/all` | Admin | All events including completed |
| GET | `/api/events/:id` | Public | Single event details |
| POST | `/api/events` | Admin | Create event |
| PUT | `/api/events/:id` | Admin | Update event |
| PATCH | `/api/events/:id/complete` | Admin | Mark as completed |
| DELETE | `/api/events/:id` | Admin | Delete event |
| POST | `/api/events/:id/register` | Student | Register for event |
| DELETE | `/api/events/:id/register` | Student | Cancel registration |
| GET | `/api/admin/stats` | Admin | Dashboard statistics |
| GET | `/api/admin/users` | Admin | All students |
| GET | `/api/admin/events/:id/attendees` | Admin | Event attendees list |

---

## 🌐 Deploy Backend (Free Options)

**Railway (Easiest):**
1. Push this folder to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Add environment variables in Railway's Variables tab
4. Railway gives you a public URL like `https://your-app.railway.app`

**Render:**
1. Go to https://render.com → New Web Service
2. Connect your GitHub repo
3. Set build command: `npm install` | Start command: `npm start`
4. Add environment variables

---

## 🗄️ Neo4j Graph Model

```
(:User {id, name, email, password, phone, role, createdAt})
    -[:REGISTERED_FOR {registeredAt}]->
(:Event {id, title, description, date, location, imageUrl, capacity, status, createdBy, createdAt})
```

**Roles:** `student` | `admin`  
**Event status:** `upcoming` | `completed`

---

## 📝 Notes

- Admin registration requires `ADMIN_SECRET` from your `.env`
- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens expire in 7 days
- Neo4j AuraDB free tier is sufficient for this project
