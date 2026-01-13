# Database Setup and Usage

## Database Schema

The database uses a normalized 3-table design:

### Tables

1. **`ads`** - Main ad information
   - `id` (UUID, Primary Key)
   - `ad_id` (String, unique) - Facebook Library ID
   - `status` (Enum: active/inactive)
   - `start_date`, `end_date` (Date)
   - `page_name`, `page_profile_uri`
   - `created_at`, `updated_at`

2. **`ad_versions`** - Ad versions/variations
   - `id` (UUID, Primary Key)
   - `ad_id` (Foreign Key → ads.id)
   - `version_number` (Integer)
   - `ad_copy`, `title`, `image_url`, `video_url`
   - `asset_type` (Enum: image/video)
   - `link_url`, `link_description`
   - `cta_text`, `cta_type`, `caption`

3. **`ad_platforms`** - Junction table for platforms
   - `id` (UUID, Primary Key)
   - `ad_id` (Foreign Key → ads.id)
   - `platform` (String: Facebook, Instagram, etc.)

## Setup

### 1. Install Dependencies

```powershell
cd scraper
..\venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
```

### 2. Configure Database

Create a `.env` file in the `scraper/` directory:

**For SQLite (default, no setup needed):**
```
DATABASE_URL=sqlite:///./ads_scraper.db
```

**For PostgreSQL (using Docker - recommended):**
```powershell
# Start PostgreSQL container
cd scraper
docker-compose up -d
```

Then create `.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ads_db
```

See `DOCKER_SETUP.md` for detailed Docker instructions.

### 3. Initialize Database

The import script will automatically create tables, or you can initialize manually:

```powershell
cd scraper\src
py -c "from database.connection import init_db; init_db(); print('Database initialized!')"
```

## Usage

### Import Ads from JSON

```powershell
cd scraper\src
py database/import_ads.py scraped_ads.json
```

This will:
- Create tables if they don't exist
- Import all ads from the JSON file
- Handle duplicates (updates existing ads)
- Import all versions and platforms

### Query Database

Example Python code:

```python
from database.connection import SessionLocal
from database.models import Ad, AdVersion, AdPlatform

db = SessionLocal()

# Get all active ads
active_ads = db.query(Ad).filter(Ad.status == AdStatus.ACTIVE).all()

# Get ad with all versions
ad = db.query(Ad).filter(Ad.ad_id == "25927973150133037").first()
versions = ad.versions  # List of AdVersion objects
platforms = ad.platforms  # List of AdPlatform objects

db.close()
```

## Database Files

- `models.py` - SQLAlchemy model definitions
- `connection.py` - Database connection setup
- `import_ads.py` - Import script for JSON data
- `migrations/` - Alembic migration files
