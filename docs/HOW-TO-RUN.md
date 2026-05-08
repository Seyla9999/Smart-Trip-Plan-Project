# 🚀 How to Run Smart Trip Plan Project

This guide will help you start and run the Smart Trip Plan website locally on your computer.

---

## 📋 Prerequisites

Before starting, make sure you have:

- ✅ **Node.js** installed (v18 or higher)
- ✅ **PostgreSQL 18** installed and running
- ✅ **npm** or **yarn** package manager
- ✅ Database `smart_trip` created
- ✅ Database password configured in `backend/.env`

---

## ⚙️ Initial Setup (First Time Only)

### 1. Configure Database Connection

Make sure your `backend/.env` file has the correct database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=400892
DB_NAME=smart_trip
PORT=3000
```

> **Note:** Replace `DB_PASSWORD` with your actual PostgreSQL password.

### 2. Install Dependencies

Open PowerShell and run:

```powershell
# Install Backend Dependencies
cd "d:\YEAR_4_Documents\YEAR_4_Documents\Personal\S2\Internet Programming II\Project\Smart-Trip-Plan-Project\backend"
npm install

# Install Frontend Dependencies
cd ..
npm install
```

### 3. Build Backend (First Time)

```powershell
cd backend
npm run build
```

---

## 🎯 Starting the Application

### Method 1: Using Two Terminals (Recommended)

#### Terminal 1 - Start Backend Server

```powershell
cd "d:\YEAR_4_Documents\YEAR_4_Documents\Personal\S2\Internet Programming II\Project\Smart-Trip-Plan-Project\backend"
node dist/main.js
```

**Expected Output:**
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [NestApplication] Nest application successfully started
```

**Backend URL:** http://localhost:3000

#### Terminal 2 - Start Frontend Server

```powershell
cd "d:\YEAR_4_Documents\YEAR_4_Documents\Personal\S2\Internet Programming II\Project\Smart-Trip-Plan-Project"
npm run dev
```

**Expected Output:**
```
VITE v8.0.3  ready in 6052 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Frontend URL:** http://localhost:5173

---

### Method 2: Development Mode with Auto-Reload

For backend development with automatic restart on file changes:

```powershell
cd backend
npm run start:dev
```

---

## 🌐 Accessing the Website

Once both servers are running, open your browser and navigate to:

### **Main Website:**
- 🏠 **Home Page:** http://localhost:5173/
- 👥 **Community Page:** http://localhost:5173/community
- 🗺️ **Province Details:** http://localhost:5173/province/[slug]

### **Backend API:**
- 📡 **API Base:** http://localhost:3000
- 👋 **Test Endpoint:** http://localhost:3000/ (Returns "Hello World!")
- 📊 **Community Feed:** http://localhost:3000/community/feed

---

## 🔍 Verifying Everything Works

### Check Backend Connection

Open a new PowerShell terminal and run:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/" -Method GET
```

**Expected:** `Hello World!`

### Check Database Connection

```powershell
cd backend
node check-tables.js
```

**Expected:** Shows 5 tables with record counts

### Check Frontend Data Loading

1. Open http://localhost:5173/community
2. Press `F12` to open Developer Console
3. Look for these messages:
   ```
   🔄 Fetching data from backend...
   ✅ Data received from backend: {...}
   ✅ Loaded 3 stories and 3 travelers from PostgreSQL
   ```

---

## 🛑 Stopping the Servers

### To Stop Backend:
- Press `Ctrl + C` in the backend terminal

### To Stop Frontend:
- Press `Ctrl + C` in the frontend terminal

### Force Stop All Node Processes:

```powershell
Get-Process | Where-Object { $_.ProcessName -like "*node*" } | Stop-Process -Force
```

---

## 🐛 Troubleshooting

### Problem: Port 3000 Already in Use

**Error:** `listen EADDRINUSE: address already in use :::3000`

**Solution:**
```powershell
# Find and stop the process using port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Problem: Frontend Can't Connect to Backend

**Solution:**
1. Make sure backend is running on port 3000
2. Check CORS is enabled in backend
3. Verify `src/api/axios.ts` has correct baseURL

### Problem: Database Connection Failed

**Error:** `password authentication failed for user "postgres"`

**Solution:**
1. Check your PostgreSQL password
2. Update `backend/.env` file with correct password
3. Restart backend server

### Problem: Tables Not Found in Database

**Solution:**
1. Make sure backend has started successfully at least once
2. TypeORM will auto-create tables on first run (synchronize: true)
3. Check tables in pgAdmin under: `Databases → smart_trip → Schemas → public → Tables`

---

## 📦 Project Structure

```
Smart-Trip-Plan-Project/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── modules/
│   │   │   └── community/  # Community features
│   │   ├── db/             # Database config
│   │   └── main.ts         # Entry point
│   ├── dist/               # Compiled JavaScript
│   ├── .env                # Database credentials
│   └── package.json
│
├── src/                    # Vue.js Frontend
│   ├── views/
│   │   └── CommunityView.vue  # Community page
│   ├── components/
│   ├── api/
│   │   └── axios.ts        # API client
│   └── router/
│
├── docs/                   # Documentation
│   ├── HOW-TO-RUN.md      # This file
│   ├── DATABASE-QUERIES.md # SQL queries
│   └── README.md           # Project overview
│
└── package.json            # Frontend dependencies
```

---

## 🎉 Success Checklist

- [ ] PostgreSQL service is running
- [ ] Backend server started successfully (port 3000)
- [ ] Frontend server started successfully (port 5173)
- [ ] Database `smart_trip` exists
- [ ] 5 tables created in database
- [ ] Can access http://localhost:5173
- [ ] Can see 3 stories on Community page
- [ ] Console shows "Loaded X stories from PostgreSQL"

---

## 🚫 DO NOT Push to GitHub

**Important:** This project contains sensitive information in `backend/.env`. 

Make sure `.gitignore` includes:
```
backend/.env
node_modules/
dist/
.DS_Store
```

**To verify:**
```powershell
git status
```

The `.env` file should NOT appear in untracked files.

---

## 💡 Quick Start Commands

```powershell
# Start Backend
cd backend
node dist/main.js

# Start Frontend (in new terminal)
cd ..
npm run dev

# View Data (optional)
cd backend
node view-data.js

# Check Tables (optional)
cd backend
node check-tables.js
```

---

## 📞 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check server logs for error messages
4. Ensure database is running and accessible

---

**Last Updated:** May 7, 2026
