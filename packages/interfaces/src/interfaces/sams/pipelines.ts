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

		// Keep CSV rows grouped and ordered by SAM id.
		{ $sort: { '_id': 1, 'analysis.start_time': -1 } },

		{
			$project: {
				_id: 0,
				agency_id: 1,
				analysis: 1,
				created_at: 1,
				latest_apex_version: 1,
				remarks: 1,
				sam_id: '$_id',
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

