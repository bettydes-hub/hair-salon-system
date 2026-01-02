# Frontend - React + Vite Application

## Setup Instructions

1. **Create the project** (if not already created)
   ```bash
   npm create vite@latest . -- --template react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Tailwind CSS**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

4. **Configure Tailwind**
   - Update `tailwind.config.js` content paths
   - Add Tailwind directives to your CSS file:
     ```css
     @tailwind base;
     @tailwind components;
     @tailwind utilities;
     ```

5. **Create .env file**
   Create a `.env` file with:
   ```
   VITE_API_URL=http://localhost:5000
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

## Project Structure

You'll create:
- `src/components/` - React components
- `src/pages/` - Page components
- `src/services/` - API service functions
- `src/utils/` - Helper functions

## Next Steps

Follow the **LEARNING_GUIDE.md** in the root directory to build this step by step!

Start with Phase 4: Frontend - Connect to Backend

