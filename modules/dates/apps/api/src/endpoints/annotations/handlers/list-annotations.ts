/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Annotation } from '@tmlmobilidade/go-types-dates';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves all annotations.
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function listAnnotationsHandler(request: FastifyRequest, reply: FastifyReply<Annotation[]>) {
	//

	//
	// Unassigned annotations are visible to every authenticated user. For assigned
	// annotations, exclude any record containing an agency the user cannot read.

	const access = PermissionCatalog.getPermissionResourceAccess<string>({
		checks: [{ action: PermissionCatalog.all.annotations.actions.read, scope: PermissionCatalog.all.annotations.scope }],
		permissions: request.permissions,
		resource_key: 'agency_ids',
	});

	const queryFilters: Filter<Annotation> = access.allowAll ? {} : {
		agency_ids: { $not: { $elemMatch: { $nin: access.values } } },
	};

	//
	// Fetch annotations based on query filters

	const allAnnotations = await goDb.dates.annotations.findMany(queryFilters, { sort: [['dates', -1], ['created_at', -1], ['_id', 1]] });

	return sendSuccessApiResponse(reply, allAnnotations);

	//
}
