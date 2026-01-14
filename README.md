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

## Part 2: Dashboard (Coming Soon)

- Backend: Node.js API
- Frontend: React dashboard
- Features: Visualizations, filters, ad display

---

## Notes

- The scraper captures the first 50 ads by default
- Each ad can have multiple versions (stored in `versions` array)
- All ad assets (images/videos) are stored as URLs (not downloaded)
- Database uses PostgreSQL (via Docker) or SQLite (default if no Docker)
