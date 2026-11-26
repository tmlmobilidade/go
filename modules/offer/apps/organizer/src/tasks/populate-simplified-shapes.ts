/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { simplifyPatternOverviewShape } from '@tmlmobilidade/go-offer-pckg-utils';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

/* * */

const BATCH_SIZE = 100;

/**
 * Populates missing or outdated simplified Pattern shapes.
 * Preserves original geometry, locks and user edit timestamps.
 */
export async function populateSimplifiedShapesTask() {
	//

	const timer = new Timer();

	//
	// Stream only the geometry fields needed to refresh simplified shapes

	const collection = await goDb.offer.patterns.getCollection();

	const cursor = collection.find(
		{ 'shape.encoded_polyline': { $ne: '', $type: 'string' } },
		{
			projection: { '_id': 1, 'shape.encoded_polyline': 1, 'shape.encoded_polyline_simplified': 1 },
			sort: { _id: 1 },
		}).batchSize(BATCH_SIZE);

	//
	// Batch conditional updates to limit database round trips

	let updatedCount = 0;
	const writes: Parameters<typeof collection.bulkWrite>[0][number][] = [];

	const flush = async () => {
		if (!writes.length) return;

		const result = await collection.bulkWrite(writes, { ordered: false });

		updatedCount += result.modifiedCount;
		writes.length = 0;
	};

	try {
		for await (const pattern of cursor) {
			const original = pattern.shape?.encoded_polyline;

			if (!original) continue;

			try {
				//
				// Recalculate simplified geometry and skip unchanged Patterns

				const previousSimplified = pattern.shape?.encoded_polyline_simplified;
				const simplified = simplifyPatternOverviewShape(original);

				if (simplified === previousSimplified) continue;

				//
				// Queue an update guarded against concurrent geometry changes.
				// If either copy changed during processing, retry on the next run.

				writes.push({
					updateOne: {
						filter: {
							'_id': pattern._id,
							'shape.encoded_polyline': original,
							'shape.encoded_polyline_simplified': previousSimplified === undefined ? { $exists: false } : previousSimplified,
						},
						update: { $set: { 'shape.encoded_polyline_simplified': simplified } },
					},
				});
			} catch (error) {
				Logger.error({ error, message: `Error simplifying shape for Pattern ${pattern._id}` });
			}

			if (writes.length >= BATCH_SIZE) await flush();
		}

		//
		// Save any remaining updates from the final partial batch

		await flush();
	} finally {
		//
		// Release the server cursor even if processing or iteration fails

		await cursor.close();
	}

	//
	// Log the total number of Patterns updated during this run

	Logger.info({ message: `Updated simplified shapes for ${updatedCount} Patterns in ${timer.get()}` });
}
