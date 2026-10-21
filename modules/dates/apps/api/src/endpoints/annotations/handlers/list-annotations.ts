/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
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
	// Get the resource permissions for annotations for the current user.

	const userAnnotationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.read);

	//
	// If no permission found, deny access

	if (!userAnnotationPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read annotations',
			status_code: '403',
		});
	}

	//
	// Build database query filters based on user permissions

	const queryFilters: Filter<Annotation> = {};

	//
	// If agency IDs are specified in resources and do not include the ALLOW_ALL_FLAG,
	// filter annotations by those agency IDs.

	if ('resources' in userAnnotationPermissions && 'agency_ids' in userAnnotationPermissions.resources) {
		if (!userAnnotationPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			queryFilters.agency_ids = { $in: userAnnotationPermissions.resources['agency_ids'] };
		}
	}

	//
	// Fetch annotations based on query filters

	const allAnnotations = await goDb.offer.annotations.findMany(queryFilters);

	return sendSuccessApiResponse(reply, allAnnotations);

	//
}
