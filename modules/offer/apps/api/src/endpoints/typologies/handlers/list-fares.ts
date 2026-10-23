/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type TypologiesFareItem, TypologiesFareItemSchema } from '@tmlmobilidade/go-offer-pckg-types';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Returns fare labels for typology configuration within the user's agency access.
 * @param request The request object
 * @param reply The reply object
 */
export async function listFaresHandler(request: FastifyRequest, reply: FastifyReply<TypologiesFareItem[]>) {
	//

	//
	// Resolve agency access through typology permissions.

	const agencyAccess = PermissionCatalog.getPermissionResourceAccess({
		checks: [
			{ action: PermissionCatalog.all.typologies.actions.nav, scope: PermissionCatalog.all.typologies.scope },
			{ action: PermissionCatalog.all.typologies.actions.update, scope: PermissionCatalog.all.typologies.scope },
		],
		permissions: request.permissions,
		resource_key: 'agency_ids',
	});

	if (!agencyAccess.allowAll && !agencyAccess.values.length) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to read typology fare options', status_code: '403' });
	}

	//
	// Fetch accessible fares and return only selector metadata.

	const fares = await goDb.offer.fares.findMany(agencyAccess.allowAll ? {} : { agency_ids: { $in: agencyAccess.values } });

	return sendSuccessApiResponse(reply, TypologiesFareItemSchema.array().parse(fares));
}
