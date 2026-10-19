/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Typology, type UpdateTypologyDto } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an existing typology by ID
 * @param request Fastify request containing typology ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateTypologyHandler(request: FastifyRequest<{ Body: UpdateTypologyDto, Params: { id: string } }>, reply: FastifyReply<Typology>) {
	//

	//
	// Get the Typology from the database

	const typologyData = await goDb.offer.typologies.findById(request.params.id);

	if (!typologyData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Typology not found');
	}

	//
	// Get the resource permissions for typologies for the current user.

	const userTypologyPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.typologies.scope, PermissionCatalog.all.typologies.actions.update);

	//
	// If no permission found, deny access

	if (!userTypologyPermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update typologies');
	}

	//
	// Validate that user has permission for ALL of this typology's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.typologies.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.typologies.scope,
		value: typologyData.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update this typology. You must have permission for all agencies involved.');
	}

	//
	// Update the typology

	const updatedTypology = await goDb.offer.typologies.updateById(typologyData._id, request.body);

	//
	// Send the updated typology data as the response

	reply.send({
		data: updatedTypology,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});

	//
}
