/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type EncodedPolyline } from '@tmlmobilidade/go-types-geo';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { chunkLineStringByDistance, fromEncodedPolylineToGeoJsonLineString, geohashEncode } from '@tmlmobilidade/go-utils-geo';
import { Logger } from '@tmlmobilidade/logger';

/* * */

const BATCH_SIZE = 10_000;
const TABLE = 'eta.hist_shape_nodes';

/* * */

interface HistShapeRow {
	hashed_shape_id: string
	shape_polyline: EncodedPolyline
}

interface HistShapeNode {
	geohash: string
	hashed_shape_id: string
	latitude: number
	longitude: number
	node_index: number
}

/* * */

/**
 * Densifies the shapes referenced by `eta.hist_rides` into equidistant nodes
 * and inserts them into `eta.hist_shape_nodes` for spatial snapping.
 *
 * Only shapes that are not in the table yet are processed: a shape's node
 * geometry is immutable (it is keyed by the hash of the polyline), so once
 * loaded it never needs to be sent again. On a steady-state run this is a
 * handful of new shapes, not the whole network.
 *
 * For each missing `(hashed_shape_id, shape_polyline)` from `operation.hashed_shapes`:
 * 1. Decode the encoded polyline to a GeoJSON LineString.
 * 2. Resample it every `chunkLengthMeters` along the path (first vertex,
 *    equidistant nodes, last vertex; no raw vertices in between).
 * 3. Write each node with lat/lon and its geohash cell at `geohashPrefixLength`,
 *    which must match the precision used by the snap joins.
 *
 * Because existing shapes are never re-sent, a change in the densifier does
 * not propagate to shapes loaded before it: the table (and everything keyed by
 * node_index) must then be rebuilt with a migration. The spacing invariant is
 * checked at the end of every run so such a mismatch is reported instead of
 * silently producing wrong ETAs.
 *
 * @param chunkLengthMeters - Target spacing between consecutive shape nodes.
 * @param geohashPrefixLength - Geohash precision of the `geohash` column.
 */
export async function loadHistoricalShapeNodes(chunkLengthMeters: number, geohashPrefixLength: number): Promise<void> {
	const shapes = await labDb.queryFromString<HistShapeRow>(`
		SELECT _id AS hashed_shape_id, shape_polyline
		FROM operation.hashed_shapes FINAL
		WHERE _id IN (SELECT DISTINCT hashed_shape_id FROM eta.hist_rides)
		  AND _id NOT IN (SELECT DISTINCT hashed_shape_id FROM ${TABLE})
	`);

	if (shapes.length === 0) {
		Logger.info({ message: 'hist_shape_nodes already covers every historical shape; nothing to load' });
		await checkShapeNodeSpacing(chunkLengthMeters);
		return;
	}

	Logger.info({ message: `Densifying ${shapes.length} new shapes into ${TABLE}` });

	const writer = new BatchWriter<HistShapeNode>({
		batch_size: BATCH_SIZE,
		insertFn: async (values) => {
			await labDb.insert({ format: 'JSONEachRow', table: TABLE, values });
		},
		title: TABLE,
	});

	for (const shape of shapes) {
		if (!shape.shape_polyline || !shape.hashed_shape_id) continue;

		const line = fromEncodedPolylineToGeoJsonLineString(shape.shape_polyline);
		const nodes = chunkLineStringByDistance(line, chunkLengthMeters);

		for (const [nodeIndex, [longitude, latitude]] of nodes.coordinates.entries()) {
			await writer.write({
				geohash: geohashEncode(latitude, longitude, geohashPrefixLength),
				hashed_shape_id: shape.hashed_shape_id,
				latitude,
				longitude,
				node_index: nodeIndex,
			});
		}
	}

	await writer.flush();
	await checkShapeNodeSpacing(chunkLengthMeters);
}

/**
 * Verifies the geometry invariant every consumer of `node_index` relies on:
 * consecutive nodes of a shape are at most `chunkLengthMeters` apart. The
 * densifier interpolates along the path, so no gap can exceed the spacing
 * (10% covers great-circle vs. planar rounding). A shape that violates it was
 * densified by a different algorithm, and the travel times, aggregates and
 * snapped waypoints built on top of it are wrong too, so this only reports
 * and points at the rebuild migration instead of patching the table in place.
 */
async function checkShapeNodeSpacing(chunkLengthMeters: number): Promise<void> {
	const rows = await labDb.queryFromString<{ bad_shapes: number | string }>(`
		SELECT count() AS bad_shapes
		FROM (
			SELECT hashed_shape_id, max(gap) AS max_gap
			FROM (
				SELECT
					hashed_shape_id,
					node_index,
					greatCircleDistance(lagInFrame(longitude) OVER w, lagInFrame(latitude) OVER w, longitude, latitude) AS gap
				FROM ${TABLE} FINAL
				WINDOW w AS (PARTITION BY hashed_shape_id ORDER BY node_index)
			)
			WHERE node_index > 0
			GROUP BY hashed_shape_id
		)
		WHERE max_gap > $1
	`, { 1: chunkLengthMeters * 1.1 });

	const badShapes = Number(rows[0]?.bad_shapes ?? 0);

	if (badShapes > 0) {
		Logger.error({
			error: new Error(`${badShapes} shape(s) in ${TABLE} have consecutive nodes further apart than ${chunkLengthMeters} m`),
			message: `${TABLE} was densified by a different algorithm; every node_index consumer is wrong. Run eta/bootstrap/migrate-2026-09-17-rebuild-shape-nodes.sql to rebuild.`,
		});
	}
}
