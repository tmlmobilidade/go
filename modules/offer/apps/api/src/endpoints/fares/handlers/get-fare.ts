/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Fare } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { FARES_READ_PERMISSION_CHECKS } from '../permission-checks.js';

/**
 * Retrieves a single fare by ID
 * @param request Fastify request containing fare ID in params
 * @param reply Fastify reply
 */
export async function getFareHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Fare>) {
	//

	//
	// Get the Fare from the database

	const fareData = await goDb.offer.fares.findById(request.params.id);

	if (!fareData) {
		return sendErrorApiResponse(reply, {
			error: 'Fare not found',
			status_code: '404',
		});
	}

	const agencyAccess = PermissionCatalog.getPermissionResourceAccess({
		checks: FARES_READ_PERMISSION_CHECKS,
		permissions: request.permissions,
		resource_key: 'agency_ids',
	});

	const canReadFare = agencyAccess.allowAll || fareData.agency_ids.some(agencyId => agencyAccess.values.includes(agencyId));

	if (!canReadFare) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read this fare',
			status_code: '403',
		});
	}

	//
	// Fetch the fare data

	return sendSuccessApiResponse(reply, fareData);

	//
}
