/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Deletes an plan by ID
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function deletePlan(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	//

	//
	// Check if the plan ID is provided

	if (!request.params?.id) {
		return sendErrorApiResponse(reply, {
			error: 'Missing Plan ID in request params.',
			status_code: '400',
		});
	}

	const foundPlan = await goDb.operation.plans.findById(request.params.id);

	//
	// Check if the plan exists

	if (!foundPlan) {
		return sendErrorApiResponse(reply, {
			error: `Plan with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	//
	// Check if have permissions to delete the plan

	const hasPermissionDeletePlan = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.delete,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: foundPlan.agency_id,
	});

	if (!hasPermissionDeletePlan) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to delete this plan.',
			status_code: '403',
		});
	}

	//
	// Actually delete the plan

	await storageProvider.delete(foundPlan.operation_file_id, {
		onRollback: async (_, error) => {
			throw error;
		},
		onSuccess: async () => {
			await goDb.operation.plans.deleteById(request.params.id);
		},
	});

	//
	// Return the success response

	return sendSuccessApiResponse(reply, undefined);
}
