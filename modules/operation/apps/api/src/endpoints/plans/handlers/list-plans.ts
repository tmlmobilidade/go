/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PlansListFilters, PlansListFiltersSchema, type PlansListItem } from '@tmlmobilidade/go-operation-pckg-types';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { getPlanTemporalStatus } from '../utils/get-plan-temporal-status.js';

/**
 * Retrieves all plans.
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function listPlansHandler(request: FastifyRequest<{ Body: PlansListFilters }>, reply: FastifyReply<PlansListItem[]>) {
	//

	//
	// Apply permission filters to the request body

	request.body.agency_ids = PermissionCatalog.filterPermissionResourceValues<string>({
		action: PermissionCatalog.all.plans.actions.read,
		permissions: request.permissions,
		resourceKey: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
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
		{ $sort: { 'gtfs_feed_info.feed_start_date': -1 } },
	];

	const aggregationResult = await goDb.operation.plans.aggregate(pipeline);

	//
	// Parse and return the results

	if (!aggregationResult?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No plans found matching the filters',
			status_code: '404',
		});
	}

	//
	// Add temporal status to the results and filter by its value

	const resultsWithTemporalStatus = aggregationResult.map((result: PlansListItem) => {
		return {
			...result,
			temporal_status: getPlanTemporalStatus(result.gtfs_feed_info.feed_start_date, result.gtfs_feed_info.feed_end_date),
		};
	});

	const filteredResults = resultsWithTemporalStatus.filter(result => validatedFilters.temporal_statuses.includes(result.temporal_status));

	//
	// Send the response

	return sendSuccessApiResponse(reply, filteredResults);
}
