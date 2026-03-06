/* * */

import { ClickHouseClient } from '@tmlmobilidade/clickhouse';
import { chunkLineByDistanceV2, hashedShapesToFeatureCollection } from '@tmlmobilidade/geo';
import { Filter, hashedShapes, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Ride } from '@tmlmobilidade/types';
import { ClickHouseWriter } from '@tmlmobilidade/writers';

import { ShapeNode, shapeNodeTableSchema } from './types.js';

/* * */

interface SyncShapeNodesOptions {
	batchSize: number
	chunkLength: number // in meters
	client: ClickHouseClient
	ridesQuery: Filter<Ride>
}

export async function syncShapeNodes({ batchSize = 100_000, chunkLength = 25, client, ridesQuery }: SyncShapeNodesOptions): Promise<{ shapeNodesProcessed: number }> {
	//

	const writer = new ClickHouseWriter<ShapeNode>({
		batch_size: batchSize,
		client,
		table: 'shape_nodes',
		tableSchema: shapeNodeTableSchema,
	});
	await client.command({ query: 'DROP TABLE IF EXISTS shape_nodes' });
	await writer.ensureTable();

	Logger.info(`Getting distinct hashed shape ids from rides`);
	const distinctHashedShapeIds = await rides.distinct('hashed_shape_id', ridesQuery);
	const hashedShapesCollection = await hashedShapes.getCollection();

	const hashedShapesCursor = hashedShapesCollection.find(
		{ _id: { $in: distinctHashedShapeIds } },
		{ projection: { _id: 1, points: { shape_pt_lat: 1, shape_pt_lon: 1 } } },
	).batchSize(batchSize).stream();

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

	await writer.flush();

	return { shapeNodesProcessed };
}
