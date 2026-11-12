/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { type Stop, StopIdSchema, StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import { readFile, writeFile } from 'node:fs/promises';

import { type ImportOptions } from '../utils/cli.js';
import { parseStops, toStop } from '../utils/stops.js';

/* * */

const preparationBatchSize = 10;
const idLookupSize = 100;

/* * */

/**
 * Validates and prepares stops for preview, export or import, skipping existing flags and legacy IDs.
 * @param options The validated CLI options
 * @param services The database and location operations, replaceable for offline checks
 * @returns The number of prepared, inserted, exported, previewed and skipped stops
 */
export async function importStopsTask(options: ImportOptions, services: {
	findAgency: (id: string) => Promise<boolean>
	findLocation: typeof locationsProvider.findLocationByGeo
	stops: Pick<typeof goDb.infrastructure.stops, 'findMany' | 'findOne' | 'insertOneUnsafe'>
} = {
	findAgency: async id => Boolean(await goDb.core.agencies.findById(id)),
	findLocation: (lat, lon) => locationsProvider.findLocationByGeo(lat, lon),
	stops: goDb.infrastructure.stops,
}) {
	//

	const timer = new Timer();
	const { agencyIds, exportJson } = options;
	const counts = { exported: 0, inserted: 0, prepared: 0, previewed: 0, skipped: 0 };
	const action = exportJson ? 'Exporting' : options.dryRun ? 'Previewing' : 'Importing';
	let context = 'reading the GTFS file';
	let completed = false;

	Logger.title(`${action} GTFS stops for ${agencyIds.join(', ')}`);
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
		// Verify every supplied agency exists

		Logger.info(`Validated input; checking agencies ${agencyIds.join(', ')}.`);
		for (const agencyId of agencyIds) {
			context = `checking agency ${agencyId}`;
			if (!await services.findAgency(agencyId)) throw new Error('Agency does not exist');
		}

		//
		// Match both identifiers on the same flag, with legacy IDs as a fallback

		const findExisting = (stopId: string) => {
			const legacyIds = [stopId, ...agencyIds.map(agencyId => `${agencyId}:${stopId}`)];
			return services.stops.findOne({
				$or: [
					{ flags: { $elemMatch: { agency_ids: { $in: agencyIds }, stop_id: stopId } } },
					{ legacy_id: { $in: legacyIds } },
					{ legacy_ids: { $in: legacyIds } },
				],
			});
		};

		//
		// Prepare every new stop before performing the first insert

		const prepared: { gtfsId: string, stop: Stop }[] = [];
		let nextId = options.startId;
		let checkedUntil = nextId;
		let occupiedIds = new Set<string>();
		const allocateId = async () => {
			while (true) {
				const id = StopIdSchema.parse(nextId);
				if (nextId === checkedUntil) {
					checkedUntil = Math.min(nextId + idLookupSize, 1_000_000);
					const ids = Array.from({ length: checkedUntil - nextId }, (_, index) => String(nextId + index));
					const occupied = await services.stops.findMany({
						$or: [{ _id: { $in: ids } }, { legacy_id: { $in: ids } }],
					}, { projection: { _id: 1, legacy_id: 1 } });
					occupiedIds = new Set(occupied.flatMap(stop => stop.legacy_id ? [stop._id, stop.legacy_id] : [stop._id]));
				}
				nextId++;
				if (!occupiedIds.has(id)) return id;
			}
		};

		for (let offset = 0; offset < rows.length; offset += preparationBatchSize) {
			const batch = rows.slice(offset, offset + preparationBatchSize);
			Logger.info(`Preparing stops ${offset + 1}–${offset + batch.length} of ${rows.length}.`);
			const matches = await Promise.allSettled(batch.map(row => findExisting(row.stop_id)));
			const newStops: { id: string, progress: string, row: typeof rows[number] }[] = [];

			for (const [index, row] of batch.entries()) {
				const progress = `[${offset + index + 1}/${rows.length}] GTFS ${row.stop_id} (${row.stop_name})`;
				context = `preparing ${progress}`;
				const match = matches[index];
				if (match.status === 'rejected') throw match.reason;
				if (match.value) {
					counts.skipped++;
					Logger.info(`${progress}: skipped; already linked to GO stop ${match.value._id} by agency flag or legacy ID.`);
					continue;
				}

				newStops.push({ id: await allocateId(), progress, row });
			}

			const locations = await Promise.allSettled(newStops.map(({ row }) => services.findLocation(Number(row.stop_lat), Number(row.stop_lon))));
			for (const [index, { id, progress, row }] of newStops.entries()) {
				context = `preparing ${progress}`;
				const location = locations[index];
				if (location.status === 'rejected') throw location.reason;
				const stop = toStop(row, id, location.value, agencyIds);
				prepared.push({ gtfsId: row.stop_id, stop });
				counts.prepared++;
			}
		}

		//
		// Export, preview or insert, rechecking duplicates before each database insert

		Logger.info(`Preparation complete: ${counts.prepared} new stops; ${counts.skipped} existing stops skipped.`);

		if (exportJson) {
			context = `exporting stops to ${exportJson}`;
			const documents = prepared.map(({ stop }) => stop);
			await writeFile(exportJson, `${JSON.stringify(documents, null, 2)}\n`, { flag: 'wx' });
			counts.exported = documents.length;
			Logger.info(`Exported ${counts.exported} stops to ${exportJson}.`);
			completed = true;
			return counts;
		}

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
			attributes: { ...counts, agency_ids: agencyIds, dry_run: options.dryRun, elapsed_ms: timer.getMs() },
			message: `${completed ? 'Completed' : 'Stopped'} in ${timer.get()}: prepared ${counts.prepared}, inserted ${counts.inserted}, exported ${counts.exported}, previewed ${counts.previewed}, skipped ${counts.skipped}.`,
		});
	}
}
