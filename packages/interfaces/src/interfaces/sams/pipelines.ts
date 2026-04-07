/* * */

import { type AggregationPipeline } from '@/common/aggregation-pipeline.js';
import { type Sam } from '@tmlmobilidade/types';

/* * */

export const SAMS_ANALYSIS_LIST_TAIL = 100;

export function samsApexVersionsAggregationPipeline({ matchAnd }: { matchAnd: Record<string, unknown>[] }): AggregationPipeline<Sam> {
	return [
		...(matchAnd.length > 0 ? [{ $match: { $and: matchAnd } }] : []),
		{
			$project: {
				versions: {
					$setUnion: [
						[{ $ifNull: ['$latest_apex_version', null] }],
						{
							$map: {
								as: 'analysisItem',
								in: '$$analysisItem.apex_version',
								input: {
									$filter: {
										as: 'analysisItem',
										cond: { $ne: ['$$analysisItem.apex_version', null] },
										input: { $ifNull: ['$analysis', []] },
									},
								},
							},
						},
					],
				},
			},
		},
		{ $unwind: '$versions' },
		{ $match: { versions: { $ne: null } } },
		{ $group: { _id: '$versions' } },
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
				analysis: { $slice: [{ $ifNull: ['$analysis', []] }, -analysisListTail] },
				latest_apex_version: {
					$let: {
						in: {
							$cond: [
								{
									$and: [
										{ $ne: ['$$storedApexVersion', null] },
										{ $ne: ['$$storedApexVersion', ''] },
									],
								},
								'$$storedApexVersion',
								{ $arrayElemAt: ['$$analysisApexVersions', -1] },
							],
						},
						vars: {
							analysisApexVersions: {
								$filter: {
									as: 'analysisApexVersion',
									cond: {
										$and: [
											{ $ne: ['$$analysisApexVersion', null] },
											{ $ne: ['$$analysisApexVersion', ''] },
										],
									},
									input: {
										$map: {
											as: 'analysisItem',
											in: '$$analysisItem.apex_version',
											input: { $ifNull: ['$analysis', []] },
										},
									},
								},
							},
							storedApexVersion: { $ifNull: ['$latest_apex_version', null] },
						},
					},
				},
				seen_first_at: 1,
				seen_last_at: 1,
				system_status: 1,
				transactions_expected: 1,
				transactions_found: 1,
				transactions_missing: 1,
			},
		},
	] as AggregationPipeline<Sam>;
}
