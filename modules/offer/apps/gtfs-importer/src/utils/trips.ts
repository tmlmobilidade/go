/* * */

import { parseCsv, readGtfsFile } from '@/helpers/index.js';
import { type GtfsStrictV29Trips, GtfsStrictV29TripsSchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { type PatternDirection, patternDirectionMapper } from '@tmlmobilidade/go-types-offer';
import fs from 'fs/promises';
import path from 'path';

/* * */

export async function loadGtfsTrips(gtfsPath: string) {
	const content = await readGtfsFile(gtfsPath, 'trips.txt');
	const rawTrips = parseCsv<GtfsStrictV29Trips>(content);
	const trips: GtfsStrictV29Trips[] = [];
	const skippedTrips: Array<{ error: string, raw: GtfsStrictV29Trips }> = [];

	for (const raw of rawTrips) {
		try {
			trips.push(GtfsStrictV29TripsSchema.parse(raw));
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

export function buildTripsByRouteAndDirection(gtfsTrips: GtfsStrictV29Trips[]) {
	const tripsByRouteAndDirection = new Map<string, { directionId: PatternDirection, headsign?: string }>();
	const tripsByRoute = new Map<string, GtfsStrictV29Trips[]>();
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
