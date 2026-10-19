/* * */

import { type AggregateOptions, type AggregationCursor, type AggregationPipeline, type Document } from '@tmlmobilidade/go-clients-mongo';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';

/**
 * Aggregates documents in the collection.
 * @param context The context of the GoDB collection.
 * @param pipeline The aggregation pipeline to execute.
 * @param options The options for the aggregation operation.
 * @returns A promise that resolves to aggregated documents or a cursor.
 */
export async function aggregate<T extends Document>(context: GoDbCollectionContext<T>, pipeline: AggregationPipeline<T>, options?: AggregateOptions): Promise<T[]> {
	const aggregationResult = context.collection.aggregate(pipeline, options);
	return aggregationResult.toArray() as Promise<T[]>;
}

export async function aggregateCursor<T extends Document>(context: GoDbCollectionContext<T>, pipeline: AggregationPipeline<T>, options?: AggregateOptions): Promise<AggregationCursor<T>> {
	return context.collection.aggregate(pipeline, options);
}
