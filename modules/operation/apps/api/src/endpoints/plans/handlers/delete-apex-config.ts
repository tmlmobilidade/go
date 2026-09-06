/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { Plan } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Deletes an apex config by plan ID
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function deleteApexConfigHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Plan>) {
	//

	//
	// Check if the plan exists

	const foundPlan = await goDb.operation.plans.findById(request.params.id);

	if (!foundPlan) {
		return sendErrorApiResponse(reply, {
			error: `Plan with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	//
	// Check if the user has permission to delete an apex config

	if (!PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.delete_apex_file,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: foundPlan.agency_id,
	})) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to perform this action: delete plan',
			status_code: '403',
		});
	}

	//
	// Fetch the attachment associated with the plan

	const foundAttachmentData = await storageProvider.findById(foundPlan.attachments.apex_config);

	if (!foundAttachmentData) {
		return sendErrorApiResponse(reply, {
			error: 'Plan APEX config not found',
			status_code: '404',
		});
	}

	await storageProvider.delete(foundAttachmentData._id, {
		onRollback: async (_, error) => {
			const plansCollection = await goDb.operation.plans.getCollection();
			await plansCollection.updateOne({ _id: request.params.id }, {
				$set: {
					'attachments.apex_config': foundPlan.attachments.apex_config,
				},
			});
			throw error;
		},
		onSuccess: async () => {
			const plansCollection = await goDb.operation.plans.getCollection();
			await plansCollection.updateOne({ _id: request.params.id }, {
				$set: {
					'attachments.apex_config': null,
				},
			});
		},
	});

	//
	// Return the success response

	const updatedPlan = await goDb.operation.plans.findById(request.params.id);

	return sendSuccessApiResponse(reply, updatedPlan);
}
