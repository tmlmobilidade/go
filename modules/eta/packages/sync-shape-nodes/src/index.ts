/* * */

import { etaShapeNodes } from '@tmlmobilidade/databases';
import { chunkLineByDistanceV2, hashedShapesToFeatureCollection } from '@tmlmobilidade/geo';
import { Filter, hashedShapes, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Ride } from '@tmlmobilidade/types';
import { BatchWriter } from '@tmlmobilidade/writers';

/* * */

const BATCH_SIZE = 100_000;

interface SyncShapeNodesOptions {
	chunkLength: number // in meters
	ridesQuery: Filter<Ride>
}

export async function syncShapeNodes({ chunkLength = 25, ridesQuery }: SyncShapeNodesOptions): Promise<{ shapeNodesProcessed: number }> {
	//

	const writer = new BatchWriter({
		batch_size: BATCH_SIZE,
		insertFn: async (data) => {
			await etaShapeNodes.insert('JSONEachRow', data);
		},
		title: 'shape_nodes',
	});

	Logger.info(`Getting distinct hashed shape ids from rides`);
	const distinctHashedShapeIds = await rides.distinct('hashed_shape_id', ridesQuery);
	const hashedShapesCollection = await hashedShapes.getCollection();

	const hashedShapesCursor = hashedShapesCollection.find(
		{ _id: { $in: distinctHashedShapeIds } },
		{ projection: { _id: 1, points: { shape_pt_lat: 1, shape_pt_lon: 1 } } },
	).batchSize(BATCH_SIZE).stream();

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
