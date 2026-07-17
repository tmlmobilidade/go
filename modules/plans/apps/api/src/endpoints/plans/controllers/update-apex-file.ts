/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { files, plans, TransactionManager } from '@tmlmobilidade/interfaces';
import { PermissionCatalog, type Plan, type UpdatePlanDto } from '@tmlmobilidade/types';
import { createWriteStream } from 'fs';
import { readFileSync, unlinkSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { tmpdir } from 'os';
import { join } from 'path';

/**
 * Updates the APEX file of an existing plan by ID
 * @param request Fastify request containing plan ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateApexFile(request: FastifyRequest<{ Body: UpdatePlanDto & { apex_file?: File }, Params: { id: string } }>, reply: FastifyReply<Plan>) {
	//

	//
	// Get the Plan from the database

	const foundPlan = await plans.findById(request.params.id);

	if (!foundPlan) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');

	//
	// Check if the user has permission to update the Plan

	const hasPermissionReadPlan = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.update_apex_file,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: foundPlan.gtfs_agency.agency_id,
	});

	if (!hasPermissionReadPlan) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update this plan.');

	//
	// Parse multipart form data from the request

	const requestData = await request.file();

	if (!requestData) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'No file provided');

	//
	// Stream file to temporary disk location
	// to avoid Out Of Memory issues with large files

	let buffer: Buffer;
	let size: number;
	let tempFilePath: null | string = null;

	try {
		// Create temporary file path
		tempFilePath = join(tmpdir(), `apex-file-upload-${Date.now()}-${Math.random().toString(36).substring(7)}`);
		// Stream directly to disk to avoid memory issues
		const writeStream = createWriteStream(tempFilePath);
		await pipeline(requestData.file, writeStream);
		// Read file back as buffer for upload
		buffer = readFileSync(tempFilePath);
		size = buffer.length;
	} catch (streamError) {
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error processing file stream', { cause: streamError });
	}

	//
	// Use Transaction Manager to ensure data consistency
	// across multiple collections (Plan update and file upload).

	const transactionManager = new TransactionManager([plans, files] as const);

	await transactionManager.withTransaction(async (collections, transactions) => {
		//

		//
		// Destructure collections for easier access
		// and get the appropriate transaction for each collection

		const [plansCollection, filesCollection] = collections;

		const plansTransaction = transactions.get(plansCollection);
		const filesTransaction = transactions.get(filesCollection);

		//
		// Upload the APEX file

		const uploadFileResult = await filesCollection.upload(buffer, {
			created_by: request.me.email,
			name: requestData.filename,
			resource_id: foundPlan._id,
			scope: 'plans',
			size: size,
			type: requestData.mimetype,
			updated_by: request.me.email,
		}, { session: filesTransaction.getSession() });

		//
		// Update the Plan with the APEX file reference

		await plansCollection.updateById(foundPlan._id, { apex_file_id: uploadFileResult._id }, { session: plansTransaction.getSession() });

		//
		// Return the complete Plan object

		return {
			...foundPlan,
			apex_file_id: uploadFileResult._id,
		};

		//
	});

	//
	// Clean up temporary file

	if (tempFilePath) {
		try {
			unlinkSync(tempFilePath);
		} catch (cleanupError) {
			console.warn('Failed to cleanup temporary file:', tempFilePath, cleanupError);
		}
	}

	//
	// Re-fetch the plan data to get the updated data

	const updatedPlanData = await plans.findById(request.params.id);

	if (!updatedPlanData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');

	//
	// Send the updated plan data as the response

	reply.send({
		data: updatedPlanData,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});

	//
}
