/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { Attachment } from '@tmlmobilidade/go-types-core';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves the APEX file associated with a plan by ID
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function getApexFileHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Attachment>) {
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
		action: PermissionCatalog.all.plans.actions.read_apex_file,
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
	// Check if there is an APEX file associated with the plan

	if (!planData.apex_file_id) {
		return sendErrorApiResponse(reply, {
			error: 'No APEX file associated with this plan',
			status_code: '404',
		});
	}

	//
	// Fetch the file associated with the plan

	const foundFileData = await storageProvider.findById(planData.apex_file_id);

	if (!foundFileData) {
		return sendErrorApiResponse(reply, {
			error: 'APEX file not found for this plan',
			status_code: '404',
		});
	}

	//
	// Return the file

	return sendSuccessApiResponse(reply, foundFileData);
}
