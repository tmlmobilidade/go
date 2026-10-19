/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateFareDto, type Fare } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Creates a new fare.
 * @param request Fastify request containing fare data
 * @param reply Fastify reply
 */
export async function createFareHandler(request: FastifyRequest<{ Body: CreateFareDto }>, reply: FastifyReply<Fare>) {
	//

	//
	// Get the resource permissions for fares for the current user.

	const userFarePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.fares.scope, PermissionCatalog.all.fares.actions.create);

	//
	// If no permission found, deny access

	if (!userFarePermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create fares');
	}

	//
	// Validate that user has permission for ALL the specified agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.fares.actions.create,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.fares.scope,
		value: request.body.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create fares for these agencies. You must have permission for all agencies involved.');
	}

	//
	// Create the new fare

	const newFare = await goDb.offer.fares.insertOne({
		created_by: request.me._id,
		currency_type: 'EUR',
		is_locked: false,
		payment_method: '0',
		price: 0,
		transfers: '0',
		updated_by: request.me._id,
		...request.body,
	});

	//
	// Send the response

	reply.send({ data: newFare, error: null, statusCode: HTTP_STATUS.OK });

	//
}
