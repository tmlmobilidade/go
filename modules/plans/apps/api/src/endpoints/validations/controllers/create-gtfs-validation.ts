/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { files, gtfsValidations, TransactionManager } from '@tmlmobilidade/interfaces';
import { type CreateGtfsValidationDto, type GtfsAgency, type GtfsFeedInfo, PermissionCatalog } from '@tmlmobilidade/types';
import { createWriteStream } from 'fs';
import { readFileSync, unlinkSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { tmpdir } from 'os';
import { join } from 'path';

/**
 * Creates a new GTFS Validation from multipart form data.
 * @param request Fastify request containing Validation data and operation Validation file in multipart form.
 * @param reply Fastify reply
 */
export async function createGtfsValidation(request: FastifyRequest, reply: FastifyReply<unknown>) {
	//

	//
	// Parse multipart form data from the request

	const requestData = await request.file();

	if (!requestData) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'No file provided');

	//
	// Check if the user has permission to create a new GTFS Validation

	const hasPermissionCreateValidation = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.gtfs_validations.actions.create,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.gtfs_validations.scope,
		value: requestData.fields.agency_id['value'],
	});

	if (!hasPermissionCreateValidation) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: create validation');

	//
	// Convert form fields to Validation data

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

	//
	// Stream file to temporary disk location
	// to avoid Out Of Memory issues with large files

	let buffer: Buffer;
	let size: number;
	let tempFilePath: null | string = null;

	try {
		// Create temporary file path
		tempFilePath = join(tmpdir(), `validation-upload-${Date.now()}-${Math.random().toString(36).substring(7)}`);
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
	// across multiple collections (Validation creation and file upload).

	const transactionManager = new TransactionManager([gtfsValidations, files] as const);

	const result = await transactionManager.withTransaction(async (collections, transactions) => {
		//

		//
		// Destructure collections for easier access
		// and get the appropriate transaction for each collection

		const [gtfsValidationsCollection, filesCollection] = collections;
		const gtfsValidationsTransaction = transactions.get(gtfsValidationsCollection);

		const filesTransaction = transactions.get(filesCollection);

		//
		// Insert the new Validation document

		const insertValidationResult = await gtfsValidationsCollection.insertOne(validationData, { options: { session: gtfsValidationsTransaction.getSession() } });

		//
		// Upload the operation Validation file

		const uploadFileResult = await filesCollection.upload(buffer, {
			created_by: request.me.email,
			name: requestData.filename,
			resource_id: insertValidationResult._id.toString(),
			scope: 'gtfsValidations',
			size: size,
			type: requestData.mimetype,
			updated_by: request.me.email,
		}, { session: filesTransaction.getSession() });

		//
		// Update the Validation with the file reference

		await gtfsValidationsCollection.updateById(insertValidationResult._id, { file_id: uploadFileResult._id }, { session: gtfsValidationsTransaction.getSession() });

		//
		// Return the complete Validation object

		return {
			...insertValidationResult,
			file_id: uploadFileResult._id,
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
	// Return the created Validation

	return reply.send({ data: result, error: null, statusCode: HTTP_STATUS.OK });

	//
}
