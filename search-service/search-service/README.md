# Search Service

Spring Boot 3 search service for Dollars and Life.

## Building

```bash
./mvnw clean package
```

On Windows:
```cmd
mvnw.cmd clean package
```

## Running Locally

1. Set environment variables:
```bash
export MONGODB_URI="mongodb://localhost:27017"
export MONGODB_DB="dollarsandlife_data"
```

On Windows:
```cmd
set MONGODB_URI=mongodb://localhost:27017
set MONGODB_DB=dollarsandlife_data
```

2. Run the application:
```bash
./mvnw spring-boot:run
```

On Windows:
```cmd
mvnw.cmd spring-boot:run
```

## Configuration

Set the following environment variables:
- `MONGODB_URI` - MongoDB connection string (required)
- `MONGODB_DB` - MongoDB database name (defaults to `dollarsandlife_data`)

## API Endpoints

### Health Check
```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "ok"
}
```

### Search
```bash
curl "http://localhost:8080/search?q=budget&limit=10"
```

Response:
```json
[
  {
    "id": "budget-tips-2025",
    "headline": "10 Budget Tips to Save Money in 2025",
    "url": "/extra-income/budget/budget-tips-2025",
    "category": "budget-data",
    "snippet": "Discover practical budgeting strategies..."
  }
]
```

**Query Parameters:**
- `q` (required): Search term, min 2 characters, max 60 characters
- `limit` (optional): Maximum results, default 10, max 20
