/* * */

import { EncodedPolyline, GeoJsonLineStringGeometrySchema } from '@tmlmobilidade/go-types-geo';
import { HubV1GtfsShapes } from '@tmlmobilidade/go-types-hub';
import { fromGeoJsonLineStringToEncodedPolyline } from '@tmlmobilidade/go-utils-geo';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';

/* * */

const encodedPolylineCache = new Map<string, EncodedPolyline>();

/**
 * Retrieves an encoded polyline from the database.
 * The encoded polyline is cached in memory to avoid unnecessary database queries.
 * @param importedGtfsSql - The imported GTFS SQL tables.
 * @param shapeId - The shape ID.
 * @returns The encoded polyline.
 */
export async function getEncodedPolyline(importedGtfsSql: GtfsSQLTables, shapeId: string): Promise<EncodedPolyline> {
	//

	//
	// Check if the encoded polyline is already cached

	const cachedEncodedPolyline = encodedPolylineCache.get(shapeId);

	if (cachedEncodedPolyline) return cachedEncodedPolyline;

	//
	// If not, fetch the encoded polyline from the database

	const foundShapeData = importedGtfsSql.shapes.query<HubV1GtfsShapes>(`
		SELECT *
		FROM shapes
		WHERE shape_id = ?
		ORDER BY shape_id, shape_pt_sequence;
	`, [shapeId]);

	//
	// Transform the GTFS shape data into a GeoJSON LineString,
	// and then encode it as a polyline string.

	const shapeCoordinates: [number, number][] = foundShapeData.map(shape => [shape.shape_pt_lon, shape.shape_pt_lat]);

	const shapeAsGeoJsonGeometry = GeoJsonLineStringGeometrySchema.parse({
		coordinates: shapeCoordinates,
		type: 'LineString',
	});

	const shapeAsEncodedPolyline = fromGeoJsonLineStringToEncodedPolyline(shapeAsGeoJsonGeometry);

	//
	// Cache the encoded polyline

	encodedPolylineCache.set(shapeId, shapeAsEncodedPolyline);

	//
	// Return the encoded polyline

	return shapeAsEncodedPolyline;
};
