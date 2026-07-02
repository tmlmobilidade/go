/* * */

import { encodePolylineFromGeoJson } from '@tmlmobilidade/geo';
import { patterns } from '@tmlmobilidade/interfaces';
import { type Pattern, type Shape, type UnixTimestamp } from '@tmlmobilidade/types';
import { type Feature, type LineString } from 'geojson';

/* * */

const dryRun = process.env.DRY_RUN === '1';
const force = process.env.FORCE === '1';
const includeLocked = process.env.INCLUDE_LOCKED === '1';
const limit = Number(process.env.LIMIT ?? 0);
const logEvery = Number(process.env.LOG_EVERY ?? 100);

/* * */

function encodeShapeGeoJson(shape: Shape): string | undefined {
	if (!shape.geojson?.geometry?.coordinates?.length) return undefined;
	return encodePolylineFromGeoJson(toLineStringFeature(shape.geojson.geometry.coordinates, shape.geojson.properties ?? {}));
}

function encodeShapeLeg(leg: Shape['legs'][number]): string | undefined {
	if (leg.geojson?.geometry?.coordinates?.length) return encodePolylineFromGeoJson(toLineStringFeature(leg.geojson.geometry.coordinates, leg.geojson.properties));
	if (leg.geometry?.length) {
		return encodePolylineFromGeoJson(toLineStringFeature(leg.geometry, {
			distance: leg.distance,
			duration: leg.duration,
			from_index: leg.from_index,
			to_index: leg.to_index,
		}));
	}
	return undefined;
}

function toLineStringFeature(
	coordinates: number[][],
	properties: Record<string, unknown>,
): Feature<LineString> {
	return {
		geometry: {
			coordinates: coordinates as [number, number][],
			type: 'LineString',
		},
		properties,
		type: 'Feature',
	};
}

function getBackfillSetFields(shape: Shape): { changed: boolean, fields: Record<string, unknown>, legsChanged: number } {
	const fields: Record<string, unknown> = {};
	let legsChanged = 0;
	const encodedPolyline = encodeShapeGeoJson(shape);

	if (encodedPolyline && (force || !shape.encoded_polyline)) {
		fields['shape.encoded_polyline'] = encodedPolyline;
	}

	if (shape.legs?.length) {
		shape.legs.forEach((leg, index) => {
			const legEncodedPolyline = encodeShapeLeg(leg);
			if (!legEncodedPolyline || (!force && leg.encoded_polyline)) return;
			fields[`shape.legs.${index}.encoded_polyline`] = legEncodedPolyline;
			legsChanged += 1;
		});
	}

	return { changed: Object.keys(fields).length > 0, fields, legsChanged };
}

function getCandidateFilter(): Record<string, unknown> {
	const filter: Record<string, unknown> = {
		'shape.geojson.geometry.coordinates.0': { $exists: true },
	};

	if (!force) {
		filter.$or = [
			{ 'shape.encoded_polyline': { $exists: false } },
			{ 'shape.encoded_polyline': { $in: [null, ''] } },
			{
				'shape.legs': {
					$elemMatch: {
						$or: [
							{ encoded_polyline: { $exists: false } },
							{ encoded_polyline: { $in: [null, ''] } },
						],
					},
				},
			},
		];
	}

	if (!includeLocked) {
		filter.is_locked = { $ne: true };
	}

	return filter;
}

function getUnixTimestamp(): UnixTimestamp {
	return Date.now() as UnixTimestamp;
}

function shouldLogProgress(processed: number): boolean {
	return logEvery > 0 && processed % logEvery === 0;
}

async function main() {
	let shouldDisconnect = false;

	try {
		console.log('[backfill-pattern-polylines] Starting', { dryRun, force, includeLocked, limit, logEvery });

		const patternCollection = await patterns.getCollection();
		shouldDisconnect = true;
		const candidateFilter = getCandidateFilter();
		const totalCandidates = await patternCollection.countDocuments(candidateFilter);

		console.log('[backfill-pattern-polylines] Found candidates', {
			limit,
			total_candidates: totalCandidates,
		});

		const patternCursor = patternCollection.find(candidateFilter, {
			batchSize: 250,
			limit: limit || undefined,
			projection: {
				_id: 1,
				is_locked: 1,
				shape: 1,
				updated_at: 1,
			},
			sort: { _id: 1 },
		});

		let checked = 0;
		let stale = 0;
		let skipped = 0;
		let updated = 0;
		let failed = 0;

		for await (const patternDoc of patternCursor as AsyncIterable<Pick<Pattern, '_id' | 'is_locked' | 'shape' | 'updated_at'>>) {
			checked += 1;

			if (!patternDoc.shape) {
				skipped += 1;
				continue;
			}

			const result = getBackfillSetFields(patternDoc.shape);

			if (!result.changed) {
				skipped += 1;
				continue;
			}

			if (dryRun) {
				updated += 1;
				console.log('[backfill-pattern-polylines] Would update pattern', {
					fields: Object.keys(result.fields).length,
					legs: result.legsChanged,
					pattern_id: patternDoc._id,
				});
				if (shouldLogProgress(checked)) {
					console.log('[backfill-pattern-polylines] Progress', { checked, dryRun, failed, skipped, stale, updated });
				}
				continue;
			}

			try {
				const updateResult = await patternCollection.updateOne(
					{
						_id: patternDoc._id,
						updated_at: patternDoc.updated_at,
						...(includeLocked ? {} : { is_locked: { $ne: true } }),
					},
					{
						$set: {
							...result.fields,
							updated_at: getUnixTimestamp(),
							updated_by: 'system',
						},
					},
				);

				if (updateResult.matchedCount === 0) {
					stale += 1;
					console.warn('[backfill-pattern-polylines] Skipped stale pattern', {
						pattern_id: patternDoc._id,
					});
					continue;
				}

				updated += 1;
			} catch (error) {
				failed += 1;
				console.error('[backfill-pattern-polylines] Failed to update pattern', {
					error,
					pattern_id: patternDoc._id,
				});
			}

			if (shouldLogProgress(checked)) {
				console.log('[backfill-pattern-polylines] Progress', { checked, dryRun, failed, skipped, stale, updated });
			}
		}

		console.log('[backfill-pattern-polylines] Done', {
			checked,
			dryRun,
			failed,
			force,
			includeLocked,
			skipped,
			stale,
			totalCandidates,
			updated,
		});

		if (failed > 0) process.exitCode = 1;
	} finally {
		if (shouldDisconnect) await patterns.disconnect();
	}
}

void main()
	.catch((error) => {
		console.error('[backfill-pattern-polylines] Fatal error', { error });
		process.exitCode = 1;
	});

/* * */
