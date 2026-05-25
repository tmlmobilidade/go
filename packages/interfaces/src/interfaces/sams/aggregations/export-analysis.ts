/* * */

import { type AggregationPipeline } from '@/common/aggregation-pipeline.js';
import { type Sam } from '@tmlmobilidade/types';

/**
 * Optional per-analysis filters after `$unwind` (e.g. export file `start_time` / `end_time`).
 */
export interface SamsAnalysisExportAnalysisFilter {
	/** If set, keep rows where `analysis.end_time` is less than or equal to this timestamp. */
	end_time?: number
	/** If set, keep rows where `analysis.start_time` is greater than or equal to this timestamp. */
	start_time?: number
}

/**
 * Builds a pipeline that returns one document per analysis record (no SAM pagination),
 * for CSV / file export. SAM documents are restricted by optional {@link samIds} and/or
 * {@link matchAnd} (ANDed together). Callers must pass at least one non-empty constraint;
 * otherwise the pipeline would not filter SAMs before unwind.
 * Then `analysis` is unwound and optionally narrowed by {@link SamsAnalysisExportAnalysisFilter}.
 *
 * @param samIds - Optional SAM `_id` values to include. When omitted or empty, no `_id` filter is applied.
 * @param matchAnd - Optional list conditions ANDed with each other (and with `samIds` when set).
 * @param analysisFilter - Optional filters on the unwound `analysis` subdocument.
 * @returns Aggregation pipeline for MongoDB.
 */
export function samsAnalysisExportAggregationPipeline({ analysisFilter, matchAnd, samIds }: { analysisFilter?: SamsAnalysisExportAnalysisFilter, matchAnd?: Record<string, unknown>[], samIds?: number[] }): AggregationPipeline<Sam> {
	const analysisConditions: Record<string, unknown>[] = [];

	if (analysisFilter?.end_time != null) {
		analysisConditions.push({ 'analysis.end_time': { $lte: analysisFilter.end_time } });
	}
	if (analysisFilter?.start_time != null) {
		analysisConditions.push({ 'analysis.start_time': { $gte: analysisFilter.start_time } });
	}

	const docMatchConditions: Record<string, unknown>[] = [];
	if (samIds != null && samIds.length > 0) {
		docMatchConditions.push({ _id: { $in: samIds } });
	}
	if (matchAnd != null && matchAnd.length > 0) {
		docMatchConditions.push(...matchAnd);
	}

	const docMatchStage: undefined | { $match: Record<string, unknown> } =
		docMatchConditions.length === 0
			? undefined
			: docMatchConditions.length === 1
				? { $match: docMatchConditions[0] }
				: { $match: { $and: docMatchConditions } };

	return [
		...(docMatchStage ? [docMatchStage] : []),

		{ $sort: { created_at: -1 } },

		{ $unwind: { path: '$analysis', preserveNullAndEmptyArrays: false } },

		...(analysisConditions.length > 0 ? [{ $match: { $and: analysisConditions } }] : []),

		{ $sort: { '_id': 1, 'analysis.start_time': -1 } },

		{
			$project: {
				_id: 0,
				agency_id: 1,
				analysis: 1,
				created_at: 1,
				latest_apex_version: 1,
				remarks: 1,
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
