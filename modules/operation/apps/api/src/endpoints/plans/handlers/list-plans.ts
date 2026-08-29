/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PlanListFilters, PlanListFiltersSchema, PlanListItem, PlanListItemSchema } from '@tmlmobilidade/go-operation-pckg-types';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Retrieves all plans.
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function listPlansHandler(request: FastifyRequest<{ Body: PlanListFilters }>, reply: FastifyReply<PlanListItem[]>) {
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

	const validatedFilters = PlanListFiltersSchema.parse(request.body);

	//
	// Build the validity filter from the plan feed dates.
	// The validity status is derived and is not stored in the database.

	const currentOperationalDate = Dates.now('Europe/Lisbon').operational_date_int;

	const validityStatusFilters = validatedFilters.validity_statuses.map((status) => {
		if (status === 'active') {
			return {
				'gtfs_feed_info.feed_end_date': { $gte: currentOperationalDate },
				'gtfs_feed_info.feed_start_date': { $lte: currentOperationalDate },
			};
		}

		if (status === 'expired') {
			return { 'gtfs_feed_info.feed_end_date': { $lt: currentOperationalDate } };
		}

		return { 'gtfs_feed_info.feed_start_date': { $gt: currentOperationalDate } };
	});

	//
	// Build aggregation pipeline

	const pipeline: AggregationPipeline<PlanListItem> = [
		{
			$match: {
				...{ agency_id: { $in: validatedFilters.agency_ids ?? [] } },
				...(validityStatusFilters.length ? { $or: validityStatusFilters } : {}),
			},
		},
		{ $project: Object.fromEntries(Object.keys(PlanListItemSchema.shape).map(key => [key, 1])) },
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

	return sendSuccessApiResponse(reply, aggregationResult);
}
