/* * */

import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { sendPlanApprovalRequestEmail } from '@tmlmobilidade/emails';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { agencies, files, Filter, gtfsValidations, TransactionManager } from '@tmlmobilidade/interfaces';
// import { rabbitMQ } from '@tmlmobilidade/rabbitmq';
import { type CreateGtfsValidationDto, type File as FileType, type GtfsAgency, type GtfsFeedInfo, type GtfsValidation, PermissionCatalog } from '@tmlmobilidade/types';
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

		if (!requestData) throw new HttpException(HttpStatus.BAD_REQUEST, 'No file provided');

		//
		// Check if the user has permission to create a new GTFS Validation

		const hasPermissionCreateValidation = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.gtfs_validations.actions.create,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.gtfs_validations.scope,
			value: requestData.fields.agency_id['value'],
		});

		if (!hasPermissionCreateValidation) throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action: create validation');

		//
		// Convert form fields to Validation data

		const validationData: CreateGtfsValidationDto = {
			feeder_status: 'waiting',
			file_id: '',
			gtfs_agency: JSON.parse(requestData.fields.gtfs_agency['value'] as string) as GtfsAgency,
			gtfs_feed_info: JSON.parse(requestData.fields.gtfs_feed_info['value'] as string) as GtfsFeedInfo,
			notification_sent: false,
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
		}
		catch (streamError) {
			throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Error processing file stream', { cause: streamError });
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
			// Publish a message to RabbitMQ for asynchronous processing

			// await rabbitMQ.publish('gtfs-validation', JSON.stringify({
			// 	file_id: uploadFileResult._id,
			// 	validation_id: insertValidationResult._id,
			// }), { persistent: true });

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
			}
			catch (cleanupError) {
				console.warn('Failed to cleanup temporary file:', tempFilePath, cleanupError);
			}
		}

		//
		// Return the created Validation

		return reply.send({ data: result, error: null, statusCode: HttpStatus.OK });

		//
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

			return reply.send({ data: filteredgtfsValidations, error: null, statusCode: HttpStatus.OK });
		}

		//
		// If no specific permissions are set, return all gtfsValidations

		const allgtfsValidations = await gtfsValidations.findMany({}, { sort: { created_at: -1 } });

		return reply.send({ data: allgtfsValidations, error: null, statusCode: HttpStatus.OK });

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
		if (!foundValidation) throw new HttpException(HttpStatus.NOT_FOUND, 'Validation not found');

		//
		// Check if the user has permission to read the validation

		if (!PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.gtfs_validations.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.gtfs_validations.scope,
			value: foundValidation.gtfs_agency.agency_id,
		})) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action: read validation');
		}

		//
		// Return the found Validation

		reply.send({ data: foundValidation, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Retrieves the file for a Validation by ID
	 * @param request Fastify request containing Validation ID in params
	 * @param reply Fastify reply
	 */
	static async getFile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<FileType>) {
		const { id } = request.params;
		const Validation = await gtfsValidations.findById(id);

		if (!Validation) {
			reply.status(HttpStatus.NOT_FOUND).send({ message: 'Validation not found' });
			return;
		}

		//

		//
		// Check if the user has permission to read the validation
		if (!PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.gtfs_validations.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.gtfs_validations.scope,
			value: Validation.gtfs_agency.agency_id,
		})) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action: read validation file');
		}

		//
		const file = await files.findById(Validation.file_id);

		if (!file) {
			throw new HttpException(HttpStatus.NOT_FOUND, 'File not found');
		}

		reply.send({ data: file, error: null, statusCode: HttpStatus.OK });
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

		if (!validationData) throw new HttpException(HttpStatus.NOT_FOUND, 'Validation not found');

		//
		// Check if the notification has already been sent

		if (validationData.notification_sent) throw new HttpException(HttpStatus.BAD_REQUEST, 'Notification has already been sent');

		//
		// Check if the user has permission to request approval for this Validation

		const hasPermissionRequestApproval = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.gtfs_validations.actions.request_approval,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.gtfs_validations.scope,
			value: validationData.gtfs_agency.agency_id,
		});

		if (!hasPermissionRequestApproval) throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action: request approval');

		//
		// Get the TML contact emails for this Agency

		const agencyData = await agencies.findById(validationData.gtfs_agency.agency_id);

		if (!agencyData) {
			throw new HttpException(HttpStatus.NOT_FOUND, 'Agency not found');
		}

		//
		// Send the approval request email

		await sendPlanApprovalRequestEmail({
			props: {
				solicited_by: request.me.first_name + ' ' + request.me.last_name,
				validation: validationData,
			},
			to: agencyData.contact_emails_pta || [],
		});

		//
		// Update the Validation document and send it to caller

		const updatedValidation = await gtfsValidations.updateById(validationData._id, { notification_sent: true });

		reply.send({ data: updatedValidation, error: null, statusCode: HttpStatus.OK });

		//
	}
}
