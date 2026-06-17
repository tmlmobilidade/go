/* * */

import { encodePolylineFromGeoJson } from '@tmlmobilidade/geo';
import { patterns } from '@tmlmobilidade/interfaces';
import { type Shape } from '@tmlmobilidade/types';
import { type Feature, type LineString } from 'geojson';

/* * */

const dryRun = process.env.DRY_RUN === '1';
const force = process.env.FORCE === '1';
const limit = Number(process.env.LIMIT ?? 0);

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

function getBackfilledShape(shape: Shape): { changed: boolean, shape: Shape } {
	let changed = false;

	const encodedPolyline = encodeShapeGeoJson(shape);
	const nextShape: Shape = { ...shape };

	if (encodedPolyline && (force || !nextShape.encoded_polyline)) {
		nextShape.encoded_polyline = encodedPolyline;
		changed = true;
	}

	if (nextShape.legs?.length) {
		const nextLegs = nextShape.legs.map((leg) => {
			const legEncodedPolyline = encodeShapeLeg(leg);
			if (!legEncodedPolyline || (!force && leg.encoded_polyline)) return leg;
			changed = true;
			return {
				...leg,
				encoded_polyline: legEncodedPolyline,
			};
		});
		nextShape.legs = nextLegs;
	}

	return { changed, shape: nextShape };
}

async function main() {
	console.log('[backfill-pattern-polylines] Starting', { dryRun, force, limit });

	const patternDocs = await patterns.findMany({
		'shape.geojson.geometry.coordinates.0': { $exists: true },
	});

	const patternDocsToProcess = limit ? patternDocs.slice(0, limit) : patternDocs;
	console.log('[backfill-pattern-polylines] Processing', { patternDocsToProcess: patternDocsToProcess.length });

	let checked = 0;
	let skipped = 0;
	let updated = 0;
	let failed = 0;

	for (const patternDoc of patternDocsToProcess) {
		checked += 1;

		if (!patternDoc.shape) {
			skipped += 1;
			continue;
		}

		const result = getBackfilledShape(patternDoc.shape);

		if (!result.changed) {
			skipped += 1;
			continue;
		}

		if (dryRun) {
			updated += 1;
			console.log('[backfill-pattern-polylines] Would update pattern', {
				pattern_id: patternDoc._id,
				shape_legs: result.shape.legs?.length ?? 0,
			});
			continue;
		}

		try {
			await patterns.updateById(
				patternDoc._id,
				{
					shape: result.shape,
					updated_by: 'system',
				},
				{ forceIfLocked: true },
			);
			updated += 1;
		} catch (error) {
			failed += 1;
			console.error('[backfill-pattern-polylines] Failed to update pattern', {
				error,
				pattern_id: patternDoc._id,
			});
		}
	}

	console.log('[backfill-pattern-polylines] Done', {
		checked,
		dryRun,
		failed,
		force,
		skipped,
		updated,
	});

	if (failed > 0) process.exitCode = 1;
}

void main();

/* * */
