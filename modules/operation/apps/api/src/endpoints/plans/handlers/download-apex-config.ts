/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Download the APEX configuration file associated with a plan by ID.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function downloadApexConfigHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<string>) {
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

	const foundAttachmentData = await storageProvider.findById(planData.attachments.apex_config);

	if (!foundAttachmentData) {
		return sendErrorApiResponse(reply, {
			error: 'Plan APEX configuration attachment not found',
			status_code: '404',
		});
	}

	//
	// Stream the attachment in the given URL to the client

	const storageServiceResponse = await fetch(foundAttachmentData.url);

	if (!storageServiceResponse.ok || !storageServiceResponse.body) {
		return sendErrorApiResponse(reply, {
			error: 'Could not fetch file',
			status_code: '500',
		});
	}

	//
	// Set headers and pipe the response body to the client

	reply.header('Content-Type', 'application/zip');
	reply.header('Content-Disposition', `attachment; filename="${foundAttachmentData.name}"`);

	//
	// Set content length if available

	const contentLength = storageServiceResponse.headers.get('Content-Length');

	if (contentLength) reply.header('Content-Length', contentLength);

	//
	// Pipe the response body to the client

	return reply.send(storageServiceResponse.body);
}
