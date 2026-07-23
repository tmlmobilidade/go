/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { PermissionCatalog, type Plan, type UpdatePlanDto } from '@tmlmobilidade/types';
import { createWriteStream } from 'fs';
import { readFileSync, unlinkSync } from 'node:fs';
import { finished } from 'node:stream/promises';
import { tmpdir } from 'os';
import { join } from 'path';

/**
 * Updates the APEX file of an existing plan by ID
 * @param request Fastify request containing plan ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateApexFile(request: FastifyRequest<{ Body: UpdatePlanDto & { apex_file?: File }, Params: { id: string } }>, reply: FastifyReply<Plan>) {
	//

	const foundPlan = await goDb.operation.plans.findById(request.params.id);
	if (!foundPlan) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');

	const hasPermissionReadPlan = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.update_apex_file,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: foundPlan.agency_id,
	});

	if (!hasPermissionReadPlan) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update this plan.');

	const requestData = await request.file();
	if (!requestData) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'No file provided');

	let updatedPlanData: null | Plan = null;
	const originalApexFileId = foundPlan.apex_file_id;
	const tempFilePath = join(tmpdir(), `apex-file-upload-${Date.now()}-${Math.random().toString(36).substring(7)}`);

	let buffer: Buffer;
	let size: number;

	try {
		const writeStream = createWriteStream(tempFilePath);
		requestData.file.pipe(writeStream);
		await finished(writeStream);
		buffer = readFileSync(tempFilePath);
		size = buffer.length;
	} catch (streamError) {
		try {
			unlinkSync(tempFilePath);
		} catch (cleanupError) {
			console.warn('Failed to cleanup temporary file:', tempFilePath, cleanupError);
		}
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error processing file stream', { cause: streamError });
	}

	try {
		//
		// Upload the new APEX file, point the plan at it, then drop the previous one.
		// Failure modes (handled by storage saga + hooks):
		// - upload fails → saga compensates blob/metadata; plan untouched
		// - plan update fails → onSuccess throws → saga compensates the upload
		// - old-file delete fails → onSuccess throws → onRollback restores plan → saga compensates the upload

		await storageProvider.upload(
			buffer,
			{
				created_by: request.me._id,
				name: requestData.filename,
				resource_id: foundPlan._id.toString(),
				scope: PermissionCatalog.all.plans.scope,
				size: size,
				type: requestData.mimetype,
				updated_by: request.me.email,
			},
			{
				onRollback: async () => {
					if (!updatedPlanData) return;
					await goDb.operation.plans.updateById(foundPlan._id, {
						apex_file_id: originalApexFileId,
					});
					updatedPlanData = null;
				},
				onSuccess: async (_ctx, result) => {
					updatedPlanData = await goDb.operation.plans.updateById(
						foundPlan._id,
						{ apex_file_id: result._id },
					);

					if (originalApexFileId) {
						await storageProvider.delete(originalApexFileId);
					}
				},
			},
		);
	} finally {
		try {
			unlinkSync(tempFilePath);
		} catch (cleanupError) {
			console.warn('Failed to cleanup temporary file:', tempFilePath, cleanupError);
		}
	}

	reply.send({
		data: updatedPlanData,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
