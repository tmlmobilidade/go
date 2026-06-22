/* * */

import { apiCache, type ApiCacheKey } from '@tmlmobilidade/databases';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HubShape, type HubShapePoint } from '@tmlmobilidade/types';
import * as turf from '@turf/turf';

/* * */

export async function generateShapes(importedGtfsSql: GtfsSQLTables) {
	//

	Logger.title(`Sync Shapes`);
	const globalTimer = new Timer();

	//
	// Fetch all Shapes from NETWORKDB

	const fetchRawDataTimer = new Timer();
	const allShapesRaw = importedGtfsSql.shapes.all();
	Logger.info({ message: `Fetched ${allShapesRaw.length} rows from GTFS (${fetchRawDataTimer.get()})` });

	//
	// Group all rows by shape_id

	const groupShapesTimer = new Timer();

	const allShapesData = new Map<string, HubShape>();

	for (const shapeRaw of allShapesRaw) {
		//

		//
		// Use the cache key as the key for the Map,
		// as it will be used to compare and delete stale shapes.

		const cacheKey: ApiCacheKey = `hub:v1:network:shapes:${shapeRaw.shape_id}`;

		//
		// Check if a shape object already exists, or create a new one.

		let shapeData: HubShape;

		if (allShapesData.has(cacheKey)) {
			shapeData = allShapesData.get(cacheKey);
		} else {
			shapeData = {
				_id: shapeRaw.shape_id,
				agency_id: '',
				extension: 0,
				geojson: null,
				points: [],
			};
		}

		//
		// Add the point to the shape

		const parsedPoint: HubShapePoint = {
			shape_dist_traveled: shapeRaw.shape_dist_traveled,
			shape_pt_lat: shapeRaw.shape_pt_lat,
			shape_pt_lon: shapeRaw.shape_pt_lon,
			shape_pt_sequence: shapeRaw.shape_pt_sequence,
		};

		shapeData.points.push(parsedPoint);

		allShapesData.set(cacheKey, shapeData);

	//
	}

	Logger.info({ message: `Created ${allShapesData.size} Shapes from raw data (${groupShapesTimer.get()})` });

	//
	// For each grouped shape, calculate the extension and create a geojson object.
	// Then, update the entry in the database.

	const saveShapesTimer = new Timer();

	for (const shapeData of allShapesData.values()) {
		//

		//
		// Sort points to match sequence

		const sortCollator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
		shapeData.points.sort((a, b) => sortCollator.compare(String(a.shape_pt_sequence), String(b.shape_pt_sequence)));

		//
		// Create geojson feature using turf

		shapeData.geojson = turf.lineString(shapeData.points.map(point => [point.shape_pt_lon, point.shape_pt_lat]));

		//
		// Calculate shape extension

		const shapeExtensionKm = turf.length(shapeData.geojson, { units: 'kilometers' });
		const shapeExtensionInMeters = shapeExtensionKm ? shapeExtensionKm * 1000 : 0;
		shapeData.extension = Math.floor(shapeExtensionInMeters);

		//
		// Update or create new document

		await apiCache.set(`hub:v1:network:shapes:${shapeData._id}`, JSON.stringify(shapeData));
		// await apiCache.set(SERVERDB_KEYS.NETWORK.SHAPES.ID(shapeData.shape_id), JSON.stringify(shapeData));

		//
	}

	Logger.info({ message: `Saved ${allShapesData.size} Shapes to SERVERDB (${saveShapesTimer.get()})` });

	//
	// Remove stale shapes

	const removeStaleShapesTimer = new Timer();

	Logger.info({ message: `Removing stale Shapes from cache...` });

	const allExistingShapeKeys = await apiCache.scan(`hub:network:shapes:*`);
	const staleShapeKeys = allExistingShapeKeys.filter(key => !allShapesData.has(key));
	if (staleShapeKeys.length) await apiCache.deleteMany(staleShapeKeys);

	Logger.info({ message: `Deleted ${staleShapeKeys.length} stale Shapes from cache (${removeStaleShapesTimer.get()})` });

	//

	Logger.success(`Done updating Shapes (${globalTimer.get()})`);

	//
};
