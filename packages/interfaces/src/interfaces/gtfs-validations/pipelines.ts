/* * */

import { type AggregationPipeline } from '@/common/aggregation-pipeline.js';
import { type Stop } from '@tmlmobilidade/types';

/* * */

export function gtfsValidationStopsPipeline(agencyId: string): AggregationPipeline<Stop> {
	return [
		{
			$match: {
				is_deleted: { $ne: true },
			},
		},
		{
			$match: {
				$or: [
					{ flags: { $elemMatch: { agency_ids: { $in: [agencyId] } } } },
					{ flags: { $size: 0 } },
					{ flags: { $exists: false } },
				],
			},
		},
		{
			$project: {
				_id: 1,
				flags: 1,
				latitude: 1,
				longitude: 1,
				name: 1,
			},
		},
		{
			$sort: { _id: 1 },
		},
	];
}
