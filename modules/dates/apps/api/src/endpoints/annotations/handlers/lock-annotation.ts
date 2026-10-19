/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Annotation } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of an annotation by ID
 * @param request Fastify request containing annotation ID in params
 * @param reply Fastify reply
 */
export async function lockAnnotationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Annotation>) {
	//

	//
	// Get the Annotation from the database

	const annotationData = await goDb.offer.annotations.findById(request.params.id);

	if (!annotationData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Annotation not found');
	}

	//
	// Get the resource permissions for annotations for the current user.

	const userAnnotationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.lock);

	//
	// If no permission found, deny access

	if (!userAnnotationPermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to lock/unlock annotations');
	}

	//
	// Validate that user has permission for ALL of this annotation's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.annotations.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.annotations.scope,
		value: annotationData.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: toggle lock annotation. You must have permission for all agencies involved.');
	}

	// If authorized, toggle the lock status of the annotation
	await goDb.offer.annotations.updateOne({ _id: request.params.id }, { is_locked: !annotationData?.is_locked });
	const foundAnnotation = await goDb.offer.annotations.findById(request.params.id);
	if (!foundAnnotation) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Annotation not found');
	}
	return reply.send({ data: foundAnnotation, error: null, statusCode: HTTP_STATUS.OK });

	//
}
