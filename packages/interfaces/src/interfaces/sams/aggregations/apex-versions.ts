/* * */

import { type AggregationPipeline } from '@/common/aggregation-pipeline.js';
import { type Sam } from '@tmlmobilidade/types';

/**
 * Builds a pipeline that enumerates all distinct `latest_apex_version`
 * values present in SAM documents (ignores per-analysis versions).
 *
 * @param matchAnd - Optional array of $match conditions (ANDed).
 * @returns Aggregation pipeline for MongoDB.
 */
export function samsApexVersionsAggregationPipeline({
	matchAnd,
}: {
	matchAnd: Record<string, unknown>[]
}): AggregationPipeline<Sam> {
	return [
		...(matchAnd.length > 0 ? [{ $match: { $and: matchAnd } }] : []),

		{ $group: { _id: '$latest_apex_version' } },

		{ $match: { _id: { $nin: [null, ''] } } },

		{ $sort: { _id: -1 } },
	] as AggregationPipeline<Sam>;
}
