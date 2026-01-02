# Backend - Flask Application

## Setup Instructions

1. **Create virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up PostgreSQL**
   - Install PostgreSQL (if not already installed)
   - Create a database: `CREATE DATABASE hair_salon_db;`
   - Note your connection details (host, port, database, user, password)

4. **Create .env file**
   Create a `.env` file in this directory with:
   ```
   FLASK_APP=run.py
   FLASK_ENV=development
   SECRET_KEY=your-secret-key-change-this
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/hair_salon_db
   OPENAI_API_KEY=your-openai-key-here
   ```
   
   **PostgreSQL Connection String Format:**
   ```
   postgresql://username:password@host:port/database_name
   ```

5. **Create app structure**
   You'll need to create:
   - `app/__init__.py` - Initialize Flask app
   - `app/config.py` - Configuration
   - `app/models/` - Database models
   - `app/routes/` - API routes
   - `run.py` - Entry point

6. **Run the app**
   ```bash
   python run.py
   ```

## Next Steps

Follow the **LEARNING_GUIDE.md** in the root directory to build this step by step!

Start with Phase 2: Database & Models

