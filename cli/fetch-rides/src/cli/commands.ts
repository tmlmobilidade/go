export interface CliOptions {
	endDate?: string
	help?: boolean
	includeVehicleEvents?: boolean
	output?: string
	startDate?: string
	tripId?: string
	verbose?: boolean
}

export function parseArgs(args: string[]): CliOptions {
	const options: CliOptions = {};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		switch (arg) {
			case '--end-date':
				if (i + 1 < args.length) {
					options.endDate = args[++i];
				}
				else {
					throw new Error('--end-date requires a value\nRun \'fetch-rides --help\' for more information.');
				}
				break;
			case '--help':
			case '-h':
				options.help = true;
				break;
			case '--include-vehicle-events':
				options.includeVehicleEvents = true;
				break;
			case '--output':
				if (i + 1 < args.length) {
					options.output = args[++i];
				}
				else {
					throw new Error('--output requires a value\nRun \'fetch-rides --help\' for more information.');
				}
				break;
			case '--start-date':
				if (i + 1 < args.length) {
					options.startDate = args[++i];
				}
				else {
					throw new Error('--start-date requires a value\nRun \'fetch-rides --help\' for more information.');
				}
				break;
			case '--trip-id':
				if (i + 1 < args.length) {
					options.tripId = args[++i];
				}
				else {
					throw new Error('--trip-id requires a value\nRun \'fetch-rides --help\' for more information.');
				}
				break;
			case '--verbose':
			case '-v':
				options.verbose = true;
				break;
			default:
				if (arg.startsWith('-')) {
					throw new Error(`Unknown option: ${arg}\nRun 'fetch-rides --help' for more information.`);
				}
				break;
		}
	}

	return options;
}

export function showHelp(): void {
	console.log(`
Fetch Rides CLI - Export rides data from MongoDB

SYNOPSIS
    fetch-rides [OPTIONS]

DESCRIPTION
    Fetches rides from MongoDB with their associated hashed_trips, hashed_shapes,
    and optionally vehicle-events. Exports the data to a zip file containing JSON files.

OPTIONS
    --start-date <date>        Start date for filtering rides (required)
                               Format: yyyyMMdd (e.g., 20240101) or YYYY-MM-DD (e.g., 2024-01-01)
    
    --end-date <date>          End date for filtering rides (required)
                               Format: yyyyMMdd (e.g., 20240131) or YYYY-MM-DD (e.g., 2024-01-31)
    
    --trip-id <id>             Optional: Filter rides by specific trip_id
    
    --include-vehicle-events   Optional: Include vehicle-events in the export
    
    --output <path>            Optional: Output directory for the zip file (default: ./exports)
    
    -v, --verbose              Enable verbose output (show detailed execution logs)
    
    -h, --help                 Show this help message and exit

EXAMPLES
    # Fetch all rides between dates
    fetch-rides --start-date 20240101 --end-date 20240131

    # Fetch rides for specific trip
    fetch-rides --start-date 20240101 --end-date 20240131 --trip-id "trip_123"

    # Include vehicle events
    fetch-rides --start-date 20240101 --end-date 20240131 --include-vehicle-events

    # Custom output directory
    fetch-rides --start-date 20240101 --end-date 20240131 --output ./my-exports

CONFIGURATION
    The script reads configuration from .env file in the script directory.
    Required variables:
    - DATABASE_URI (preferred) - MongoDB connection string
    OR
    - MONGO_HOST (or HOST) - MongoDB host
    - MONGO_DB (or DATABASE or DB) - Database name
    - MONGO_USERNAME (or USERNAME) - Optional: MongoDB username
    - MONGO_PASSWORD (or PASSWORD) - Optional: MongoDB password
    - MONGO_AUTH_DATABASE (or AUTH_DATABASE) - Optional: Auth database (default: admin)

OUTPUT
    Creates a zip file named: rides-export-<timestamp>.zip
    Contains the following JSON files:
    - rides.json - Array of all fetched rides
    - hashed_trips.json - Array of all associated hashed trips (deduplicated)
    - hashed_shapes.json - Array of all associated hashed shapes (deduplicated)
    - vehicle-events.json - Array of all vehicle events (only if --include-vehicle-events is set)
`);
}
