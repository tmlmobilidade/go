/* * */

import { etaShapeNodes } from '@tmlmobilidade/databases';
import { chunkLineByDistanceV2, hashedShapesToFeatureCollection } from '@tmlmobilidade/geo';
import { Filter, hashedShapes, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Ride } from '@tmlmobilidade/types';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

const BATCH_SIZE = 100_000;

interface SyncShapeNodesOptions {
	chunkLength: number // in meters
	ridesQuery: Filter<Ride>
}

/**
 * Builds and persists shape nodes for rides matching `ridesQuery`.
 *
 * Fetches distinct `hashed_shape_id` values from `rides`, loads each shape,
 * chunks its geometry by `chunkLength` (meters), and writes every chunk point
 * to clickhouse table `eta.shape_nodes` with `shape_id` and `node_index`.
 *
 * Returns total number of shape nodes processed and written.
 */
export async function syncShapeNodes({ chunkLength = 25, ridesQuery }: SyncShapeNodesOptions): Promise<{ shapeNodesProcessed: number }> {
	//

	//
	// Setup ClickHouse writer
	const writer = new BatchWriter({
		batch_size: BATCH_SIZE,
		insertFn: async (data) => {
			await etaShapeNodes.insert('JSONEachRow', data);
		},
		title: 'shape_nodes',
	});

	//
	// Get distinct hashed shape ids from rides
	Logger.info(`Getting distinct hashed shape ids from rides`);
	const distinctHashedShapeIds = await rides.distinct('hashed_shape_id', ridesQuery);
	const hashedShapesCollection = await hashedShapes.getCollection();

	//
	// Get hashed shapes cursor
	const hashedShapesCursor = hashedShapesCollection.find(
		{ _id: { $in: distinctHashedShapeIds } },
		{ projection: { _id: 1, points: { shape_pt_lat: 1, shape_pt_lon: 1 } } },
	).batchSize(BATCH_SIZE).stream();

	//
	// Create shape nodes for each hashed shape
	Logger.info(`Creating shape nodes for ${distinctHashedShapeIds.length} hashed shape ids`);

	let shapeNodesProcessed = 0;
	for await (const hashedShape of hashedShapesCursor) {
		const geojson = hashedShapesToFeatureCollection(hashedShape);
		const chunks = chunkLineByDistanceV2(geojson.features[0].geometry, chunkLength);

		for (const [idx, chunk] of chunks.coordinates.entries()) {
			shapeNodesProcessed++;
			await writer.write({
				latitude: chunk[1],
				longitude: chunk[0],
				node_index: idx,
				shape_id: hashedShape._id,
			});
		}
	}

	//
	// Flush writer
	await writer.flush();

	//
	// Return total number of shape nodes processed and written
	return { shapeNodesProcessed };
}
