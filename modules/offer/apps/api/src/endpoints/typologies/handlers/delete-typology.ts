/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Deletes a typology by ID
 * @param request Fastify request containing typology ID in params
 * @param reply Fastify reply
 */
export async function deleteTypologyHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	//

	const { id } = request.params;
	const typology = await goDb.offer.typologies.findById(id);

	if (!typology) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Typology not found');
	}

	//
	// Get the resource permissions for typologies for the current user.

	const userTypologyPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.typologies.scope, PermissionCatalog.all.typologies.actions.delete);

	//
	// If no permission found, deny access

	if (!userTypologyPermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete typologies');
	}

	//
	// Validate that user has permission for ALL of this typology's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.typologies.actions.delete,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.typologies.scope,
		value: typology.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete this typology. You must have permission for all agencies involved.');
	}

	//

	await goDb.offer.typologies.deleteById(id);

	reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
}
