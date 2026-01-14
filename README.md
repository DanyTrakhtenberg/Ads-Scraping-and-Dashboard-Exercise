# Ads Scraping and Dashboard Exercise

A POC system that scrapes Facebook Ads Library data for Nike and displays it in a web dashboard.

## Project Structure

```
Ads-Scraping-and-Dashboard-Exercise/
├── scraper/           # Python scraper (Part 1)
├── backend/           # Node.js API (Part 2)
└── frontend/          # React dashboard (Part 2)
```

---

## Part 1: Scraper

### Overview

The scraper uses Playwright to navigate to Facebook Ads Library, captures GraphQL API responses, and extracts ad data including all versions/variations of each ad.

### Prerequisites

- Python 3.8+ (use `py --version` to check)
- Playwright browsers installed
- Virtual environment (optional but recommended)

### Setup

1. **Navigate to scraper directory:**
   ```powershell
   cd scraper
   ```

2. **Create and activate virtual environment:**
   ```powershell
   py -m venv venv
   venv\Scripts\Activate.ps1
   ```

3. **Install dependencies:**
   ```powershell
   py -m pip install -r requirements.txt
   ```

4. **Install Playwright browsers:**
   ```powershell
   playwright install chromium
   ```

### Running the Scraper

1. **Navigate to scraper source directory:**
   ```powershell
   cd scraper\src
   ```

2. **Activate virtual environment (if not already active):**
   ```powershell
   ..\..\venv\Scripts\Activate.ps1
   ```

3. **Run the scraper:**
   ```powershell
   py scrape_graphql.py
   ```

   This will:
   - Open Facebook Ads Library page
   - Scroll to load ads (infinite scroll)
   - Capture GraphQL API responses
   - Parse and extract ad data (with all versions)
   - Save to `scraped_ads.json`

4. **Output files:**
   - `scraped_ads.json` - Processed ad data (ready for database)
   - `graphql_responses.json` - Raw GraphQL responses (for debugging)

### Scraped Data Structure

Each ad includes:
- **Ad ID** (Facebook Library ID)
- **Status** (active/inactive)
- **Platforms** (Facebook, Instagram, etc.)
- **Start/End dates**
- **All versions** (variations) with:
  - Ad copy/text
  - Images/videos
  - Product titles
  - Links and CTAs

---

## Database Setup (PostgreSQL with Docker)

### Prerequisites

- Docker Desktop installed and running
- Download: https://www.docker.com/products/docker-desktop/

### Setup PostgreSQL

1. **Start PostgreSQL container:**
   ```powershell
   cd scraper
   docker-compose up -d
   ```

   This starts a PostgreSQL 15 container with:
   - Database: `ads_db`
   - User: `postgres`
   - Password: `postgres`
   - Port: `5432`

2. **Verify container is running:**
   ```powershell
   docker ps
   ```

   You should see `ads-postgres` container running.

