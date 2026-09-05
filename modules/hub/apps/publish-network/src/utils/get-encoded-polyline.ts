/* * */

import { EncodedPolyline, GeoJsonLineStringGeometrySchema } from '@tmlmobilidade/go-types-geo';
import { HubV1GtfsShapes } from '@tmlmobilidade/go-types-hub';
import { fromGeoJsonLineStringToEncodedPolyline } from '@tmlmobilidade/go-utils-geo';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function getEncodedPolyline(importedGtfsSql: GtfsSQLTables, shapeId: string): Promise<EncodedPolyline> {
	//

	const timer = new Timer();

	//
	// Fetch the current shape data from the database

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
	// Return the encoded polyline

	Logger.info({ message: `Encoded polyline for shape ${shapeId} in ${timer.get()}` });

	return shapeAsEncodedPolyline;
};
