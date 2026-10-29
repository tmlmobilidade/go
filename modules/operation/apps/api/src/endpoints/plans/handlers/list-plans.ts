/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PlansListFilters, PlansListFiltersSchema, type PlansListItem } from '@tmlmobilidade/go-operation-pckg-types';
import { getPlanTemporalStatus } from '@tmlmobilidade/go-operation-pckg-utils';
import { filterPermissionResourceValues } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves all plans.
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function listPlansHandler(request: FastifyRequest<{ Body: PlansListFilters }>, reply: FastifyReply<PlansListItem[]>) {
	//

	//
	// Apply permission filters to the request body

	request.body.agency_ids = filterPermissionResourceValues<string>({
		action: 'read',
		permissions: request.permissions,
		resourceKey: 'agency_ids',
		scope: 'plans',
		values: request.body.agency_ids,
	});

	//
	// Validate the filters

	const validatedFilters = PlansListFiltersSchema.parse(request.body);

	//
	// Build aggregation pipeline

	const pipeline: AggregationPipeline<PlansListItem> = [
		{
			$match: {
				...{ agency_id: { $in: validatedFilters.agency_ids ?? [] } },
			},
		},
		{ $sort: { active_from: -1 } },
	];

	const aggregationResult = await goDb.operation.plans.aggregate(pipeline);

	//
	// Check overlaps before filtering so hidden plans still trigger the warning.
	// Validity dates are inclusive, including plans sharing a boundary date.

	const resultsWithTemporalStatus = aggregationResult.map((result: PlansListItem) => {
		//

		//
		// Calculate overlaps

		const hasOverlap = aggregationResult.some((other) => {
			// Skip plans with the same id or from different agency
			if (other._id === result._id || other.agency_id !== result.agency_id) return false;
			// Check if the other plan has overlapping dates
			return other.active_from <= result.active_until && other.active_until >= result.active_from;
		});

		return {
			...result,
			has_overlapping_plans: hasOverlap,
			temporal_status: getPlanTemporalStatus(result.active_from, result.active_until),
		};
	});

	const filteredResults = resultsWithTemporalStatus.filter(result => validatedFilters.temporal_statuses.includes(result.temporal_status));

	//
	// Send the response

	return sendSuccessApiResponse(reply, filteredResults);
}
