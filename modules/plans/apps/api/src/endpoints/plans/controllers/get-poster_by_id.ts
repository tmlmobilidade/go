/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type Attachment, PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Retrieves the posters file associated with a plan by ID
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function getPosterById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Attachment>) {
	//

	//
	// Get the Plan from the database

	const planData = await goDb.operation.plans.findById(request.params.id);

	if (!planData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');

	//
	// Check if the user has permission to read the Plan

	const hasPermissionReadPlan = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: planData.agency_id,
	});

	if (!hasPermissionReadPlan) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: read plan');

	//
	// Check if there is a posters file associated with the plan

	const postersFileId = planData.apps?.posters?.file_id;

	if (!postersFileId) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'No posters file associated with this plan');

	//
	// Fetch the file associated with the plan

	const foundFileData = await storageProvider.findById(postersFileId);

	if (!foundFileData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Posters file not found for this plan');

	//
	// Return the file

	reply.send({
		data: foundFileData,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