3. **Configure database connection:**
   
   The `.env` file is already configured with:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ads_db
   ```

   If you need to change it, edit `scraper/.env`

4. **Install database dependencies:**
   ```powershell
   cd scraper
   venv\Scripts\Activate.ps1
   py -m pip install -r requirements.txt
   ```

### Database Schema

The database uses a normalized 3-table design:

1. **`ads`** - Main ad information
   - Ad ID (unique), status, dates, page info

2. **`ad_versions`** - All versions/variations of each ad
   - Version number, ad copy, images, videos, links

3. **`ad_platforms`** - Junction table for platforms
   - Links ads to platforms (Facebook, Instagram, etc.)

### Import Data to Database

1. **Make sure PostgreSQL is running:**
   ```powershell
   docker ps  # Check if ads-postgres is running
   ```

2. **Import scraped ads:**
   ```powershell
   cd scraper\src
   venv\Scripts\Activate.ps1
   py database\import_ads.py scraped_ads.json
   ```

   This script will:
   - Create all database tables automatically
   - Import all ads from JSON file
   - Import all versions for each ad
   - Import all platforms
   - Handle duplicates (updates existing ads)

3. **Verify import:**
   ```powershell
   docker exec -it ads-postgres psql -U postgres -d ads_db -c "SELECT COUNT(*) FROM ads;"
   ```

### Managing PostgreSQL Container

- **Stop container:**
  ```powershell
  docker-compose down
  ```

- **Start container:**
  ```powershell
  docker-compose up -d
  ```

- **View logs:**
  ```powershell
  docker logs ads-postgres
  ```

- **Access PostgreSQL CLI:**
  ```powershell
  docker exec -it ads-postgres psql -U postgres -d ads_db
  ```

**Note:** Data persists in a Docker volume. Restarting the container does NOT delete your data. Only `docker-compose down -v` will remove the volume and delete data.

### Viewing Database Data

Recommended tools:
- **DBeaver** (free): https://dbeaver.io/download/
- **pgAdmin** (free): https://www.pgadmin.org/download/
- **PostgreSQL CLI** (built-in): `docker exec -it ads-postgres psql -U postgres -d ads_db`

Connection details:
- Host: `localhost`
- Port: `5432`
- Database: `ads_db`
- User: `postgres`
- Password: `postgres`

---

## Quick Start Summary

### Complete Workflow

1. **Setup:**
   ```powershell
   cd scraper
   py -m venv venv
   venv\Scripts\Activate.ps1
   py -m pip install -r requirements.txt
   playwright install chromium
   ```

2. **Start PostgreSQL:**
   ```powershell
   docker-compose up -d
   ```

3. **Scrape ads:**
   ```powershell
   cd scraper\src
   py scrape_graphql.py
   ```

4. **Import to database:**
   ```powershell
   py database\import_ads.py scraped_ads.json
   ```

---

## Part 2: Dashboard

### Overview

The dashboard consists of:
- **Backend**: Node.js + Express.js + TypeScript API (RESTful)
- **Frontend**: React + TypeScript + Vite dashboard

### Architecture

The backend follows a **decoupled architecture pattern**:
- Repository Pattern for database abstraction
- Service Layer for business logic
- Dependency Injection for flexibility
- Easy to switch database implementations

### Prerequisites

- Node.js 20+
- PostgreSQL (via Docker - already set up in Part 1)
- Backend and Frontend can run locally or via Docker

---

## Backend Setup

### Local Development

1. **Navigate to backend directory:**
   ```powershell
   cd backend
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Create `.env` file:**
   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ads_db
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start PostgreSQL (if not running):**
   ```powershell
   # From project root
   docker-compose up -d postgres
   ```

5. **Run backend in development mode:**
   ```powershell
   npm run dev
   ```

   Backend will be available at: `http://localhost:3000`

6. **Test API:**
   ```powershell
   # Health check
   curl http://localhost:3000/health

   # Get ads
   curl http://localhost:3000/api/ads?page=1&limit=10
   ```

### API Endpoints

- `GET /api/ads` - Get paginated ads (with filters: `status`, `platform`, `startDate`, `endDate`, `pageName`)
- `GET /api/ads/:id` - Get ad by ID
- `GET /api/ads/stats` - Get aggregated statistics
- `GET /api/ads/stats/by-date` - Get ads grouped by date
- `GET /api/ads/stats/platforms` - Get platform statistics
- `GET /health` - Health check

See `backend/README.md` for detailed API documentation.

---

## Frontend Setup

### Local Development

1. **Navigate to frontend directory:**
   ```powershell
   cd frontend
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Create `.env` file (optional):**
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
   
   Default is `http://localhost:3000/api` if not specified.

4. **Make sure backend is running** (see Backend Setup above)

5. **Run frontend development server:**
   ```powershell
   npm run dev
   ```

   Frontend will be available at: `http://localhost:5173`

### Dashboard Features

