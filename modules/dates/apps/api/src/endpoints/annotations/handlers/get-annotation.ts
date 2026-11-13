/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Annotation } from '@tmlmobilidade/go-types-dates';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves a single annotation by ID
 * @param request Fastify request containing annotation ID in params
 * @param reply Fastify reply
 */
export async function getAnnotationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Annotation>) {
	//

	//
	// Get the Annotation from the database

	const annotationData = await goDb.dates.annotations.findById(request.params.id);

	if (!annotationData) {
		return sendErrorApiResponse(reply, {
			error: 'Annotation not found',
			status_code: '404',
		});
	}

	//
	// Unassigned annotations are readable by every authenticated user. Assigned
	// annotations require read access to every affected agency.

	const access = PermissionCatalog.getPermissionResourceAccess<string>({
		checks: [{ action: PermissionCatalog.all.annotations.actions.read, scope: PermissionCatalog.all.annotations.scope }],
		permissions: request.permissions,
		resource_key: 'agency_ids',
	});

	if (!access.allowAll && (annotationData.agency_ids ?? []).some(id => !access.values.includes(id))) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read this annotation',
			status_code: '403',
		});
	}

	//
	// Fetch the annotation data

	return sendSuccessApiResponse(reply, annotationData);

	//
}
