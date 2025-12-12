# Fetch Rides CLI

CLI tool to fetch rides from MongoDB with their associated hashed_trips, hashed_shapes, and optionally vehicle-events. Exports the data to a zip file containing JSON files.

## Installation

```bash
npm install
npm run build
```

## Usage

### Basic Usage

```bash
# Fetch all rides between dates
npm run dev -- --start-date 20240101 --end-date 20240131

# Run with arguments (use -- to pass arguments to the script)
npm run dev -- --help
npm run dev -- --start-date 20240101 --end-date 20240131 --trip-id "trip_123"

# Or after building:
./dist/index.js --start-date 20240101 --end-date 20240131
./dist/index.js --help
```

### Command Line Options

```bash
# Fetch all rides between dates
fetch-rides --start-date 20240101 --end-date 20240131

# Fetch rides for specific trip
fetch-rides --start-date 20240101 --end-date 20240131 --trip-id "trip_123"

# Include vehicle events
fetch-rides --start-date 20240101 --end-date 20240131 --include-vehicle-events

# Custom output directory
fetch-rides --start-date 20240101 --end-date 20240131 --output ./my-exports

# Enable verbose logging
fetch-rides --start-date 20240101 --end-date 20240131 --verbose

# Show help
fetch-rides --help
```

## Configuration

Create a `.env` file in the `cli/fetch-rides/` directory with the following variables:

### MongoDB Configuration

**Option 1: Connection String (Preferred)**

```env
DATABASE_URI=mongodb://username:password@host:27017/database_name?authSource=admin
```

**Option 2: Individual Parameters**

```env
# MongoDB Connection
MONGO_HOST=host:27017
MONGO_DB=database_name
MONGO_USERNAME=username
MONGO_PASSWORD=password
MONGO_AUTH_DATABASE=admin
```

**Alternative environment variable names are also supported:**
- `HOST` instead of `MONGO_HOST`
- `DATABASE` or `DB` instead of `MONGO_DB`
- `USERNAME` instead of `MONGO_USERNAME`
- `PASSWORD` instead of `MONGO_PASSWORD`
- `AUTH_DATABASE` instead of `MONGO_AUTH_DATABASE`

## Date Format

Dates can be provided in two formats:
- **Operational date format**: `yyyyMMdd` (e.g., `20240101`)
- **ISO format**: `YYYY-MM-DD` (e.g., `2024-01-01`)

The tool will automatically convert dates to Unix timestamps for MongoDB queries. Rides are filtered by `start_time_scheduled >= startDate` and `end_time_scheduled <= endDate`.

## Output

The tool creates a zip file named `rides-export-<timestamp>.zip` in the output directory (default: `./exports`).

The zip file contains the following JSON files:
- `rides.json` - Array of all fetched rides
- `hashed_trips.json` - Array of all associated hashed trips (deduplicated)
- `hashed_shapes.json` - Array of all associated hashed shapes (deduplicated)
- `vehicle-events.json` - Array of all vehicle events (only if `--include-vehicle-events` is set)

## Data Fetching Logic

1. **Rides**: Queried by date range (`start_time_scheduled` and `end_time_scheduled`) and optionally filtered by `trip_id`
2. **Hashed Trips**: Fetched for all unique `hashed_trip_id` values found in the rides
3. **Hashed Shapes**: Fetched for all unique `hashed_shape_id` values found in the rides
4. **Vehicle Events** (optional): Fetched for each ride using:
   - `trip_id` matching the ride's `trip_id`
   - `created_at` within the standard window interval (calculated from ride's `start_time_scheduled`)
   - `extra_trip_id` is null

## Development

```bash
# Run in development mode
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## Requirements

- Node.js (v18+)
- MongoDB connection (local or remote)

## Examples

```bash
# Fetch all rides in January 2024
fetch-rides --start-date 20240101 --end-date 20240131

# Fetch rides for a specific trip with vehicle events
fetch-rides --start-date 20240101 --end-date 20240131 --trip-id "trip_123" --include-vehicle-events

# Use ISO date format
fetch-rides --start-date 2024-01-01 --end-date 2024-01-31

# Custom output location
fetch-rides --start-date 20240101 --end-date 20240131 --output /path/to/exports
```

## Notes

- The script maintains compatibility with the existing `.env` file format
- Exports are stored in `exports/` directory by default (configurable with `--output`)
- Hashed trips and hashed shapes are automatically deduplicated
- Vehicle events are deduplicated by `_id` when fetched
- If no rides are found, the tool exits without creating a zip file

