/* * */

import { parseCsv, readGtfsFile } from '@/helpers/index.js';
import { GtfsTMLTrip, GtfsTMLTripSchema, PatternDirection, patternDirectionMapper } from '@tmlmobilidade/types';
import fs from 'fs/promises';
import path from 'path';

/* * */

export async function loadGtfsTrips(gtfsPath: string) {
	const content = await readGtfsFile(gtfsPath, 'trips.txt');
	const rawTrips = parseCsv<GtfsTMLTrip>(content);
	const trips: GtfsTMLTrip[] = [];
	const skippedTrips: Array<{ error: string, raw: GtfsTMLTrip }> = [];

	for (const raw of rawTrips) {
		try {
			trips.push(GtfsTMLTripSchema.parse(raw));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.warn('[gtfs-importer] Skipping trip due to validation error', {
				error: message,
				raw,
			});
			skippedTrips.push({ error: message, raw });
		}
	}

	if (skippedTrips.length) {
		const outputFile = path.join(gtfsPath, 'trips.skipped.jsonl');
		const lines = skippedTrips.map(entry => JSON.stringify(entry)).join('\n');
		await fs.writeFile(outputFile, `${lines}\n`, 'utf8');
		console.warn('[gtfs-importer] Wrote skipped trips file', {
			count: skippedTrips.length,
			file: outputFile,
		});
	}

	return trips;
}

export function buildTripsByRouteAndDirection(gtfsTrips: GtfsTMLTrip[]) {
	const tripsByRouteAndDirection = new Map<string, { directionId: PatternDirection, headsign?: string }>();
	const tripsByRoute = new Map<string, GtfsTMLTrip[]>();
	for (const trip of gtfsTrips) {
		const directionId = patternDirectionMapper.fromGtfs(trip.direction_id ?? '0') as PatternDirection;
		const key = `${trip.route_id}:${directionId}`;
		if (!tripsByRouteAndDirection.has(key)) {
			tripsByRouteAndDirection.set(key, { directionId, headsign: trip.trip_headsign });
		}
		if (!tripsByRoute.has(trip.route_id)) tripsByRoute.set(trip.route_id, []);
		tripsByRoute.get(trip.route_id)?.push(trip);
	}
	return { tripsByRoute, tripsByRouteAndDirection };
}
