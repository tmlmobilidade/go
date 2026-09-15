/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Annotation } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Returns all Annotations the current user is allowed to read.
 * @param request The request object
 * @param reply The reply object
 */
export async function listAnnotationsHandler(request: FastifyRequest, reply: FastifyReply<Annotation[]>) {
	//

	//
	// Get the resource permissions for annotations for the current user

	const userAnnotationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.read);

	if (!userAnnotationPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read annotations',
			status_code: '403',
		});
	}

	//
	// Build the query filters based on the user permissions.
	// If the agency IDs in the resources do not include the ALLOW_ALL_FLAG,
	// filter the annotations by those agency IDs.

	const queryFilters: Filter<Annotation> = {};

	if ('resources' in userAnnotationPermissions && 'agency_ids' in userAnnotationPermissions.resources) {
		if (!userAnnotationPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			queryFilters.agency_ids = { $in: userAnnotationPermissions.resources['agency_ids'] };
		}
	}

	//
	// Fetch the annotations matching the query filters

	const foundAnnotations = await goDb.offer.annotations.findMany(queryFilters);

	return sendSuccessApiResponse(reply, foundAnnotations);
}
