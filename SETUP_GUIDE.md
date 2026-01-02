# 🚀 Setup Guide - Hair Salon AI System

Follow this guide to set up your development environment.

## Prerequisites

- Python 3.8+ installed
- Node.js 18+ and npm installed
- Git installed
- Code editor (VS Code recommended)

## Step 1: Project Structure

Create this folder structure:

```
hair-salon-ai-system/
├── backend/
└── frontend/
```

## Step 2: PostgreSQL Setup

### 2.1 Install PostgreSQL
**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Use the installer (includes pgAdmin)
- Remember the password you set for the `postgres` user

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2.2 Create Database
**Using psql (command line):**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hair_salon_db;

# Create a user (optional, but recommended)
CREATE USER salon_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hair_salon_db TO salon_user;

# Exit psql
\q
```

**Using pgAdmin (GUI):**
1. Open pgAdmin
2. Right-click "Databases" → Create → Database
3. Name it: `hair_salon_db`
4. Click Save

### 2.3 Note Your Connection Details
You'll need:
- **Host**: `localhost` (or `127.0.0.1`)
- **Port**: `5432` (default)
- **Database**: `hair_salon_db`
- **User**: `postgres` (or your custom user)
- **Password**: The password you set

## Step 3: Backend Setup (Flask)

### 3.1 Create Backend Directory
```bash
mkdir backend
cd backend
```

### 3.2 Create Virtual Environment
```bash
python -m venv venv
```

### 3.3 Activate Virtual Environment
**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 3.4 Install Dependencies
```bash
pip install -r requirements.txt
```

### 3.5 Basic Flask App Structure
You'll need to create:
- `app/__init__.py` - Flask app initialization
- `run.py` - Entry point to run the app
- `app/config.py` - Configuration settings
- `.env` - Environment variables (create this yourself)

## Step 4: Frontend Setup (React + Vite)

### 3.1 Create Frontend Project
```bash
cd ..  # Go back to project root
npm create vite@latest frontend -- --template react
cd frontend
```

### 3.2 Install Dependencies
```bash
npm install
```

### 3.3 Install Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3.4 Configure Tailwind
Update `tailwind.config.js` and add Tailwind directives to your CSS file.

## Step 5: Git Setup

### 4.1 Initialize Git
```bash
cd ..  # Go to project root
git init
```

### 4.2 Create .gitignore
Make sure to ignore:
- `venv/` or `env/`
- `node_modules/`
- `.env` files
- `__pycache__/`
- `*.pyc`

### 4.3 First Commit
```bash
git add .
git commit -m "Initial project setup"
```

## Step 6: GitHub Setup

### 5.1 Create GitHub Repository
1. Go to GitHub.com
2. Click "New repository"
3. Name it (e.g., "hair-salon-ai-system")
4. Don't initialize with README (you already have files)

### 5.2 Connect Local to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/hair-salon-ai-system.git
git branch -M main
git push -u origin main
```

## Step 7: Environment Variables

### Backend (.env file in backend/)
```
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/hair_salon_db
OPENAI_API_KEY=your-openai-api-key-here
```

**PostgreSQL Connection String Format:**
```
postgresql://username:password@host:port/database_name
```

**Example with custom user:**
```
DATABASE_URL=postgresql://salon_user:your_password@localhost:5432/hair_salon_db
```

### Frontend (.env file in frontend/)
```
VITE_API_URL=http://localhost:5000
```

**Important**: Add `.env` to `.gitignore` - never commit API keys!

## Step 8: Test Your Setup

### Test Backend
```bash
cd backend
python run.py
```
Visit: http://localhost:5000

### Test Frontend
```bash
cd frontend
npm run dev
```
Visit: http://localhost:5173

## Next Steps

1. Follow the **LEARNING_GUIDE.md** for step-by-step development
2. Start with Phase 1: Project Setup
3. Build features incrementally
4. Commit and push to GitHub regularly

---

**Need help?** Refer to LEARNING_GUIDE.md for detailed explanations!

