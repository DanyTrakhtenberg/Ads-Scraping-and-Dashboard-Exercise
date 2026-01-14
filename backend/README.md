# Ads Dashboard Backend

Node.js + Express.js + TypeScript backend API with decoupled architecture.

## Architecture

This backend follows a **decoupled architecture pattern** that allows easy switching of database implementations:

- **Repository Pattern**: Database access is abstracted through interfaces
- **Service Layer**: Business logic is separated from data access
- **Dependency Injection**: Centralized container manages dependencies
- **Interfaces**: Database implementations can be swapped without changing business logic

### Structure

```
backend/
├── src/
│   ├── config/              # Configuration (database, app)
│   ├── controllers/         # HTTP request handlers
│   ├── services/            # Business logic layer
│   ├── repositories/        # Data access layer
│   │   ├── interfaces/      # Repository interfaces (abstractions)
│   │   └── implementations/ # Concrete implementations (PostgreSQL, etc.)
│   ├── routes/              # API route definitions
│   ├── middleware/          # Express middleware
│   ├── types/               # TypeScript types
│   ├── container.ts         # Dependency injection container
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── Dockerfile
└── package.json
```

## Features

- ✅ TypeScript
- ✅ Decoupled architecture (Repository Pattern)
- ✅ Dependency Injection
- ✅ Database abstraction (easy to switch databases)
- ✅ RESTful API
- ✅ Error handling
- ✅ CORS support
- ✅ Dockerized

## API Endpoints

### Ads

- `GET /api/ads` - Get paginated ads (with filters)
  - Query params: `page`, `limit`, `status`, `platform`, `startDate`, `endDate`, `pageName`
- `GET /api/ads/:id` - Get ad by ID
- `GET /api/ads/stats` - Get aggregated statistics
- `GET /api/ads/stats/by-date` - Get ads grouped by date
- `GET /api/ads/stats/platforms` - Get platform statistics

### Health

- `GET /health` - Health check

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL (via Docker)

### Local Development

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file:**
   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ads_db
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Start PostgreSQL (if not running):**
   ```bash
   # From project root
   docker-compose up -d postgres
   ```

4. **Run in development mode:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

### Docker

**Build and run:**
```bash
# From project root
docker-compose up -d backend
```

**View logs:**
```bash
docker logs -f ads-backend
```

## Database Switching

The architecture allows easy switching of database implementations:

1. **Create new database connection:**
   - Implement `IDatabaseConnection` interface in `src/repositories/implementations/`
   - Example: `MongoDBConnection.ts`, `MySQLConnection.ts`

2. **Create new repository:**
   - Implement `IAdRepository` interface using your database connection
   - Example: `MongoDBAdRepository.ts`, `MySQLAdRepository.ts`

3. **Update container:**
   - Modify `src/container.ts` to use your new implementations
   - No changes needed in services or controllers!

Example:
```typescript
// In container.ts
getDatabaseConnection(): IDatabaseConnection {
  if (!this.dbConnection) {
    // Switch here:
    this.dbConnection = new MongoDBConnection(); // or MySQLConnection()
  }
  return this.dbConnection;
}
```

## Development

- **Type checking:** `npm run build` (uses TypeScript compiler)
- **Linting:** `npm run lint`

## Notes

- The backend uses the same PostgreSQL database as the scraper
- Ensure PostgreSQL is running and contains scraped ad data
- CORS is configured for frontend development (default: `http://localhost:5173`)
