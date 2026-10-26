/* * */

import { populateLines } from '@/utils/lines.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PopulatedLine } from '@tmlmobilidade/go-offer-pckg-types';
import { type Line } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves all lines.
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function listLinesHandler(request: FastifyRequest, reply: FastifyReply<PopulatedLine[]>) {
	//

	//
	// Get the resource permissions for lines for the current user.

	const userLinePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.read);

	//
	// If no permission found, deny access

	if (!userLinePermissions) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to read lines', status_code: '403' });
	}

	//
	// Build database query filters based on user permissions

	const queryFilters: Filter<Line> = {};

	//
	// If agency_id is specified in resources and does not include the ALLOW_ALL_FLAG,
	// filter lines by those agency IDs.

	if ('resources' in userLinePermissions && 'agency_ids' in userLinePermissions.resources) {
		if (!userLinePermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			queryFilters.agency_id = { $in: userLinePermissions.resources['agency_ids'] };
		}
	}

	//
	// Fetch lines based on query filters

	const allLines = await goDb.offer.lines.findMany(queryFilters, { sort: { created_at: -1 } });
	const populatedLines = await populateLines(allLines);

	return sendSuccessApiResponse(reply, populatedLines);
	//
}
