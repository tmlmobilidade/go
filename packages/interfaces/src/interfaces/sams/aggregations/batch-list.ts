/* * */

/* eslint-disable perfectionist/sort-objects -- MongoDB aggregation readability */

import { type AggregationPipeline } from '@/common/aggregation-pipeline.js';
import { type Sam, type SamTimelineSummary } from '@tmlmobilidade/types';

import {
	samsAnalysisTimelineRowsExpr,
	samsDetailSnapExpr,
	samsListViewCarryFieldsExpr,
	samsTimelineSummaryFromBucketsExpr,
} from './batch-timeline-from-analysis.js';

/**
 * `timeline_summary` on SAM list responses: months with `key`, `month`, `count`,
 * `successful_count`, `failed_count`, plus optional `undated` (computed from `analysis`).
 */
export type SamsBatchListTimelineSummary = SamTimelineSummary;

/**
 * List view: derive `timeline_summary` from embedded `analysis` (same shape as
 * {@link samsTimelineSummaryFromBucketsExpr}: month + counts per bucket).
 */
function samsListFacetMergeTimelineStages(): AggregationPipeline<Sam> {
	return [
		{
			$addFields: {
				__carry: samsListViewCarryFieldsExpr(),
				__rowCount: { $size: { $ifNull: ['$analysis', []] } },
			},
		},
		{
			$facet: {
				emptyAnalysis: [
					{ $match: { __rowCount: 0 } },
					{
						$replaceRoot: {
							newRoot: {
								$mergeObjects: [
									'$__carry',
									{ timeline_summary: { months: [], undated: null } },
								],
							},
						},
					},
				],
				fromAnalysis: [
					{ $match: { __rowCount: { $gt: 0 } } },
					{ $addFields: { __rows: samsAnalysisTimelineRowsExpr() } },
					{ $unwind: '$__rows' },
					{
						$group: {
							_id: { m: '$__rows.monthKey', sam: '$__carry._id' },
							__carry: { $first: '$__carry' },
							f: { $sum: '$__rows.failed' },
							s: { $sum: '$__rows.successful' },
						},
					},
					{
						$group: {
							_id: '$_id.sam',
							__carry: { $first: '$__carry' },
							buckets: { $push: { f: '$f', m: '$_id.m', s: '$s' } },
						},
					},
					{ $addFields: { timeline_summary: samsTimelineSummaryFromBucketsExpr() } },
					{
						$replaceRoot: {
							newRoot: {
								$mergeObjects: [
									'$__carry',
									{ timeline_summary: '$timeline_summary' },
								],
							},
						},
					},
				],
			},
		},
		{
			$project: {
				merged: { $concatArrays: ['$emptyAnalysis', '$fromAnalysis'] },
			},
		},
		{ $unwind: '$merged' },
		{ $replaceRoot: { newRoot: '$merged' } },
		{ $sort: { created_at: -1 } },
	] as AggregationPipeline<Sam>;
}

function samsDetailFacetMergeTimelineStages(): AggregationPipeline<Sam> {
	return [
		{
			$addFields: {
				__rowCount: { $size: { $ifNull: ['$analysis', []] } },
				__snap: samsDetailSnapExpr(),
			},
		},
		{
			$facet: {
				emptyAnalysis: [
					{ $match: { __rowCount: 0 } },
					{
						$replaceRoot: {
							newRoot: {
								$mergeObjects: [
									'$__snap',
									{ timeline_summary: { months: [], undated: null } },
								],
							},
						},
					},
				],
				fromAnalysis: [
					{ $match: { __rowCount: { $gt: 0 } } },
					{ $addFields: { __rows: samsAnalysisTimelineRowsExpr() } },
					{ $unwind: '$__rows' },
					{
						$group: {
							_id: { m: '$__rows.monthKey', sam: '$__snap._id' },
							__snap: { $first: '$__snap' },
							analysis: { $first: '$analysis' },
							f: { $sum: '$__rows.failed' },
							s: { $sum: '$__rows.successful' },
						},
					},
					{
						$group: {
							_id: '$_id.sam',
							__snap: { $first: '$__snap' },
							analysis: { $first: '$analysis' },
							buckets: { $push: { f: '$f', m: '$_id.m', s: '$s' } },
						},
					},
					{ $addFields: { timeline_summary: samsTimelineSummaryFromBucketsExpr() } },
					{
						$replaceRoot: {
							newRoot: {
								$mergeObjects: [
									'$__snap',
									{ timeline_summary: '$timeline_summary' },
									{ __analysis: '$analysis' },
								],
							},
						},
					},
				],
			},
		},
		{
			$project: {
				merged: { $concatArrays: ['$emptyAnalysis', '$fromAnalysis'] },
			},
		},
		{ $unwind: '$merged' },
		{ $replaceRoot: { newRoot: '$merged' } },
	] as AggregationPipeline<Sam>;
}

/**
 * Builds a pipeline to return all matching SAMs for list view (no skip/limit).
 * Excludes `analysis` from list fields; `timeline_summary` is computed from `analysis`.
 *
 * @param matchAnd - An array of $match conditions (ANDed).
 * @returns Aggregation pipeline for MongoDB.
 */
export function samsBatchAggregationPipeline({
	matchAnd,
}: {
	matchAnd: Record<string, unknown>[]
}): AggregationPipeline<Sam> {
	return [
		...(matchAnd.length > 0 ? [{ $match: { $and: matchAnd } }] : []),
		{ $sort: { created_at: -1 } },
		...samsListFacetMergeTimelineStages(),
	] as AggregationPipeline<Sam>;
}

/**
 * Same list row shape as {@link samsBatchAggregationPipeline} for explicit `_id`s (e.g. favorites).
 */
export function samsByIdsListViewAggregationPipeline({
	agencyIds,
	ids,
	restrictByAgency,
}: {
	agencyIds?: string[]
	ids: number[]
	restrictByAgency: boolean
}): AggregationPipeline<Sam> {
	const matchAnd: Record<string, unknown>[] = [{ _id: { $in: ids } }];
	if (restrictByAgency && agencyIds?.length)
		matchAnd.push({ agency_id: { $in: agencyIds } });

	return [
		{ $match: { $and: matchAnd } },
		{ $sort: { created_at: -1 } },
		...samsListFacetMergeTimelineStages(),
	] as AggregationPipeline<Sam>;
}

/**
 * Full SAM by id: all fields preserved; `timeline_summary` is recomputed from `analysis`.
 */
export function samsByIdAggregationPipeline(id: number): AggregationPipeline<Sam> {
	return [
		{ $match: { _id: id } },
		...samsDetailFacetMergeTimelineStages(),
	] as AggregationPipeline<Sam>;
}

/* eslint-enable perfectionist/sort-objects */
