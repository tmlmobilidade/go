/* * */

import { toMetersFromKilometersOrMeters } from '@tmlmobilidade/geo';
import { GeoJsonLineStringGeometrySchema } from '@tmlmobilidade/go-types-geo';
import { type GtfsStrictV30Shapes, type GtfsStrictV30Trips } from '@tmlmobilidade/go-types-gtfs-strict';
import { CreateHashedShapeSchema, type HashedShape, HashedShapeSchema, type Plan } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { fromGeoJsonLineStringToEncodedPolyline } from '@tmlmobilidade/go-utils-geo';
import { Timer } from '@tmlmobilidade/timer';
import crypto from 'crypto';

/**
 * Transforms the GTFS shape data into a HashedShape.
 * @param shapeData The GTFS shape data to transform into a HashedShape.
 * @returns The HashedShape.
 */
export function toHashedShape(planData: Plan, tripData: GtfsStrictV30Trips, shapeData: GtfsStrictV30Shapes[]): HashedShape {
	//

	const timer = new Timer();

	//
	// Transform the GTFS shape data into a GeoJSON LineString,
	// and then encode it as a polyline string.

	const sortedShapeData = shapeData.sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence);

	const shapeAsGeoJsonGeometry = GeoJsonLineStringGeometrySchema.parse({
		coordinates: sortedShapeData.map(point => [point.shape_pt_lon, point.shape_pt_lat]),
		type: 'LineString',
	});

	const shapeAsEncodedPolyline = fromGeoJsonLineStringToEncodedPolyline(shapeAsGeoJsonGeometry);

	//
	// Calculate the extension in meters for the shape.

	const firstShapePoint = sortedShapeData[0];
	const lastShapePoint = sortedShapeData[sortedShapeData.length - 1];

	const extensionScheduledInMeters = Math.round(toMetersFromKilometersOrMeters(lastShapePoint.shape_dist_traveled, firstShapePoint.shape_dist_traveled));

	//
	// Hash the object contents and check if it already exists in the database.
	// The hash value is the _id of the HashedTrip item.

	const createHashedShape = CreateHashedShapeSchema.parse({
		agency_id: planData.agency_id,
		extension: extensionScheduledInMeters,
		shape_id: tripData.shape_id,
		shape_polyline: shapeAsEncodedPolyline,
	});

	const uniqueIdValueForHashedShape = crypto
		.createHash('sha256')
		.update(JSON.stringify(createHashedShape))
		.digest('hex');

	const hashedShapeItem = HashedShapeSchema.parse({
		...createHashedShape,
		_id: uniqueIdValueForHashedShape,
		updated_at: Dates.now('utc').unix_milliseconds,
	});

	console.log(`Transformed shape data "${tripData.shape_id}" into a HashedShape "${uniqueIdValueForHashedShape}" (${timer.get()})`);

	return hashedShapeItem;
};
