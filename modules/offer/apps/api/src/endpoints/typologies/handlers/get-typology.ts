/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Typology } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { TYPOLOGIES_READ_PERMISSION_CHECKS } from '../permission-checks.js';

/**
 * Retrieves a single typology by ID
 * @param request Fastify request containing typology ID in params
 * @param reply Fastify reply
 */
export async function getTypologyHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Typology>) {
	//

	//
	// Get the Typology from the database

	const typologyData = await goDb.offer.typologies.findById(request.params.id);

	if (!typologyData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Typology not found');
	}

	//
	// Validate that user has permission for at least one of this typology's agencies

	const agencyAccess = PermissionCatalog.getPermissionResourceAccess({
		checks: TYPOLOGIES_READ_PERMISSION_CHECKS,
		permissions: request.permissions,
		resource_key: 'agency_ids',
	});

	const canReadTypology = agencyAccess.allowAll || typologyData.agency_ids.some(agencyId => agencyAccess.values.includes(agencyId));

	if (!canReadTypology) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read this typology');
	}

	//
	// Fetch the typology data

	return reply.send({
		data: typologyData,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});

	//
}
