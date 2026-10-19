/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateTypologyDto, type Typology } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Creates a new typology.
 * @param request Fastify request containing typology data
 * @param reply Fastify reply
 */
export async function createTypologyHandler(request: FastifyRequest<{ Body: CreateTypologyDto }>, reply: FastifyReply<Typology>) {
	//

	//
	// Get the resource permissions for typologies for the current user.

	const userTypologyPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.typologies.scope, PermissionCatalog.all.typologies.actions.create);

	//
	// If no permission found, deny access

	if (!userTypologyPermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create typologies');
	}

	//
	// Validate that user has permission for ALL the specified agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.typologies.actions.create,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.typologies.scope,
		value: request.body.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create typologies for these agencies. You must have permission for all agencies involved.');
	}

	//
	// Create the new typology

	const newTypology = await goDb.offer.typologies.insertOne({
		color: request.body.color ?? '#000000',
		created_by: request.me._id,
		default_onboard_fare_ids: request.body.default_onboard_fare_ids ?? [],
		default_prepaid_fare_id: request.body.default_prepaid_fare_id ?? null,
		is_locked: false,
		text_color: request.body.text_color ?? '#FFFFFF',
		updated_by: request.me._id,
		...request.body,
	});

	//
	// Send the response

	reply.send({ data: newTypology, error: null, statusCode: HTTP_STATUS.OK });

	//
}
