/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { type StopsMunicipalityItem, StopsMunicipalityRequest, StopsMunicipalityRequestSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type MunicipalityFeature } from '@tmlmobilidade/go-types-locations';
import { AllowAllFlagValue } from '@tmlmobilidade/go-types-permissions';

/**
 * Get municipalities platform data.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function listMunicipalitiesHandler(request: FastifyRequest<{ Body: StopsMunicipalityRequest }>, reply: FastifyReply<StopsMunicipalityItem[]>) {
	//

	//
	// Validate the filters

	const validatedFilters = StopsMunicipalityRequestSchema.parse(request.body);

	//
	// Get the municipality IDs from the permissions

	const resourceMunicipalityIds = validatedFilters.permissions.actions?.flatMap(action => request.permissions
		.filter(permission => permission.scope === validatedFilters.permissions.scope && permission.action === action)
		.flatMap(permission => 'resources' in permission && 'municipality_ids' in permission.resources ? permission.resources.municipality_ids ?? [] : []),
	) ?? [];

	//
	// Build aggregation pipeline

	const matchedMunicipalityIds = !resourceMunicipalityIds.includes(AllowAllFlagValue)
		? { _id: { $in: resourceMunicipalityIds } }
		: {};

	const pipeline: AggregationPipeline<MunicipalityFeature> = [
		{ $match: matchedMunicipalityIds },
		{ $project: { _id: 1, properties: 1 } },
		{ $sort: { _id: -1 } },
	];

	const aggregationResult = await goDb.locations.municipalities.aggregate(pipeline);

	//
	// Transform the result into a list of StopsMunicipalityItem

	const stopsMunicipalityItems: StopsMunicipalityItem[] = aggregationResult.map(feature => ({
		_id: feature._id,
		...feature.properties,
	}));

	//
	// Parse and return the result

	if (!stopsMunicipalityItems?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No stops municipalities found for this user.',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, stopsMunicipalityItems);
}

