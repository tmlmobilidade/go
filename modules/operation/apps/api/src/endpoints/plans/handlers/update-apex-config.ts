/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { Plan } from '@tmlmobilidade/go-types-operation';
import { UpdatePlanDto } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { createWriteStream } from 'fs';
import fs from 'node:fs';
import path from 'node:path';
import { finished } from 'node:stream/promises';

/**
 * Updates the APEX config of an existing plan by ID
 * @param request Fastify request containing plan ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateApexConfigHandler(request: FastifyRequest<{ Body: UpdatePlanDto & { apex_file?: File }, Params: { id: string } }>, reply: FastifyReply<Plan>) {
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
	// Check if the user has permission to update the plan

	const hasPermissionReadPlan = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.update_apex_file,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: foundPlan.agency_id,
	});

	if (!hasPermissionReadPlan) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update this plan.',
			status_code: '403',
		});
	}

	//
	// Get the APEX config file from the request

	const requestData = await request.file();

	if (!requestData) {
		return sendErrorApiResponse(reply, {
			error: 'No file provided in the request body.',
			status_code: '400',
		});
	}

	//
	// Setup the temporary file path and buffer,
	// and store the file in the temporary directory.

	const temporaryDirectory = fs.mkdtempDisposableSync('apex-config-upload-');
	const temporaryFilePath = path.join(temporaryDirectory.path, 'apex-config.zip');

	const writeStream = createWriteStream(temporaryFilePath);

	requestData.file.pipe(writeStream);

	await finished(writeStream);

	const fileBuffer = fs.readFileSync(temporaryFilePath);

	//
	// Upload the new APEX file and atomically point the plan at it in the
	// same MongoDB transaction. Drop the previous file only after commit.

	await storageProvider.upload(
		fileBuffer,
		{
			created_by: request.me._id,
			name: requestData.filename,
			resource_id: foundPlan._id,
			scope: 'plans',
			size: fileBuffer.length,
			type: requestData.mimetype,
			updated_by: request.me.email,
		},
		{
			onSuccess: async (_, attachment, session) => {
				const plansCollection = await goDb.operation.plans.getCollection();
				await plansCollection.updateOne(
					{ _id: foundPlan._id },
					{ $set: { 'attachments.apex_config': attachment._id } },
					{ session },
				);
			},
		},
	);

	//
	// Cleanup the temporary directory and get the updated plan data

	temporaryDirectory.remove();

	const updatedPlanData = await goDb.operation.plans.findById(foundPlan._id);

	return sendSuccessApiResponse(reply, updatedPlanData);
}
