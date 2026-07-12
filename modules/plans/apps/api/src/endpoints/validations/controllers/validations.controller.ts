/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { sendPlanApprovalRequestEmail } from '@tmlmobilidade/emails';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { agencies, files, type Filter, gtfsValidations, TransactionManager } from '@tmlmobilidade/interfaces';
import { type CreateGtfsValidationDto, type File as FileType, type GtfsAgency, type GtfsFeedInfo, type GtfsValidation, PermissionCatalog, type ProcessingStatus } from '@tmlmobilidade/types';
import { createWriteStream } from 'fs';
import { readFileSync, unlinkSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { tmpdir } from 'os';
import { join } from 'path';

/* * */

export class GtfsValidationsController {
	//

	/**
	 * Creates a new GTFS Validation from multipart form data.
	 * @param request Fastify request containing Validation data and operation Validation file in multipart form.
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest, reply: FastifyReply<unknown>) {
		//

		//
		// Parse multipart form data from the request

		const requestData = await request.file();

		if (!requestData) {
			throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'No file provided');
		}

		//
		// Check if the user has permission to create a new GTFS Validation

		const hasPermissionCreateValidation = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.gtfs_validations.actions.create,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.gtfs_validations.scope,
			value: requestData.fields.agency_id['value'],
		});

		if (!hasPermissionCreateValidation) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: create validation');
		}

		//
		// Convert form fields to Validation data

		const validationData: CreateGtfsValidationDto = {
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

	/**
		 * Download the operation file associated with a plan by ID.
		 * @param request The request object.
		 * @param reply The reply object.
		 */
	static async downloadFile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<string>) {
		// Get the Validation from the database
		const foundValidation = await gtfsValidations.findById(request.params.id);
		if (!foundValidation) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Validation not found');
		}

		// Check if the user has permission to read the Validation
		const hasPermissionReadValidation = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.gtfs_validations.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.gtfs_validations.scope,
			value: foundValidation.gtfs_agency.agency_id,
		});
		if (!hasPermissionReadValidation) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: read validation file');
		}

		// Fetch the file associated with the validation
		const foundFileData = await files.findById(foundValidation.file_id);
		if (!foundFileData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Validation file not found');
		}

		// Stream the file in the given URL to the client
		const storageServiceResponse = await fetch(foundFileData.url);
		if (!storageServiceResponse.ok || !storageServiceResponse.body) {
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Could not fetch file');
		}

		// Set headers and pipe the response body to the client
		reply.header('Content-Disposition', `attachment; filename="${foundFileData.name}"`);
		reply.header('Content-Type', 'application/zip');
		// Set content length if available
		const contentLength = storageServiceResponse.headers.get('Content-Length');
		if (contentLength) reply.header('Content-Length', contentLength);
		// Pipe the response body to the client
		return reply.send(storageServiceResponse.body);
	}

	/**
	 * Retrieves all GTFS Validation objects, filtered
	 * by user permissions and sorted by creation date.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<GtfsValidation[]>) {
		//

		//
		// Get the resource permissions for
		// GTFS Validations for the current user.

		const userGtfsValidationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.gtfs_validations.scope, PermissionCatalog.all.gtfs_validations.actions.read);

		//
		// If specific agency permissions are set,
		// setup the database filters accordingly.

		const queryFilters: Filter<GtfsValidation> = {};

		//
		// If agency IDs are specified and do not include the ALLOW_ALL_FLAG,
		// filter validations by those agency IDs.

		if ('resources' in userGtfsValidationPermissions && 'agency_ids' in userGtfsValidationPermissions.resources) {
			if (!userGtfsValidationPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
				queryFilters['gtfs_agency.agency_id'] = { $in: userGtfsValidationPermissions.resources['agency_ids'] };
			}
		}

		if ('resources' in userGtfsValidationPermissions) {
			const filters = {
				...(userGtfsValidationPermissions.resources['agency_ids'] && !userGtfsValidationPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG) && { 'gtfs_agency.agency_id': { $in: userGtfsValidationPermissions.resources['agency_ids'] } }),
			};

			const filteredgtfsValidations = await gtfsValidations.findMany(filters, { sort: { created_at: -1 } });

			return reply.send({ data: filteredgtfsValidations, error: null, statusCode: HTTP_STATUS.OK });
		}

		//
		// If no specific permissions are set, return all gtfsValidations

		const allgtfsValidations = await gtfsValidations.findMany({}, { sort: { created_at: -1 } });

		return reply.send({ data: allgtfsValidations, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Retrieves a single Validation by ID
	 * @param request Fastify request containing Validation ID in params
	 * @param reply Fastify reply
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<GtfsValidation>) {
		//

		//
		// Get the requested validation data

		const foundValidation = await gtfsValidations.findById(request.params.id);
		if (!foundValidation) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Validation not found');
		}

		//
		// Check if the user has permission to read the validation

		if (!PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.gtfs_validations.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.gtfs_validations.scope,
			value: foundValidation.gtfs_agency.agency_id,
		})) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: read validation');
		}

		//
		// Return the found Validation

		reply.send({ data: foundValidation, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves the file for a Validation by ID
	 * @param request Fastify request containing Validation ID in params
	 * @param reply Fastify reply
	 */
	static async getFile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<FileType>) {
		// Get the requested Validation data
		const foundValidation = await gtfsValidations.findById(request.params.id);
		if (!foundValidation) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Validation not found');
		}

		// Check if the user has permission to read the validation
		const hasPermissionReadValidation = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.gtfs_validations.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.gtfs_validations.scope,
			value: foundValidation.gtfs_agency.agency_id,
		});
		if (!hasPermissionReadValidation) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: read validation file');
		}

		//

		const foundFile = await files.findById(foundValidation.file_id);
		if (!foundFile) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File not found');
		}
		reply.send({ data: foundFile, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Toggles the lock status of a GTFS Validation by ID.
	 * @param request Fastify request containing GTFS Validation ID in params.
	 * @param reply Fastify reply.
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<GtfsValidation>) {
		// Get the Validation from the database
		const validationData = await gtfsValidations.findById(request.params.id);
		if (!validationData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Validation not found');
		}

		// Check if the user has permission to toggle lock the Validation
		const hasPermissionLockValidation = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.gtfs_validations.actions.lock,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.gtfs_validations.scope,
			value: validationData.gtfs_agency.agency_id,
		});
		if (!hasPermissionLockValidation) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: toggle lock validation');
		}

		// If authorized, toggle the lock status of the validation
		await gtfsValidations.toggleLockById(request.params.id);
		const foundValidation = await gtfsValidations.findById(request.params.id);
		if (!foundValidation) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Validation not found');
		}

		reply.send({ data: foundValidation, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Requests approval for a Validation by ID
	 * @param request Fastify request containing Validation ID in params
	 * @param reply Fastify reply
	 */
	static async requestApproval(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<GtfsValidation>) {
		//

		//
		// Get the requested Validation data

		const validationData = await gtfsValidations.findById(request.params.id);

		if (!validationData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Validation not found');
		}

		//
		// Check if the notification has already been sent

		if (validationData.notification_sent) {
			throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Notification has already been sent');
		}

		//
		// Check if the user has permission to request approval for this Validation

		const hasPermissionRequestApproval = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.gtfs_validations.actions.request_approval,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.gtfs_validations.scope,
			value: validationData.gtfs_agency.agency_id,
		});

		if (!hasPermissionRequestApproval) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: request approval');
		}

		//
		// Get the TML contact emails for this Agency

		const agencyData = await agencies.findById(validationData.gtfs_agency.agency_id);

		if (!agencyData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Agency not found');
		}

		//
		// Send the approval request email

		await sendPlanApprovalRequestEmail({
			data: {
				agencyName: validationData.gtfs_agency.agency_name,
				endDate: validationData.gtfs_feed_info.feed_end_date,
				firstName: request.me.first_name,
				gtfsValidationId: validationData._id,
				gtfsValidationUrl: `${process.env.FRONTEND_URL}/validations/${validationData._id.toString()}`,
				requestedBy: request.me.first_name + ' ' + request.me.last_name,
				startDate: validationData.gtfs_feed_info.feed_start_date,
			},
			to: agencyData.contact_emails_pta || [],
		});

		//
		// Update the Validation document and send it to caller

		const updatedValidation = await gtfsValidations.updateById(validationData._id, { notification_sent: true });

		reply.send({ data: updatedValidation, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	static async updateProcessingStatus(request: FastifyRequest<{ Body: { processing_status: ProcessingStatus }, Params: { id: string } }>, reply: FastifyReply<GtfsValidation>) {
		//

		//
		// Get the requested Validation data

		const gtfsValidationData = await gtfsValidations.findById(request.params.id);

		if (!gtfsValidationData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'GTFS Validation not found');
		}

		//
		// Check if the user has permission to change the status of the Validation

		const hasPermissionChangeStatus = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.gtfs_validations.actions.update_processing_status,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.gtfs_validations.scope,
			value: gtfsValidationData.gtfs_agency.agency_id,
		});

		if (!hasPermissionChangeStatus) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: change status validation');
		}

		//
		// Update the Validation document and send it to caller

		const updatedGtfsValidation = await gtfsValidations.updateById(gtfsValidationData._id, {
			processing_status: request.body.processing_status ?? 'error',
			validation_attempts: 0,
			validity_status: 'unknown',
		});

		reply.send({ data: updatedGtfsValidation, error: null, statusCode: HTTP_STATUS.OK });

		//
	}
}
