/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type StopsPatternsResponse, StopsPatternsResponseSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type StopId } from '@tmlmobilidade/go-types-infrastructure';
import { locationSlotOsmIds } from '@tmlmobilidade/go-types-locations';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Returns the readable Offer patterns whose paths use a Stop.
 * @param request The request object containing the stop ID in the params
 * @param reply The reply object
 */
export async function listStopPatternsHandler(request: FastifyRequest<{ Params: { id: StopId } }>, reply: FastifyReply<StopsPatternsResponse>) {
	//

	//
	// Get the stop from the database

	const foundStop = await goDb.infrastructure.stops.findById(request.params.id);

	if (!foundStop) {
		return sendErrorApiResponse(reply, {
			error: `Can not find stop with ID ${request.params.id}`,
			status_code: '404',
		});
	}

	//
	// Check if the user has permission to read this stop

	const hasPermission = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.stops.actions.read,
		permissions: request.permissions,
		resource_key: 'location_ids',
		scope: PermissionCatalog.all.stops.scope,
		value: locationSlotOsmIds(foundStop.location),
	});

	if (!hasPermission) {
		return sendErrorApiResponse(reply, {
			error: 'User does not have permission to read this stop',
			status_code: '401',
		});
	}

	//
	// Offer grants pattern read access through the parent line's agency.
	// Reading a stop does not grant permission to read its associated patterns.

	const lineAgencyReadAccess = PermissionCatalog.getPermissionResourceAccess({
		checks: [{ action: PermissionCatalog.all.lines.actions.read, scope: PermissionCatalog.all.lines.scope }],
		permissions: request.permissions,
		resource_key: 'agency_ids',
	});

	if (!lineAgencyReadAccess.allowAll && !lineAgencyReadAccess.values.length) return sendSuccessApiResponse(reply, []);

	//
	// Match documents rather than unwinding paths so repeated stop occurrences appear once.

	const patterns = await goDb.offer.patterns.findMany({ 'path.stop_id': foundStop._id }, {
		projection: { _id: 1, code: 1, headsign: 1, line_id: 1, route_id: 1 },
		sort: [['code', 1], ['_id', 1]],
	});

	if (!patterns.length) return sendSuccessApiResponse(reply, []);

	//
	// Identify the parent lines referenced by these patterns.

	const patternLineIds = [...new Set(patterns.map(pattern => pattern.line_id))];

	//
	// Only load lines belonging to agencies the user can read.
	// An unrestricted agency permission leaves the line query unfiltered by agency.

	const permittedAgencyFilter = lineAgencyReadAccess.allowAll
		? {}
		: { agency_id: { $in: lineAgencyReadAccess.values } };

	const readableLinesQuery = { _id: { $in: patternLineIds }, ...permittedAgencyFilter };
	const readableLines = await goDb.offer.lines.findMany(readableLinesQuery, { projection: { _id: 1 } });

	//
	// Include only patterns whose parent line belongs to a permitted agency.

	const readableLineIds = new Set(readableLines.map(line => line._id));

	const associatedPatterns = patterns.filter(pattern => readableLineIds.has(pattern.line_id));

	return sendSuccessApiResponse(reply, StopsPatternsResponseSchema.parse(associatedPatterns));
}
