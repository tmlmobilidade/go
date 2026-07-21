/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { PermissionCatalog, type Plan } from '@tmlmobilidade/types';

/**
 * Deletes an apex file by plan ID
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function deleteApexFile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Plan>) {
	//

	if (!request.params?.id) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing Plan ID in request params.');

	const foundPlan = await goDb.operation.plans.findById(request.params.id);

	if (!foundPlan) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found.');

	//
	// Check if the user has permission to delete an apex file

	if (!PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.delete_apex_file,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: foundPlan.gtfs_agency.agency_id,
	})) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: delete plan');
	}

	//
	// Fetch the file associated with the plan

	const foundFileData = await storageProvider.findById(foundPlan.apex_file_id);

	if (!foundFileData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan APEX file not found');

	let updatedPlan: null | Plan = null;
	await storageProvider.delete(foundFileData._id, {
		onRollback: async (_, error) => {
			await goDb.operation.plans.updateById(request.params.id, { apex_file_id: foundPlan.apex_file_id });
			throw error;
		},
		onSuccess: async () => {
			updatedPlan = await goDb.operation.plans.updateById(request.params.id, { apex_file_id: null });
		},
	});

	//
	// Update the plan to remove the apex file ID

	reply.send({ data: updatedPlan, error: null, statusCode: HTTP_STATUS.OK });
}
