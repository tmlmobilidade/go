/* * */

import { authorizePatternAccess } from '@/utils/pattern-access.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PatternsResolveZonesRequest, PatternsResolveZonesRequestSchema, type PatternsResolveZonesResponse } from '@tmlmobilidade/go-offer-pckg-types';
import { findStopZones } from '@tmlmobilidade/go-utils-offer';

/**
 * Resolves the default zones for stops in a Pattern's draft path.
 * Uses the parent Line's agency and stored stop coordinates without persisting changes.
 */
export async function resolvePatternZonesHandler(request: FastifyRequest<{ Body: PatternsResolveZonesRequest, Params: { id: string } }>, reply: FastifyReply<PatternsResolveZonesResponse>) {
	//

	//
	// Validate the draft stop IDs before accessing storage

	const validated = PatternsResolveZonesRequestSchema.safeParse(request.body);

	if (!validated.success) return sendErrorApiResponse(reply, { error: validated.error.message, status_code: '400' });

	//
	// Authorize updates through the persisted Pattern, Route and Line hierarchy

	const pattern = await goDb.offer.patterns.findById(request.params.id);

	if (!pattern) return sendErrorApiResponse(reply, { error: 'Pattern not found', status_code: '404' });

	const access = await authorizePatternAccess({ action: 'update', pattern, permissions: request.permissions });

	if (access.success === false) return sendErrorApiResponse(reply, { error: access.error, status_code: access.status_code });

	//
	// Fetch only zones configured for the parent Line's agency

	const zones = await goDb.offer.zones.findMany({ agency_ids: access.line.agency_id });

	if (!zones.length || !validated.data.stop_ids.length) return sendSuccessApiResponse(reply, {});

	//
	// Fetch each stop once, using stored coordinates for geographic assignment

	const stops = await goDb.infrastructure.stops.findMany({ _id: { $in: [...new Set(validated.data.stop_ids)] } });

	//
	// Return geographic defaults for the editor to apply to empty occurrences

	const defaults = Object.fromEntries(stops.map(stop => [stop._id, findStopZones(stop, zones, [access.line.agency_id])]));

	return sendSuccessApiResponse(reply, defaults);
}
