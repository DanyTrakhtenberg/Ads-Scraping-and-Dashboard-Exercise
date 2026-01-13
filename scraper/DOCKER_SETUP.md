# PostgreSQL Docker Setup Guide

## Quick Start

### 1. Start PostgreSQL Container

**Option A: Using Docker Compose (Recommended)**
```powershell
cd scraper
docker-compose up -d
```

**Option B: Using Docker Run**
```powershell
docker run --name ads-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ads_db -p 5432:5432 -d postgres:15
```

### 2. Verify Container is Running
```powershell
docker ps
```
You should see `ads-postgres` container running.

### 3. Create `.env` File

Create `scraper/.env` file with:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ads_db
```

### 4. Install Database Dependencies
```powershell
cd scraper
..\venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
```

### 5. Test Connection
```powershell
cd scraper\src
py -c "from database.connection import engine; print('Connection successful!' if engine else 'Failed')"
```

### 6. Import Data
```powershell
cd scraper\src
py database\import_ads.py scraped_ads.json
```

## Managing the Container

### Stop Container
```powershell
docker-compose down
# or
docker stop ads-postgres
```

### Start Container
```powershell
docker-compose up -d
# or
docker start ads-postgres
```

### Remove Container (keeps data in volume)
```powershell
docker-compose down
```

### Remove Container and Data
```powershell
docker-compose down -v
```

### View Logs
```powershell
docker logs ads-postgres
```

### Access PostgreSQL CLI
```powershell
docker exec -it ads-postgres psql -U postgres -d ads_db
```

## Connection Details

- **Host**: localhost
- **Port**: 5432
- **Database**: ads_db
- **User**: postgres
- **Password**: postgres
- **Connection String**: `postgresql://postgres:postgres@localhost:5432/ads_db`

## Troubleshooting

### Port Already in Use
If port 5432 is already in use, change it in `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Use 5433 instead
```
Then update `.env`: `DATABASE_URL=postgresql://postgres:postgres@localhost:5433/ads_db`

### Container Won't Start
```powershell
docker logs ads-postgres
```

### Reset Database
```powershell
docker-compose down -v
docker-compose up -d
```
