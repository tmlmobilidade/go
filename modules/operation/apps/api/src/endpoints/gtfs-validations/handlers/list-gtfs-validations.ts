/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { ValidationListFilters, ValidationListFiltersSchema, ValidationListItem, ValidationListItemSchema } from '@tmlmobilidade/go-operation-pckg-types';
import { filterPermissionResourceValues } from '@tmlmobilidade/go-types-permissions';

/**
 * Lists GTFS Validation objects, filtered
 * by user permissions and sorted by creation date.
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function listGtfsValidationsHandler(request: FastifyRequest<{ Body: ValidationListFilters }>, reply: FastifyReply<ValidationListItem[]>) {
	//

	//
	// Apply permission filters to the request body

	request.body.agency_ids = filterPermissionResourceValues<string>({
		action: 'read',
		permissions: request.permissions,
		resourceKey: 'agency_ids',
		scope: 'gtfs_validations',
		values: request.body.agency_ids,
	});

	//
	// Validate the filters

	const validatedFilters = ValidationListFiltersSchema.parse(request.body); ;

	//
	// Build aggregation pipeline

	const pipeline: AggregationPipeline<ValidationListItem> = [
		{
			$match: {
				...{ agency_id: { $in: validatedFilters.agency_ids ?? [] } },
				...(validatedFilters.processing_statuses.length ? { processing_status: { $in: validatedFilters.processing_statuses } } : []),
				...(validatedFilters.validity_statuses.length ? { validity_status: { $in: validatedFilters.validity_statuses } } : []),
			},
		},
		{ $project: Object.fromEntries(Object.keys(ValidationListItemSchema.shape).map(key => [key, 1])) },
		{ $sort: { created_at: -1 } },
	];

	const aggregationResult = await goDb.operation.gtfsValidations.aggregate(pipeline);

	//
	// Return the results

	return sendSuccessApiResponse(reply, aggregationResult);
}
