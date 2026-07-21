/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Download the APEX file associated with a plan by ID.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function downloadApexFile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<string>) {
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
		value: planData.gtfs_agency.agency_id,
	});

	if (!hasPermissionReadPlan) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: read plan');

	//
	// Fetch the file associated with the plan

	const foundFileData = await storageProvider.findById(planData.apex_file_id);

	if (!foundFileData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan APEX file not found');

	//
	// Stream the file in the given URL to the client

	const storageServiceResponse = await fetch(foundFileData.url);

	if (!storageServiceResponse.ok || !storageServiceResponse.body) {
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Could not fetch file');
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
