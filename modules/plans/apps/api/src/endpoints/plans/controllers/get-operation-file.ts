/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { Attachment, PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Retrieves the operation file associated with a plan by ID
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function getOperationFile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Attachment>) {
	//

	//
	// Get the Plan from the database

	const planData = await goDb.operation.plans.findById(request.params.id);

	if (!planData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');
	}

	//
	// Check if the user has permission to read the Plan

	const hasPermissionReadPlan = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: planData.agency_id,
	});

	if (!hasPermissionReadPlan) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: read plan');
	}

	//
	// Fetch the file associated with the plan

	const fileData = await storageProvider.findById(planData.operation_file_id);

	if (!fileData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan operation file not found');
	}

	return reply.send({
		data: fileData,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});

	//
}
