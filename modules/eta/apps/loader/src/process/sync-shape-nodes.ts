/* * */

import { AppConfig } from '@/lib/config.js';
import { qualifiedTable } from '@/lib/eta-database.js';
import { chunkLineByDistanceV2, hashedShapesToFeatureCollection } from '@tmlmobilidade/geo';
import { hashedShapes } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { BatchWriter } from '@tmlmobilidade/utils';
import geohash from 'ngeohash';

/* * */

/**
 * Builds and persists shape nodes for rides matching `ridesQuery`.
 *
 * Fetches distinct `hashed_shape_id` values from `rides`, loads each shape,
 * chunks its geometry by `chunkLength` (meters), and writes every chunk point
 * to clickhouse table `eta.hist_shape_nodes` with `hashed_shape_id` and `node_index`.
 *
 * Returns total number of shape nodes processed and written.
 */
export async function syncShapeNodes(clickhouseClient, hashedShapeIds: string[]): Promise<{ shapeNodesProcessed: number }> {
	//

	Logger.title('4. Sync historical shape nodes into clickhouse');

	//
	// Setup ClickHouse writer
	const writer = new BatchWriter({
		batch_size: 10_000,
		insertFn: async (data) => {
			await clickhouseClient.insert({
				format: 'JSONEachRow',
				table: qualifiedTable('hist_shape_nodes'),
				values: data,
			});
		},
		title: qualifiedTable('hist_shape_nodes'),
	});

	//
	// Get distinct hashed shape ids from rides
	const hashedShapesCollection = await hashedShapes.getCollection();

	//
	// Get hashed shapes cursor
	const hashedShapesCursor = hashedShapesCollection.find(
		{ _id: { $in: hashedShapeIds } },
		{ projection: { _id: 1, points: { shape_pt_lat: 1, shape_pt_lon: 1 } } },
	).batchSize(10_000).stream();

	//
	// Create shape nodes for each hashed shape
	Logger.info(`Creating shape nodes for ${hashedShapeIds.length} hashed shape ids`);

	let shapeNodesProcessed = 0;
	for await (const hashedShape of hashedShapesCursor) {
		const geojson = hashedShapesToFeatureCollection(hashedShape);
		const chunks = chunkLineByDistanceV2(geojson.features[0].geometry, AppConfig.shapeNodeChunkLength);

		for (const [idx, chunk] of chunks.coordinates.entries()) {
			shapeNodesProcessed++;
			await writer.write({
				geohash: geohash.encode(chunk[1], chunk[0], 7),
				hashed_shape_id: hashedShape._id,
				latitude: chunk[1],
				longitude: chunk[0],
				node_index: idx,
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
