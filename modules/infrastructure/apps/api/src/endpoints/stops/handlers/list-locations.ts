/* * */

import { locationPermissionMatch } from '@/utils/location-permission-match.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type StopsLocationRequest, StopsLocationRequestSchema, type StopsLocationResponse } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { AllowAllFlagValue } from '@tmlmobilidade/go-types-permissions';

/* * */

/** Distinct `location.<slot>` items among the matched stops, sorted by name. */
function slotFacet(slot: keyof StopsLocationResponse) {
	return [
		{ $match: { [`location.${slot}`]: { $exists: true } } },
		{ $group: { _id: `$location.${slot}.osm_id`, item: { $first: `$location.${slot}` } } },
		{ $replaceRoot: { newRoot: '$item' } },
		{ $sort: { name: 1 } },
	];
}

/**
 * Returns, for each location slot, the divisions that have at least one stop
 * the user has access to for the given permissions.
 * @param request The request object containing the permissions registry in the body
 * @param reply The reply object
 */
export async function listLocationsHandler(request: FastifyRequest<{ Body: StopsLocationRequest }>, reply: FastifyReply<StopsLocationResponse>) {
	//

	//
	// Validate the filters

	const validatedFilters = StopsLocationRequestSchema.safeParse(request.body);

	if (!validatedFilters.success) {
		return sendErrorApiResponse(reply, {
			error: validatedFilters.error.message,
			status_code: '400',
		});
	}

	//
	// Get the allowed location IDs from the permissions

	const allowedLocationIds = validatedFilters.data.permissions.actions?.flatMap(action => request.permissions
		.filter(permission => permission.scope === validatedFilters.data.permissions.scope && permission.action === action)
		.flatMap(permission => 'resources' in permission && 'location_ids' in permission.resources ? permission.resources.location_ids ?? [] : []),
	) ?? [];

	//
	// Collect the distinct divisions of the stops the user can access

	// $facet is not part of the typed pipeline, so use the raw driver collection.
	const stopsCollection = await goDb.infrastructure.stops.getCollection();

	const result = await stopsCollection.aggregate<StopsLocationResponse>([
		{ $match: allowedLocationIds.includes(AllowAllFlagValue) ? {} : locationPermissionMatch(allowedLocationIds) },
		{ $facet: { neighbourhood: slotFacet('neighbourhood'), primary: slotFacet('primary'), secondary: slotFacet('secondary'), tertiary: slotFacet('tertiary') } },
	]).next();

	if (!result?.secondary.length) {
		return sendErrorApiResponse(reply, {
			error: 'No locations found for the given filters.',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, result);
}
