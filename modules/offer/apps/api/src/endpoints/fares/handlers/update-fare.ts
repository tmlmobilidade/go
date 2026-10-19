/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Fare, type UpdateFareDto } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an existing fare by ID
 * @param request Fastify request containing fare ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateFareHandler(request: FastifyRequest<{ Body: UpdateFareDto, Params: { id: string } }>, reply: FastifyReply<Fare>) {
	//

	//
	// Get the Fare from the database

	const fareData = await goDb.offer.fares.findById(request.params.id);

	if (!fareData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Fare not found');
	}

	//
	// Get the resource permissions for fares for the current user.

	const userFarePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.fares.scope, PermissionCatalog.all.fares.actions.update);

	//
	// If no permission found, deny access

	if (!userFarePermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update fares');
	}

	//
	// Validate that user has permission for ALL of this fare's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.fares.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.fares.scope,
		value: fareData.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update this fare. You must have permission for all agencies involved.');
	}

	//
	// Update the fare

	const updatedFare = await goDb.offer.fares.updateById(fareData._id, request.body);

	//
	// Send the updated fare data as the response

	reply.send({
		data: updatedFare,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});

	//
}
