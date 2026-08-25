/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Download the operation file associated with a plan by ID.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function downloadOperationFile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<string>) {
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
	// Fetch the file associated with the plan

	const foundFileData = await storageProvider.findById(planData.operation_file_id);

	if (!foundFileData) {
		return sendErrorApiResponse(reply, {
			error: 'Plan operation file not found',
			status_code: '404',
		});
	}

	//
	// Stream the file in the given URL to the client

	const storageServiceResponse = await fetch(foundFileData.url);

	if (!storageServiceResponse.ok || !storageServiceResponse.body) {
		return sendErrorApiResponse(reply, {
			error: 'Could not fetch file',
			status_code: '500',
		});
	}

	//
	// Set headers and pipe the response body to the client

	reply.header('Content-Disposition', `attachment; filename="${foundFileData.name}"`);
	reply.header('Content-Type', 'application/zip');

	//
	// Set content length if available

	const contentLength = storageServiceResponse.headers.get('Content-Length');
	if (contentLength) reply.header('Content-Length', contentLength);

	//
	// Pipe the response body to the client

	return reply.send(storageServiceResponse.body);
}
