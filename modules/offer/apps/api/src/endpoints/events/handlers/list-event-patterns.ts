/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type EventsPatternsResponse, EventsPatternsResponseSchema } from '@tmlmobilidade/go-offer-pckg-types';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Returns the readable patterns referencing an event in manual rules
 * @param request Fastify request containing event ID in params
 * @param reply Fastify reply
 */
export async function listEventPatternsHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<EventsPatternsResponse>) {
	//

	//
	// Get the Event from the database

	const eventData = await goDb.offer.events.findById(request.params.id);

	if (!eventData) {
		return sendErrorApiResponse(reply, {
			error: 'Event not found',
			status_code: '404',
		});
	}

	//
	// Validate that user has permission for at least one of this event's agencies

	const hasPermissionForAnyAgency = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.events.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.events.scope,
		value: eventData.agency_ids,
	});

	if (!hasPermissionForAnyAgency) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read this event',
			status_code: '403',
		});
	}

	//
	// Offer grants pattern read access through the parent line's agency.
	// Reading an event does not grant permission to read its associated patterns.

	const lineAgencyReadAccess = PermissionCatalog.getPermissionResourceAccess({
		checks: [{ action: PermissionCatalog.all.lines.actions.read, scope: PermissionCatalog.all.lines.scope }],
		permissions: request.permissions,
		resource_key: 'agency_ids',
	});

	if (!lineAgencyReadAccess.allowAll && !lineAgencyReadAccess.values.length) return sendSuccessApiResponse(reply, []);

	//
	// Match each pattern once, even when multiple manual rules reference this event.

	const patterns = await goDb.offer.patterns.findMany({ rules: { $elemMatch: { event_id: eventData._id, kind: 'manual' } } }, {
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

	return sendSuccessApiResponse(reply, EventsPatternsResponseSchema.parse(associatedPatterns));
}
