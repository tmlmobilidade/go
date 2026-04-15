/* * */

import { type AggregationPipeline } from '@/common/aggregation-pipeline.js';
import { type Sam } from '@tmlmobilidade/types';

/**
 * The maximum number of analysis records to include per SAM.
 * Used to avoid returning excessively large analysis arrays.
 */
export const SAMS_ANALYSIS_LIST_TAIL = 100000;

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
		// Optionally filter SAM documents by all provided conditions
		...(matchAnd.length > 0 ? [{ $match: { $and: matchAnd } }] : []),

		// Group by the top-level 'latest_apex_version' to get unique values
		{ $group: { _id: '$latest_apex_version' } },

		// Exclude null/empty strings from the results
		{ $match: { _id: { $nin: [null, ''] } } },

		// Sort versions descending (latest first)
		{ $sort: { _id: -1 } },
	] as AggregationPipeline<Sam>;
}

/**
 * Builds a pipeline to return a paginated batch of SAMs, including a tail slice
 * of their analysis records (by default, up to SAMS_ANALYSIS_LIST_TAIL most recent).
 *
 * @param analysisListTail - The number of analysis records to include (from the end).
 * @param matchAnd - An array of $match conditions (ANDed).
 * @param pageLimit - MongoDB limit (number of SAMs to return).
 * @param pageOffset - MongoDB skip (offset for paging).
 * @returns Aggregation pipeline for MongoDB.
 */
export function samsBatchAggregationPipeline({
	analysisListTail = SAMS_ANALYSIS_LIST_TAIL,
	matchAnd,
	pageLimit,
	pageOffset,
}: {
	analysisListTail?: number
	matchAnd: Record<string, unknown>[]
	pageLimit: number
	pageOffset: number
}): AggregationPipeline<Sam> {
	return [
		// Optionally filter by provided query conditions
		...(matchAnd.length > 0 ? [{ $match: { $and: matchAnd } }] : []),

		// Sort by document creation time (descending; newest first)
		{ $sort: { created_at: -1 } },

		// Apply skip/limit for pagination
		{ $skip: pageOffset },
		{ $limit: pageLimit },

		// Project only specific fields, and slice 'analysis' to the most recent N
		{
			$project: {
				_id: 1,
				agency_id: 1,
				analysis: {
					// Limit analysis array to the last `analysisListTail` records,
					// mapping only the relevant fields for each item
					$map: {
						as: 'analysisItem',
						in: {
							end_time: '$$analysisItem.end_time',
							first_transaction_id: '$$analysisItem.first_transaction_id',
							start_time: '$$analysisItem.start_time',
						},
						input: { $slice: [{ $ifNull: ['$analysis', []] }, -analysisListTail] },
					},
				},
				latest_apex_version: 1,
				remarks: 1,
				system_status: 1,
				transactions_expected: 1,
				transactions_found: 1,
				transactions_missing: 1,
			},
		},
	] as AggregationPipeline<Sam>;
}
