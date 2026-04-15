/* * */

import { type AggregationPipeline } from '@/common/aggregation-pipeline.js';
import { type Sam } from '@tmlmobilidade/types';

/* * */

export const SAMS_ANALYSIS_LIST_TAIL = 100000;

/** Distinct `latest_apex_version` on SAM documents (not per-analysis versions). */
export function samsApexVersionsAggregationPipeline({ matchAnd }: { matchAnd: Record<string, unknown>[] }): AggregationPipeline<Sam> {
	return [
		...(matchAnd.length > 0 ? [{ $match: { $and: matchAnd } }] : []),
		{ $group: { _id: '$latest_apex_version' } },
		{
			$match: {
				_id: { $nin: [null, ''] },
			},
		},
		{ $sort: { _id: -1 } },
	] as AggregationPipeline<Sam>;
}

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
		...(matchAnd.length > 0 ? [{ $match: { $and: matchAnd } }] : []),
		{ $sort: { created_at: -1 } },
		{ $skip: pageOffset },
		{ $limit: pageLimit },
		{
			$project: {
				_id: 1,
				agency_id: 1,
				analysis: {
					$map: {
						as: 'analysisItem',
						in: {
							end_time: '$$analysisItem.end_time',
							first_transaction_id: '$$analysisItem.first_transaction_id',
							start_time: '$$analysisItem.start_time',
						},
						input: {
							$slice: [{ $ifNull: ['$analysis', []] }, -analysisListTail],
						},
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
