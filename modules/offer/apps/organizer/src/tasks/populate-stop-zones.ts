/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PathSchema, type Pattern } from '@tmlmobilidade/go-types-offer';
import { CommentSchema } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { findStopZones, populateEmptyPathZones } from '@tmlmobilidade/go-utils-offer';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

/* * */

const BATCH_SIZE = 100;

/**
 * Populates missing zone assignments in unlocked Pattern stop sequences.
 * Preserves existing assignments and records each update in the Pattern's history.
 */
export async function populateStopZonesTask() {
	//

	const timer = new Timer();

	//
	// Fetch zones with geometry and the unlocked Lines belonging to their agencies

	const zones = await goDb.offer.zones.findMany({ geojson: { $ne: null } }, { projection: { _id: 1, agency_ids: 1, geojson: 1 } });

	if (!zones.length) return;

	const agencyIds = [...new Set(zones.flatMap(zone => zone.agency_ids))];
	const lines = await goDb.offer.lines.findMany({ agency_id: { $in: agencyIds }, is_locked: false }, { projection: { _id: 1, agency_id: 1 } });

	if (!lines.length) return;

	//
	// Stream only the fields needed to resolve zones and guard against concurrent Pattern edits

	const linesById = new Map(lines.map(line => [line._id, line]));

	const collection = await goDb.offer.patterns.getCollection();

	const cursor = collection.find(
		{
			is_locked: false,
			line_id: { $in: [...linesById.keys()] },
			path: { $elemMatch: { $or: [{ zones: { $exists: false } }, { zones: { $size: 0 } }] } },
		},
		{
			projection: { _id: 1, line_id: 1, path: 1, route_id: 1, updated_at: 1 },
			sort: { _id: 1 },
		}).batchSize(BATCH_SIZE);

	const patternsStream: AsyncIterable<Pick<Pattern, '_id' | 'line_id' | 'path' | 'route_id' | 'updated_at'>> = cursor.stream();

	let updatedCount = 0;

	try {
		for await (const pattern of patternsStream) {
			try {
				//

				//
				// Restrict zone lookup to the Pattern's agency and fetch only stops needing defaults

				const line = linesById.get(pattern.line_id);

				if (!line) continue;

				const agencyZones = zones.filter(zone => zone.agency_ids.includes(line.agency_id));
				const stopIds = [...new Set((pattern.path ?? []).filter(item => !item.zones?.length).map(item => item.stop_id))];
				const stops = await goDb.infrastructure.stops.findMany({ _id: { $in: stopIds } }, { projection: { _id: 1, latitude: 1, longitude: 1 } });

				//
				// Fill empty occurrences, preserving manual overrides and skipping unchanged Patterns

				const defaults = Object.fromEntries(stops.map(stop => [stop._id, findStopZones(stop, agencyZones, [line.agency_id])]));
				const populatedPath = populateEmptyPathZones(pattern.path ?? [], defaults);

				if (!populatedPath.some((item, index) => item !== pattern.path?.[index])) continue;

				const path = PathSchema.array().parse(populatedPath);

				//
				// Recheck parent locks, agency and hierarchy immediately before writing

				const [currentLine, currentRoute] = await Promise.all([
					goDb.offer.lines.findById(pattern.line_id),
					goDb.offer.routes.findById(pattern.route_id),
				]);

				if (!currentLine || !currentRoute || currentLine.is_locked || currentRoute.is_locked || currentRoute.line_id !== currentLine._id || currentLine.agency_id !== line.agency_id) continue;

				//
				// Record the old and new stop sequences with a System author and timestamp

				const now = Dates.now('utc').unix_milliseconds;
				const comment = CommentSchema.parse({
					created_at: now,
					created_by: 'system',
					curr_value: path,
					field: 'path',
					prev_value: pattern.path,
					type: 'field_changed',
					updated_at: now,
				});

				//
				// Save assignments and append history in one conditional write.
				// If the Pattern changed during processing, retry it on the next run instead.
				// Appending the comment preserves any history added concurrently.

				const result = await collection.updateOne({
					_id: pattern._id,
					is_locked: false,
					line_id: pattern.line_id,
					path: pattern.path,
					route_id: pattern.route_id,
					updated_at: pattern.updated_at,
				}, {
					$push: { comments: comment },
					$set: { path, updated_at: now, updated_by: 'system' },
				});

				if (result.modifiedCount) {
					updatedCount++;
					Logger.info({ message: `Populated stop zones for Pattern ${pattern._id}` });
				}
			} catch (error) {
				Logger.error({ error, message: `Error populating stop zones for Pattern ${pattern._id}` });
			}
		}
	} finally {
		//
		// Release the server cursor even if processing or iteration fails

		await cursor.close();
	}

	//
	// Log the total number of Patterns updated during this run

	Logger.info({ message: `Populated stop zones for ${updatedCount} Patterns in ${timer.get()}` });
}
