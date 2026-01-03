# Bazano Backend – Complete Change & Maintenance Documentation

**Project Name:**  
Bazano (بازانو) Backend

**Current State:**  
Node.js server with SQLite database for dynamic data handling

**Date:**  
January 03, 2026

**Purpose:**  
This document explains exactly what developers must do when making changes to the backend — which files to edit, which parts must never be changed, and which parts are safe/flexible. Focus is on code, development, and server-side logic.

---

## 1. General Rules for Any Change

| Rule | Description |
|------|-------------|
| **DO NOT DELETE** any core backend modules or dependencies | The server functionality must stay intact |
| **DO NOT MOVE** the `code` folder or its subfolders | Folder structure must remain exactly as shown |
| **DO NOT CHANGE** core file names (`app.js`, `package.json`, etc.) | Scripts and dependencies rely on these names |
| **ALWAYS TEST** after changes: run `npm start` in `/code` and query endpoints like `http://localhost:3000/api/products` | Use tools like Postman or curl for API testing |

---

## 2. Folder Structure (Never Change This Structure)

```
Bazano/                           ← Root folder (backend lives in `code`)
└── code/                         ← Backend root – NEVER move or rename
    ├── app.js                    ← Main server code
    ├── package.json              ← Dependencies and scripts
    ├── package-lock.json         ← Lockfile for reproducible installs
    ├── node_modules/             ← Installed packages (do not edit manually)
    └── data/
        └── database.db           ← SQLite database file
```

---

## 3. What to Change & Where (By Feature)

### A. Adding / Editing / Deleting Data Models (e.g., Products)

| Task | What to Do | Where to Change | Must NOT Change |
|------|------------|-----------------|-----------------|
| Add new entity (e.g., new table like users) | 1. Create table in database 2. Add queries in app.js | 1. code/data/database.db (use DB Browser for SQLite) 2. Add new routes/endpoints | Do not alter existing table schemas without migration |
| Edit entity fields (e.g., add discount to products) | 1. Alter table in database 2. Update SELECT/INSERT queries | code/data/database.db and app.js | Existing data integrity; add defaults if needed |
| Delete entity | 1. Drop table or delete rows 2. Remove related queries | code/data/database.db and app.js | Do not delete core tables like products without backup |
| Add relationships (e.g., foreign keys) | Add constraints in database schema | code/data/database.db | Ensure no data loss; test queries |

**Important**: Always backup `database.db` before schema changes. Use SQL migrations for production.

### B. Changing API Endpoints and Routes

| Area | Safe to Change? | Where | Notes |
|------|-----------------|-------|-------|
| Add new endpoint (e.g., /api/users) | Yes | app.js (add app.get/post/etc.) | Follow REST conventions; add error handling |
| Modify existing endpoint (e.g., add filters to /api/products) | Yes | app.js (edit SQL query or logic) | Keep response format consistent for frontend compatibility |
| Add authentication/middleware | Yes | app.js (use express middleware) | Install via npm if needed (e.g., jwt) |
| Change HTTP methods (GET to POST) | Yes, with caution | app.js | Update frontend calls accordingly |
| Error handling and logging | Yes | app.js (add try-catch, console.log) | Use libraries like winston for production logging |

**Never delete**: Core routes like `/api/products` without alternatives.

### C. Database Queries and Logic

| Change | Can Do? | How |
|--------|---------|-----|
| Optimize query (e.g., add indexes) | Yes | Alter database.db (e.g., CREATE INDEX) |
| Add parameterized queries for security | Yes | Use ? placeholders in sqlite3 queries |
| Implement transactions | Yes | Use db.serialize() or db.run() in batches |
| Add views or triggers | Yes | Execute SQL in database.db |
| Switch to another DB (e.g., PostgreSQL) | Yes, major change | Update package.json, app.js connection; migrate data |

**Never delete**:  
- Database connection code (`const db = new sqlite3.Database(...)`)  
- Error handling in queries

### D. Dependencies and Configuration

| Task | Where | Details |
|------|-------|---------|
| Add new package (e.g., for CORS) | package.json | Run `npm install <package>`; update app.js to use it |
| Update package versions | package.json | Run `npm update`; test thoroughly |
| Change server port or env vars | app.js | Edit `const PORT = 3000;` or add process.env |
| Add config file | code/config.js (new file) | Import and use in app.js |
| Implement testing | Add tests/ folder | Use jest or mocha; add to package.json scripts |

**Never delete**:  
- `express` and `sqlite3` dependencies  
- `app.listen(PORT)` line

### E. Adding New Features (e.g., Authentication, Caching)

| Task | Steps |
|------|-------|
| Add user authentication | 1. Add users table 2. Add /api/login endpoint 3. Use middleware for protected routes |
| Implement caching (e.g., Redis) | 1. Install redis package 2. Connect in app.js 3. Cache query results |
| Add background jobs | 1. Install node-cron 2. Add scheduled tasks in app.js |

Ensure new features don't break existing APIs.

---

## 4. What MUST Stay Exactly the Same (Critical Parts)

| Part | Why It Must Not Change |
|------|------------------------|
| `app.use(express.static(...))` | Serves static files if integrated with frontend |
| Database file path (`./data/database.db`) | Connection depends on this |
| Core query structures in endpoints | Frontend expects specific JSON formats |
| Express app initialization | Base for all routes |
| Package.json scripts (e.g., "start": "node app.js") | For running the server |

---

## 5. Tools Needed for Changes

| Tool | Use |
|------|-----|
| DB Browser for SQLite (free) | Edit and query `database.db` |
| Text editor (VS Code recommended) | Edit JS, JSON files |
| Node.js installed | Run and develop the server |
| Postman or Insomnia | Test API endpoints |
| npm or yarn | Manage dependencies |

---

## 6. Summary: Safe vs Dangerous Changes

| Safe Changes | Dangerous (Don't Do) |
|--------------|-----------------------|
| Add new routes/endpoints | Delete core dependencies |
| Update queries with parameters | Change database path without updates |
| Install new packages | Remove error handling |
| Add tests and logging | Alter schemas without backups |
| Optimize performance | Delete connection code |

---

**Your backend is now robust, scalable, and easy to develop.**

Follow this document → any developer can update the backend safely without breaking functionality.