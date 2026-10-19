/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Typology } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of a typology by ID
 * @param request Fastify request containing typology ID in params
 * @param reply Fastify reply
 */
export async function lockTypologyHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Typology>) {
	//

	//
	// Get the Typology from the database

	const typologyData = await goDb.offer.typologies.findById(request.params.id);

	if (!typologyData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Typology not found');
	}

	//
	// Get the resource permissions for typologies for the current user.

	const userTypologyPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.typologies.scope, PermissionCatalog.all.typologies.actions.lock);

	//
	// If no permission found, deny access

	if (!userTypologyPermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to lock/unlock typologies');
	}

	//
	// Validate that user has permission for ALL of this typology's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.typologies.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.typologies.scope,
		value: typologyData.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: toggle lock typology. You must have permission for all agencies involved.');
	}

	// If authorized, toggle the lock status of the typology
	await goDb.offer.typologies.updateOne({ _id: request.params.id }, { is_locked: !typologyData.is_locked });
	const foundTypology = await goDb.offer.typologies.findById(request.params.id);
	if (!foundTypology) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Typology not found');
	}

	return reply.send({ data: foundTypology, error: null, statusCode: HTTP_STATUS.OK });

	//
}
