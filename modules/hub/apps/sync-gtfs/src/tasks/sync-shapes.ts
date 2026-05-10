/* * */

import type { Shape as GtfsShapesExtended } from '@tmlmobilidade/go-navegante-shared-types';
import type { NetworkShape, ShapePoint } from '@tmlmobilidade/go-navegante-shared-types';

import { getGtfsSqliteContext } from '@/modules/gtfsSqlite.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { SERVERDB } from '@tmlmobilidade/go-navegante-shared-services/SERVERDB';
import { SERVERDB_KEYS } from '@tmlmobilidade/go-navegante-shared-settings';
import { sortCollator } from '@tmlmobilidade/go-navegante-shared-utils';
import * as turf from '@turf/turf';

/* * */

export const syncShapes = async () => {
	//

	LOGGER.title(`Sync Shapes`);
	const globalTimer = new TIMETRACKER();

	//
	// Fetch all Shapes from NETWORKDB

	const fetchRawDataTimer = new TIMETRACKER();
	const { db } = getGtfsSqliteContext();
	const allShapesRaw = db.prepare('SELECT * FROM shapes').all() as GtfsShapesExtended[];
	LOGGER.info(`Fetched ${allShapesRaw.length} rows from SQLite (${fetchRawDataTimer.get()})`);

	//
	// Group all rows by shape_id

	const groupShapesTimer = new TIMETRACKER();

	const allShapesData = new Map<string, NetworkShape>();

	for (const resultRow of allShapesRaw) {
		//

		// Create a unique key for the shape to be used in the database.
		// By defining this key here, we can avoid having to create a separate variable to hold them.

		const shapeIdKey = SERVERDB_KEYS.NETWORK.SHAPES.ID(resultRow.shape_id);

		//
		// Check if a shape object already exists, or create a new one.

		let shapeData: NetworkShape;

		if (allShapesData.has(shapeIdKey)) {
			shapeData = allShapesData.get(shapeIdKey);
		}
		else {
			shapeData = {
				extension: 0,
				geojson: null,
				points: [],
				shape_id: resultRow.shape_id,
			};
		}

		//
		// Add the point to the shape

		const parsedPoint: ShapePoint = {
			shape_dist_traveled: resultRow.shape_dist_traveled,
			shape_pt_lat: resultRow.shape_pt_lat,
			shape_pt_lon: resultRow.shape_pt_lon,
			shape_pt_sequence: resultRow.shape_pt_sequence,
		};

		shapeData.points.push(parsedPoint);

		allShapesData.set(shapeIdKey, shapeData);

	//
	}

	LOGGER.info(`Created ${allShapesData.size} Shapes from raw data (${groupShapesTimer.get()})`);

	//
	// For each grouped shape, calculate the extension and create a geojson object.
	// Then, update the entry in the database.

	const saveShapesTimer = new TIMETRACKER();

	for (const shapeData of allShapesData.values()) {
		//

		//
		// Sort points to match sequence

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

		await SERVERDB.set(SERVERDB_KEYS.NETWORK.SHAPES.ID(shapeData.shape_id), JSON.stringify(shapeData));

		//
	}

	LOGGER.info(`Saved ${allShapesData.size} Shapes to SERVERDB (${saveShapesTimer.get()})`);

	//
	// Remove stale shapes

	const removeStaleShapesTimer = new TIMETRACKER();

	const allExistingShapeKeys: string[] = [];
	for await (const key of SERVERDB.scanIterator({ MATCH: `${SERVERDB_KEYS.NETWORK.SHAPES.BASE}:*`, TYPE: 'string' })) {
		allExistingShapeKeys.push(String(key));
	}

	const staleShapeKeys = allExistingShapeKeys.filter(id => !allShapesData.has(id));
	if (staleShapeKeys.length) {
		await SERVERDB.del(staleShapeKeys);
	}

	LOGGER.info(`Deleted ${staleShapeKeys.length} stale Shapes from SERVERDB (${removeStaleShapesTimer.get()})`);

	//

	LOGGER.success(`Done updating Shapes (${globalTimer.get()})`);

	//
};
