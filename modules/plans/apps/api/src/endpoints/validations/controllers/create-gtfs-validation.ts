/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type CreateGtfsValidationDto, type GtfsAgency, type GtfsFeedInfo, type GtfsValidation, PermissionCatalog } from '@tmlmobilidade/types';
import { createWriteStream } from 'fs';
import { readFileSync, unlinkSync } from 'node:fs';
import { finished } from 'node:stream/promises';
import { tmpdir } from 'os';
import { join } from 'path';

/**
 * Creates a new GTFS Validation from multipart form data.
 * @param request Fastify request containing Validation data and operation Validation file in multipart form.
 * @param reply Fastify reply
 */
export async function createGtfsValidation(request: FastifyRequest, reply: FastifyReply<unknown>) {
	//

	const requestData = await request.file();
	if (!requestData) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'No file provided');

	const hasPermissionCreateValidation = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.gtfs_validations.actions.create,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.gtfs_validations.scope,
		value: requestData.fields.agency_id['value'],
	});

	if (!hasPermissionCreateValidation) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: create validation');

	const validationData: CreateGtfsValidationDto = {
		agency_id: requestData.fields.agency_id['value'] as string,
		created_by: request.me._id,
		file_id: '',
		gtfs_agency: JSON.parse(requestData.fields.gtfs_agency['value'] as string) as GtfsAgency,
		gtfs_feed_info: JSON.parse(requestData.fields.gtfs_feed_info['value'] as string) as GtfsFeedInfo,
		is_locked: false,
		notification_sent: false,
		processing_status: 'waiting',
		validation_attempts: 0,
		validity_status: 'unknown',
	};

	const tempFilePath = join(tmpdir(), `validation-upload-${Date.now()}-${Math.random().toString(36).substring(7)}`);

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

	const insertValidationResult = await goDb.operation.gtfsValidations.insertOne(validationData);

	//
	// Upload the GTFS file, then attach it to the validation.
	// Failure modes (handled by storage saga + hooks):
	// - upload fails → saga compensates blob/metadata; onRollback deletes the validation
	// - validation update fails → onSuccess throws → onRollback deletes the validation → saga compensates the upload

	let finalValidationData: GtfsValidation | null = null;

	try {
		await storageProvider.upload(
			buffer,
			{
				created_by: request.me.email,
				name: requestData.filename,
				resource_id: insertValidationResult._id.toString(),
				scope: 'gtfsValidations',
				size: size,
				type: requestData.mimetype,
				updated_by: request.me.email,
			},
			{
				onRollback: async () => {
					await goDb.operation.gtfsValidations.deleteById(insertValidationResult._id);
					finalValidationData = null;
				},
				onSuccess: async (_ctx, result) => {
					finalValidationData = await goDb.operation.gtfsValidations.updateById(
						insertValidationResult._id,
						{ file_id: result._id },
					);
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

	return reply.send({ data: finalValidationData, error: null, statusCode: HTTP_STATUS.OK });
}
