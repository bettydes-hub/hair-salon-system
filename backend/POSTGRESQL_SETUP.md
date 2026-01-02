# PostgreSQL Setup Guide

## Quick Setup for Development

### 1. Install PostgreSQL

**Windows:**
- Download installer from: https://www.postgresql.org/download/windows/
- Run installer, set password for `postgres` user
- Install pgAdmin (included in installer)

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

**Option A: Using psql (Command Line)**

```bash
# Connect to PostgreSQL
psql -U postgres

# Enter your password when prompted

# Create database
CREATE DATABASE hair_salon_db;

# (Optional) Create a dedicated user
CREATE USER salon_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE hair_salon_db TO salon_user;

# Exit
\q
```

**Option B: Using pgAdmin (GUI)**

1. Open pgAdmin
2. Connect to your PostgreSQL server (use password you set during installation)
3. Right-click on "Databases" → Create → Database
4. Name: `hair_salon_db`
5. Click "Save"

### 3. Connection String Format

For your `.env` file, use this format:

```
DATABASE_URL=postgresql://username:password@host:port/database_name
```

**Examples:**

Using default postgres user:
```
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/hair_salon_db
```

Using custom user:
```
DATABASE_URL=postgresql://salon_user:mysecurepass@localhost:5432/hair_salon_db
```

### 4. Test Connection

You can test if your connection string works by creating a simple Python script:

```python
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        print("✅ Successfully connected to PostgreSQL!")
except Exception as e:
    print(f"❌ Connection failed: {e}")
```

### 5. Common Issues

**Issue: "password authentication failed"**
- Check your password in the connection string
- Make sure you're using the correct username

**Issue: "database does not exist"**
- Make sure you created the database first
- Check the database name in your connection string

**Issue: "could not connect to server"**
- Make sure PostgreSQL is running
- Check if port 5432 is correct
- On Windows: Check if PostgreSQL service is running in Services

**Issue: "psycopg2" module not found**
- Make sure you installed: `pip install psycopg2-binary`
- This is already in requirements.txt

### 6. Useful PostgreSQL Commands

```sql
-- List all databases
\l

-- Connect to a database
\c hair_salon_db

-- List all tables
\dt

-- Describe a table
\d table_name

-- Exit psql
\q
```

### 7. Free Cloud PostgreSQL (Alternative)

If you don't want to install PostgreSQL locally, you can use free cloud services:

**Neon (Recommended):**
- https://neon.tech
- Free tier available
- Get connection string from dashboard

**Supabase:**
- https://supabase.com
- Free tier available
- PostgreSQL included

**Railway:**
- https://railway.app
- Free tier available

Just copy the connection string they provide into your `.env` file!

---

**Next Step:** Once PostgreSQL is set up, continue with the backend setup in `README.md`

