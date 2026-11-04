/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Fare } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of a fare by ID
 * @param request Fastify request containing fare ID in params
 * @param reply Fastify reply
 */
export async function lockFareHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Fare>) {
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

	//
	// Get the resource permissions for fares for the current user.

	const userFarePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.fares.scope, PermissionCatalog.all.fares.actions.lock);

	//
	// If no permission found, deny access

	if (!userFarePermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to lock/unlock fares',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL of this fare's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.fares.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.fares.scope,
		value: fareData.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to perform this action: toggle lock fare. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	// If authorized, toggle the lock status of the fare
	await goDb.offer.fares.updateOne({ _id: request.params.id }, { is_locked: !fareData.is_locked, updated_by: request.me._id });
	const foundFare = await goDb.offer.fares.findById(request.params.id);
	if (!foundFare) {
		return sendErrorApiResponse(reply, {
			error: 'Fare not found',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, foundFare);

	//
}
