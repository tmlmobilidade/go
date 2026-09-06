/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { Attachment } from '@tmlmobilidade/go-types-core';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves the operation GTFS normalized file associated with a plan by ID
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function getOperationGtfsNormalizedHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Attachment>) {
	//

	//
	// Get the Plan from the database

	const planData = await goDb.operation.plans.findById(request.params.id);

	if (!planData) {
		return sendErrorApiResponse(reply, {
			error: `Plan with ID ${request.params.id} not found`,
			status_code: '404',
		});
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
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to perform this action: read plan',
			status_code: '403',
		});
	}

	//
	// Fetch the attachment associated with the plan

	const foundAttachmentData = await storageProvider.findById(planData.attachments.operation_gtfs_normalized);

	if (!foundAttachmentData) {
		return sendErrorApiResponse(reply, {
			error: 'Plan operation GTFS normalized attachment not found',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, foundAttachmentData);

	//
}
