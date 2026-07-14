/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDB } from '@tmlmobilidade/go-interfaces-go-db';
import { files } from '@tmlmobilidade/interfaces';
import { type File as FileType, PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Retrieves the APEX file associated with a plan by ID
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function getApexFile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<FileType>) {
	//

	//
	// Get the Plan from the database

	const planData = await goDB.operation.plans.findById(request.params.id);

	if (!planData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');

	//
	// Check if the user has permission to read the Plan

	const hasPermissionReadPlan = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.read_apex_file,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: planData.gtfs_agency.agency_id,
	});

	if (!hasPermissionReadPlan) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: read plan');

	//
	// Check if there is an APEX file associated with the plan

	if (!planData.apex_file_id) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'No APEX file associated with this plan');

	//
	// Fetch the file associated with the plan

	const foundFileData = await files.findById(planData.apex_file_id);

	if (!foundFileData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'APEX file not found for this plan');

	//
	// Return the file

	reply.send({
		data: foundFileData,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
