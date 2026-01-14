# Ads Dashboard Frontend

React + TypeScript + Vite frontend dashboard for displaying scraped Facebook Ads Library data.

## Architecture

This frontend follows a structured application pattern:

- **Components**: Reusable UI components (charts, filters, lists, details)
- **Pages**: Route-level page components
- **Services**: API client layer for backend communication
- **Types**: TypeScript types matching backend API
- **Utils**: Utility functions

### Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ads/            # Ad-related components
│   │   ├── charts/         # Chart components (Recharts)
│   │   ├── common/         # Common components (Loading, Error)
│   │   ├── filters/        # Filter components
│   │   └── stats/          # Statistics components
│   ├── pages/              # Page components (routes)
│   ├── services/           # API service layer
│   ├── types/              # TypeScript types
│   ├── config/             # Configuration
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── Dockerfile              # Docker configuration
├── nginx.conf              # Nginx configuration
└── package.json
```

## Features

- ✅ React + TypeScript
- ✅ Vite (fast build tool)
- ✅ React Router (client-side routing)
- ✅ Recharts (charts and visualizations)
- ✅ Axios (HTTP client)
- ✅ Responsive design
- ✅ Dockerized

## Dashboard Features

- **Statistics Cards**: Total, Active, and Inactive ad counts
- **Charts**: 
  - Ads over time (line chart)
  - Platform distribution (bar chart)
- **Filters**: Status, Platform, Date Range
- **Ad List**: Paginated list with images
- **Ad Detail**: Full ad information with all versions

## Setup

### Prerequisites

- Node.js 20+
- Backend API running (port 3000)

### Local Development

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Create `.env` file (optional):**
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
   
   Default is `http://localhost:3000/api` if not specified.

3. **Run development server:**
   ```bash
   npm run dev
   ```

   Frontend will be available at: `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```

   Build output will be in `dist/` directory.

### Docker

**Build and run:**
```bash
# From project root
docker-compose up -d frontend
```

**View logs:**
```bash
docker logs -f ads-frontend
```

**Access:**
- Frontend: http://localhost (port 80)
- Backend API: http://localhost:3000/api

## API Integration

The frontend connects to the backend API at:
- Development: `http://localhost:3000/api` (default)
- Production: Configured via `VITE_API_URL` environment variable

### Endpoints Used

- `GET /api/ads` - Get paginated ads (with filters)
- `GET /api/ads/:id` - Get ad by ID
- `GET /api/ads/stats` - Get aggregated statistics
- `GET /api/ads/stats/by-date` - Get ads grouped by date
- `GET /api/ads/stats/platforms` - Get platform statistics

## Development

- **Type checking:** `npm run build` (uses TypeScript compiler)
- **Linting:** `npm run lint`
- **Dev server:** `npm run dev` (Vite dev server with HMR)

## Notes

- The frontend uses React Router for client-side routing
- Charts are built with Recharts library
- All API calls go through the centralized `api.ts` service
- The frontend expects the backend to be running on port 3000 (configurable)
