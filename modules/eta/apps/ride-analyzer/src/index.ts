/* * */

import type { CliArgs } from '@/types.js';

import { buildLoaderConfig } from '@/build-config.js';
import { fetchRouteNodes, fetchStopWaypoints, fetchTripHashes } from '@/fetch-context.js';
import { fetchEventsForTrip } from '@/fetch-events.js';
import { parseTripRef } from '@/parse-trip-ref.js';
import { replayEvents } from '@/replay-events.js';
import { runLoaderPhase } from '@/run-loader.js';
import { writeOutput } from '@/write-output.js';
import { GOClickHouseClient } from '@tmlmobilidade/databases';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';
import { Timer } from '@tmlmobilidade/timer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

/* * */

const USAGE = `Usage: ride-analyzer --line-ids <ids> --time-start <ms> --trip-id <id> [options]

Required:
  --line-ids <ids>       Comma-separated mongo ride line ids (e.g. "1215" or "1215,1216")
  --time-start <ms>      Unix timestamp in milliseconds (analyzer uses [start, start + 1h])
  --trip-id <id>         Ride id or trip id (ride: 6R5PX-44-20260525-4701_0_1|2500|1930)

Options:
  --output-dir <path>    Output directory (default: modules/eta/output/ride-analyzer/<trip>-<timestamp>)
  --skip-loader          Skip the loader phase (assumes the ETA database is already seeded)
`;

/**
 * Parses command-line arguments for the ride-analyzer tool.
 *
 * Expects the following required arguments:
 *   --line-ids <ids>    Comma-separated MongoDB ride line ids (e.g. "1215" or "1215,1216")
 *   --time-start <ms>   Unix timestamp in milliseconds (analyzer uses [start, start + 1h])
 *   --trip-id <id>      Ride id or bare trip id whose vehicle events should be replayed
 *
 * Optional arguments:
 *   --output-dir <path> Output directory (default: derived from trip id and timestamp)
 *   --skip-loader       If present, the loader phase is skipped
 *
 * Returns:
 *   CliArgs object with parsed and validated values.
 *
 * Throws:
 *   Error if required arguments are missing or invalid.
 */
function parseCliArgs(): CliArgs {
	//

	//
	// A.Parse the command-line arguments
	const { values } = parseArgs({
		args: process.argv.slice(2),
		options: {
			'line-ids': { type: 'string' },
			'output-dir': { type: 'string' },
			'skip-loader': { default: false, type: 'boolean' },
			'time-start': { type: 'string' },
			'trip-id': { type: 'string' },
		},
		strict: true,
	});

	//
	// B. Validate the required arguments
	if (!values['line-ids'] || !values['time-start'] || !values['trip-id']) {
		console.error(USAGE);
		throw new Error('Missing required arguments');
	}

	//
	// C. Parse the line ids

	const lineIds = values['line-ids']
		.split(',')
		.map(part => Number.parseInt(part.trim(), 10))
		.filter(value => Number.isFinite(value));
	if (lineIds.length === 0) throw new Error('--line-ids must contain at least one numeric id');

	const timeStartMs = Number.parseInt(values['time-start'], 10);
	if (!Number.isFinite(timeStartMs)) throw new Error('--time-start must be a millisecond unix timestamp');

	//
	// D. Parse the trip id

	const tripIdInput = values['trip-id'];
	const tripRef = parseTripRef(tripIdInput, timeStartMs);

	const sanitizedLabel = tripRef.rideId ?? tripRef.tripId;
	const sanitizedTripId = sanitizedLabel.replace(/[^a-zA-Z0-9_-]+/g, '_');

	//
	// E. Parse the output directory (under modules/eta/output, not cwd)

	const etaModuleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
	const defaultOutputDir = path.join(etaModuleRoot, '.output', 'ride-analyzer', `${sanitizedTripId}-${Date.now()}`);

	//
	// F. Return the parsed arguments

	return {
		lineIds,
		outputDir: values['output-dir'] ?? defaultOutputDir,
		skipLoader: values['skip-loader'] ?? false,
		timeStartMs,
		tripIdInput,
		tripRef,
	};
}

/* * */

async function main() {
	//

	//
	// A. Initialize Sentry

	try {
		await initSentryNode();
		Logger.logsNode({ app: 'ride-analyzer', message: 'Sentry ETA Ride Analyzer initialized', module: 'eta', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry ETA Ride Analyzer', error);
	}

	//
	// B. Initialize the logger

	Logger.init();
	const totalTimer = new Timer();
	const startedAt = new Date().toISOString();

	//
	// C. Parse the command-line arguments

	const args = parseCliArgs();
	Logger.info(`ride-analyzer args: ${JSON.stringify(args)}`);

	//
	// D. Build the loader config

	const config = buildLoaderConfig(args);
	const clickhouseClient = await GOClickHouseClient.getClient();

	//
	// E. Run the loader phase

	if (args.skipLoader) {
		Logger.info('Skipping loader phase (--skip-loader)');
	} else {
		await runLoaderPhase(clickhouseClient, config);
	}

	//
	// F. Fetch the events for the trip

	const events = await fetchEventsForTrip(clickhouseClient, args.tripRef);
	if (events.length === 0) {
		Logger.error(
			`No simplified vehicle events found for trip_id=${args.tripRef.tripId} `
			+ `operational_date=${args.tripRef.operationalDate}; nothing to replay.`,
		);
		process.exit(1);
	}

	const snapshots = await replayEvents(clickhouseClient, args.tripRef, events);

	//
	// G. Fetch the geometry context for the viewer (route polyline + stops)

	const tripContext = await fetchTripHashes(clickhouseClient, args.tripRef.tripId);
	const [route, stops] = await Promise.all([
		fetchRouteNodes(clickhouseClient, tripContext.hashedShapeId),
		fetchStopWaypoints(clickhouseClient, tripContext.hashedTripId),
	]);

	//
	// H. Write the output

	await writeOutput({
		metadata: {
			args,
			completedAt: new Date().toISOString(),
			eventCount: events.length,
			snapshotCount: snapshots.length,
			startedAt,
			tripContext,
		},
		route,
		snapshots,
		stops,
	});

	//
	// I. Log the completion

	Logger.success(`ride-analyzer completed in ${totalTimer.get()} seconds`);
}

/* * */

await main();
