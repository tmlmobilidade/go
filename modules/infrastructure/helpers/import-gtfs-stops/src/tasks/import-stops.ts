/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { type Stop, StopIdSchema, StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import { readFile } from 'node:fs/promises';

import { type ImportOptions } from '../utils/cli.js';
import { parseStops, toStop } from '../utils/stops.js';

/* * */

/**
 * Validates, prepares and imports stops, skipping existing agency flags.
 * @param options The validated CLI options
 * @param services The database and location operations, replaceable for offline checks
 * @returns The number of prepared, inserted, previewed and skipped stops
 */
export async function importStopsTask(options: ImportOptions, services: {
	findAgency: (id: string) => Promise<boolean>
	findLocation: typeof locationsProvider.findLocationByGeo
	stops: Pick<typeof goDb.infrastructure.stops, 'exists' | 'findOne' | 'insertOneUnsafe'>
} = {
	findAgency: async id => Boolean(await goDb.core.agencies.findById(id)),
	findLocation: (lat, lon) => locationsProvider.findLocationByGeo(lat, lon),
	stops: goDb.infrastructure.stops,
}) {
	//

	const timer = new Timer();
	const counts = { inserted: 0, prepared: 0, previewed: 0, skipped: 0 };
	let context = 'reading the GTFS file';
	let completed = false;

	Logger.title(`${options.dryRun ? 'Previewing' : 'Importing'} GTFS stops for agency ${options.agencyId}`);
	Logger.info(`Reading ${options.file}; starting GO ID: ${options.startId}`);

	try {
		//
		// Read and validate boarding stops before opening database connections

		const rows = parseStops(await readFile(options.file, 'utf8'));
		Logger.info(`Parsed ${rows.length} boarding stops; other location types are excluded.`);

		for (const row of rows) {
			context = `validating GTFS stop ${row.stop_id} (${row.stop_name})`;
			StopSchema.shape.name.parse(row.stop_name);
			StopSchema.shape.latitude.parse(Number(row.stop_lat));
			StopSchema.shape.longitude.parse(Number(row.stop_lon));
		}

		//
		// Verify the agency exists

		context = `checking agency ${options.agencyId}`;
		Logger.info(`Validated input; checking agency ${options.agencyId}.`);
		if (!await services.findAgency(options.agencyId)) throw new Error('Agency does not exist');

		//
		// Match both identifiers on the same flag, with legacy IDs as a fallback

		const findExisting = (stopId: string) => services.stops.findOne({
			$or: [
				{ flags: { $elemMatch: { agency_ids: options.agencyId, stop_id: stopId } } },
				{ legacy_id: `${options.agencyId}:${stopId}` },
				{ legacy_ids: `${options.agencyId}:${stopId}` },
			],
		});

		//
		// Prepare every new stop before performing the first insert

		const prepared: { gtfsId: string, stop: Stop }[] = [];
		let nextId = options.startId;

		for (const [index, row] of rows.entries()) {
			const progress = `[${index + 1}/${rows.length}] GTFS ${row.stop_id} (${row.stop_name})`;
			context = `preparing ${progress}`;
			Logger.info(`${progress}: checking existing flags.`);

			const existing = await findExisting(row.stop_id);
			if (existing) {
				counts.skipped++;
				Logger.info(`${progress}: skipped; already linked to GO stop ${existing._id} by agency flag or legacy ID.`);
				continue;
			}

			let id = StopIdSchema.parse(nextId);
			while (await services.stops.exists('_id', id) || await services.stops.exists('legacy_id', id)) {
				id = StopIdSchema.parse(++nextId);
			}

			Logger.info(`${progress}: resolving administrative location for GO stop ${id}.`);
			const location = await services.findLocation(Number(row.stop_lat), Number(row.stop_lon));
			const stop = toStop(row, id, location, options.agencyId);
			prepared.push({ gtfsId: row.stop_id, stop });
			counts.prepared++;
			nextId++;
			Logger.info(`${progress}: prepared GO stop ${id}; elapsed ${timer.get()}.`);
		}

		//
		// Preview or insert, rechecking duplicates before each write

		Logger.info(`Preparation complete: ${counts.prepared} new stops; ${counts.skipped} existing stops skipped.`);

		for (const [index, { gtfsId, stop }] of prepared.entries()) {
			const progress = `[${index + 1}/${prepared.length}] GO ${stop._id} (${stop.name}), GTFS ${gtfsId}`;
			context = `${options.dryRun ? 'previewing' : 'inserting'} ${progress}`;
			if (options.dryRun) {
				counts.previewed++;
				Logger.info(`${progress}: would insert.`);
				continue;
			}

			const existing = await findExisting(gtfsId);
			if (existing) {
				counts.skipped++;
				Logger.info(`${progress}: skipped; now linked to existing GO stop ${existing._id}.`);
				continue;
			}

			await services.stops.insertOneUnsafe(stop);
			counts.inserted++;
			Logger.info(`${progress}: inserted; elapsed ${timer.get()}.`);
		}

		completed = true;
		return counts;
	} catch (error) {
		throw new Error(`Failed while ${context}: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
	} finally {
		Logger.info({
			attributes: { ...counts, agency_id: options.agencyId, dry_run: options.dryRun, elapsed_ms: timer.getMs() },
			message: `${completed ? 'Completed' : 'Stopped'} in ${timer.get()}: prepared ${counts.prepared}, inserted ${counts.inserted}, previewed ${counts.previewed}, skipped ${counts.skipped}.`,
		});
	}
}