- **Statistics Cards**: Total, Active, and Inactive ad counts
- **Charts**: 
  - Ads over time (line chart)
  - Platform distribution (bar chart)
- **Filters**: Status, Platform, Date Range, Page Name
- **Ad List**: Paginated list with images
- **Ad Detail**: Full ad information with all versions

See `frontend/README.md` for detailed frontend documentation.

---

## Docker Setup (Full Stack)

Run everything with Docker Compose:

### Start All Services

```powershell
# From project root
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Backend API (port 3000)
- Frontend (port 80)

### Access Services

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000/api
- **PostgreSQL**: localhost:5432

### View Logs

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop Services

```powershell
docker-compose down
```

### Rebuild After Changes

```powershell
docker-compose up -d --build
```

---

## Complete Workflow

### 1. Setup Database

```powershell
# Start PostgreSQL
cd scraper
docker-compose up -d
```

### 2. Scrape Ads

```powershell
cd scraper\src
venv\Scripts\Activate.ps1
py scrape_graphql.py
```

### 3. Import to Database

```powershell
py database\import_ads.py scraped_ads.json
```

### 4. Start Backend

```powershell
# Option A: Local development
cd backend
npm install
npm run dev

# Option B: Docker
docker-compose up -d backend
```

### 5. Start Frontend

```powershell
# Option A: Local development
cd frontend
npm install
npm run dev

# Option B: Docker
docker-compose up -d frontend
```

### 6. View Dashboard

Open browser: `http://localhost:5173` (local) or `http://localhost` (Docker)

---

---

## Troubleshooting

### Database Connection Issues

**Problem**: Backend shows "relation does not exist" errors
- **Solution**: Initialize the database schema first:
  ```powershell
  cd scraper\src
  $env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/ads_db"
  ..\venv\Scripts\python.exe -c "from database.connection import init_db; init_db()"
  ```

**Problem**: Enum mismatch errors (ACTIVE/INACTIVE)
- **Solution**: Ensure Python models use uppercase enum values. The import script handles conversion automatically.

### Docker Issues

**Problem**: Containers won't start
- **Solution**: Check if ports are already in use:
  ```powershell
  # Check port 5432 (PostgreSQL)
  netstat -ano | findstr :5432
  
  # Check port 3000 (Backend)
  netstat -ano | findstr :3000
  
  # Check port 80 (Frontend)
  netstat -ano | findstr :80
  ```

**Problem**: Frontend can't connect to backend
- **Solution**: 
  1. Ensure backend is running: `docker ps` or check `http://localhost:3000/health`
  2. Check `CORS_ORIGIN` in backend `.env` matches frontend URL
  3. For Docker, ensure both services are on the same network

### Import Issues

**Problem**: Unicode encoding errors during import
- **Solution**: Set `PYTHONIOENCODING=utf-8`:
  ```powershell
  $env:PYTHONIOENCODING = "utf-8"
  py database\import_ads.py scraped_ads.json
  ```

**Problem**: Import fails with "enum value does not exist"
- **Solution**: Drop and recreate tables with correct enum:
  ```powershell
  docker exec ads-postgres psql -U postgres -d ads_db -c "DROP TYPE IF EXISTS adstatus CASCADE;"
  # Then re-run init_db() and import
  ```

---

## Environment Variables

Each component requires a `.env` file. See `.env.example` files in each directory:
- `backend/.env.example` - Backend configuration
- `frontend/.env.example` - Frontend configuration  
- `scraper/.env.example` - Scraper/database configuration

**Important**: Copy `.env.example` to `.env` and update values as needed.

---

## Notes

- The scraper captures the first 50 ads by default
- Each ad can have multiple versions (stored in `versions` array)
- All ad assets (images/videos) are stored as URLs (not downloaded)
- Database uses PostgreSQL (via Docker) or SQLite (default if no Docker)
- Enum values must be uppercase (`ACTIVE`, `INACTIVE`) to match database schema