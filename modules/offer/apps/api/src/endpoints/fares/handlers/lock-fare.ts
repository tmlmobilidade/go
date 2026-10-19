/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
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
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Fare not found');
	}

	//
	// Get the resource permissions for fares for the current user.

	const userFarePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.fares.scope, PermissionCatalog.all.fares.actions.lock);

	//
	// If no permission found, deny access

	if (!userFarePermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to lock/unlock fares');
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
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: toggle lock fare. You must have permission for all agencies involved.');
	}

	// If authorized, toggle the lock status of the fare
	await goDb.offer.fares.updateOne({ _id: request.params.id }, { is_locked: !fareData.is_locked });
	const foundFare = await goDb.offer.fares.findById(request.params.id);
	if (!foundFare) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Fare not found');
	}

	return reply.send({ data: foundFare, error: null, statusCode: HTTP_STATUS.OK });

	//
}
