/* eslint-disable perfectionist/sort-objects */
/* * */

import { type GtfsV29ExportConfig } from '@/types.js';
import { GTFS_Shape, Shape } from '@tmlmobilidade/types';

/* * */

/**
 * Parses shape data into GTFS shapes.txt format
 * @param shapeId - The GTFS shape ID
 * @param shapeData - The shape data
 * @returns Array of formatted shape rows
 */
export function parseShape(shapeId: string, shapeData: Shape): GTFS_Shape[] {
	try {
		const parsedShape: GTFS_Shape[] = [];

		for (const shapePoint of shapeData.geojson.geometry.coordinates) {
			const lat = shapePoint[1]; // GeoJSON is [lon, lat]
			const lon = shapePoint[0];
			const sequence = parsedShape.length + 1;
			const distTraveled = shapeData.extension
				? (sequence - 1) / shapeData.geojson.geometry.coordinates.length * shapeData.extension
				: 0;
			const shapePtLat = Number(lat.toFixed(6));
			const shapePtLon = Number(lon.toFixed(6));
			const shapeDistTraveled = Number((distTraveled / 1000).toFixed(6));

			parsedShape.push({
				shape_id: shapeId,
				shape_pt_lat: shapePtLat,
				shape_pt_lon: shapePtLon,
				shape_pt_sequence: sequence,
				shape_dist_traveled: shapeDistTraveled,
			});
		}

		return parsedShape;
	} catch (error) {
		throw new Error(`Error parsing shape ${shapeId}: ${error}`);
	}
}

/**
 * Exports shape data to shapes.txt
 * @param shapeId - The GTFS shape ID
 * @param shapeData - The shape data
 * @param exportConfig - The export configuration
 */
export async function exportShape(
	shapeId: string,
	shapeData: Shape,
	exportConfig: GtfsV29ExportConfig,
) {
	const parsedShape = parseShape(shapeId, shapeData);
	await exportConfig.writers.shapes.write(parsedShape);
}
