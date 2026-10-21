/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Fare, type UpdateFareDto, UpdateFareSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an existing fare by ID
 * @param request Fastify request containing fare ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateFareHandler(request: FastifyRequest<{ Body: UpdateFareDto, Params: { id: string } }>, reply: FastifyReply<Fare>) {
	//

	//
	// Validate the client contract before using the request data.

	const validatedFare = UpdateFareSchema.safeParse(request.body);

	if (!validatedFare.success) {
		return sendErrorApiResponse(reply, {
			error: validatedFare.error.message,
			status_code: '400',
		});
	}

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

	const userFarePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.fares.scope, PermissionCatalog.all.fares.actions.update);

	//
	// If no permission found, deny access

	if (!userFarePermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update fares',
			status_code: '403',
		});
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
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update this fare. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Check permission for every newly assigned agency as well.

	if (validatedFare.data.agency_ids && !PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.fares.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.fares.scope,
		value: validatedFare.data.agency_ids,
	})) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update fares for these agencies.',
			status_code: '403',
		});
	}

	//
	// Update the fare with parsed client fields and the authenticated updater.

	const updatedFare = await goDb.offer.fares.updateById(fareData._id, {
		...validatedFare.data,
		updated_by: request.me._id,
	});

	//
	// Send the updated fare data as the response

	return sendSuccessApiResponse(reply, updatedFare);

	//
}
