/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateFareDto, CreateFareSchema, type Fare } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Creates a new fare.
 * @param request Fastify request containing fare data
 * @param reply Fastify reply
 */
export async function createFareHandler(request: FastifyRequest<{ Body: CreateFareDto }>, reply: FastifyReply<Fare>) {
	//

	//
	// Validate the client contract before using the request data.

	const validatedFare = CreateFareSchema.safeParse(request.body);

	if (!validatedFare.success) {
		return sendErrorApiResponse(reply, {
			error: validatedFare.error.message,
			status_code: '400',
		});
	}

	//
	// Get the resource permissions for fares for the current user.

	const userFarePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.fares.scope, PermissionCatalog.all.fares.actions.create);

	//
	// If no permission found, deny access

	if (!userFarePermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to create fares',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL the specified agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.fares.actions.create,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.fares.scope,
		value: validatedFare.data.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to create fares for these agencies. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Create the new fare

	const newFare = await goDb.offer.fares.insertOne({
		currency_type: 'EUR',
		is_locked: false,
		payment_method: '0',
		price: 0,
		transfers: '0',
		...validatedFare.data,
		created_by: request.me._id,
		updated_by: request.me._id,
	});

	//
	// Send the response

	return sendSuccessApiResponse(reply, newFare);

	//
}
