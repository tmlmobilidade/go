/* * */

import { MultipartValue } from '@fastify/multipart';
import { rabbitMQ } from '@tmlmobilidade/connectors';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { sendPlanApprovalRequestEmail } from '@go/emails';
import { files, gtfsValidations, TransactionManager } from '@go/interfaces';
import { ALLOW_ALL_FLAG, getAppConfig, HttpException, HttpStatus, Permissions } from '@go/lib';
import { Agency, type CreateGtfsValidationDto, type File as FileType, type GtfsAgency, type GtfsFeedInfo, type GtfsValidation, type GtfsValidationPermission, type Permission } from '@go/types';
import { fetchData, getPermission, hasAPIResourcePermission } from '@go/utils';
import { createWriteStream } from 'fs';
import { readFileSync, unlinkSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { tmpdir } from 'os';
import { join } from 'path';

/* * */

export class GtfsValidationsController {
	//

	/**
	 * Creates a new Validation
	 * @param request Fastify request containing Validation data and operation Validation file in multipart form
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest, reply: FastifyReply<unknown>) {
		const data = await request.file();

		if (!data) {
			throw new HttpException(HttpStatus.BAD_REQUEST, 'No file provided');
		}

		const fields = data.fields as Record<string, MultipartValue>;

		//

		//
		// Check if the user has permission to create a plan
		if (!hasAPIResourcePermission<GtfsValidationPermission>(request, {
			action: Permissions.validations.actions.create,
			resource_key: 'agency_ids',
			scope: Permissions.validations.scope,
			value: fields['agency_id'].value,
		})) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action');
		}

		//

		// Convert form fields to Validation data
		const validationData: CreateGtfsValidationDto = {
			feeder_status: 'waiting',
			file_id: '',
			gtfs_agency: JSON.parse(fields.gtfs_agency.value as string) as GtfsAgency,
			gtfs_feed_info: JSON.parse(fields.gtfs_feed_info.value as string) as GtfsFeedInfo,
			notification_sent: false,
		};

		// Stream file to temporary disk location to avoid OOM, then upload
		let buffer: Buffer;
		let size: number;
		let tempFilePath: null | string = null;

		try {
			// Create temporary file path
			tempFilePath = join(tmpdir(), `validation-upload-${Date.now()}-${Math.random().toString(36).substring(7)}`);

			// Stream directly to disk to avoid memory issues
			const writeStream = createWriteStream(tempFilePath);
			await pipeline(data.file, writeStream);

			// Read file back as buffer for upload
			buffer = readFileSync(tempFilePath);
			size = buffer.length;
		}
		catch (streamError) {
			throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Error processing file stream', { cause: streamError });
		}

		const transactionManager = new TransactionManager([gtfsValidations, files] as const);

		// Start transaction
		const result = await transactionManager.withTransaction(async (collections, transactions) => {
			const [gtfsValidationsCollection, filesCollection] = collections;

			// Get the appropriate transaction for each collection
			const gtfsValidationsTransaction = transactions.get(gtfsValidationsCollection);
			const filesTransaction = transactions.get(filesCollection);

			// 1. Create the Validation
			const ValidationResult = await gtfsValidationsCollection.insertOne(validationData, { options: { session: gtfsValidationsTransaction.getSession() } });

			// 2. Upload the operation Validation file
			const fileResult = await filesCollection.upload(buffer, {
				created_by: request.me.email,
				name: data.filename,
				resource_id: ValidationResult._id.toString(),
				scope: 'gtfsValidations',
				size: size,
				type: data.mimetype,
				updated_by: request.me.email,
			}, { session: filesTransaction.getSession() });

			// 3. Update the Validation with the file reference
			await gtfsValidationsCollection.updateById(ValidationResult._id, { file_id: fileResult._id }, { session: gtfsValidationsTransaction.getSession() });

			await rabbitMQ.publish(
				'gtfs-validation',
				JSON.stringify({
					file_id: fileResult._id,
					validation_id: ValidationResult._id,
				}),
				{ persistent: true },
			);

			return {
				...ValidationResult,
				file_id: fileResult._id,
			};
		});

		// Clean up temporary file
		if (tempFilePath) {
			try {
				unlinkSync(tempFilePath);
			}
			catch (cleanupError) {
				console.warn('Failed to cleanup temporary file:', tempFilePath, cleanupError);
			}
		}

		return reply.send({ data: result, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Retrieves all gtfsValidations, sorted by creation date descending
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<GtfsValidation[]>) {
		//

		//
		// Extract permissions from the request

		const GtfsvalidationPermission: Permission<GtfsValidationPermission> = getPermission(request.permissions, Permissions.validations.scope, Permissions.validations.actions.read);

		//
		// Filter gtfsValidations based on permissions for the current user

		if (GtfsvalidationPermission?.resource) {
			const filters = {
				...(GtfsvalidationPermission.resource.agency_ids && !GtfsvalidationPermission.resource.agency_ids.includes(ALLOW_ALL_FLAG) && { 'gtfs_agency.agency_id': { $in: GtfsvalidationPermission.resource.agency_ids } }),
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
	static async getById(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply<GtfsValidation>,
	) {
		const { id } = request.params;

		const Validation = await gtfsValidations.findById(id);

		if (!Validation) {
			throw new HttpException(HttpStatus.NOT_FOUND, 'Validation not found');
		}

		//

		//
		// Check if the user has permission to read the validation
		if (!hasAPIResourcePermission<GtfsValidationPermission>(request, {
			action: Permissions.validations.actions.read,
			resource_key: 'agency_ids',
			scope: Permissions.validations.scope,
			value: Validation.gtfs_agency.agency_id,
		})) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action');
		}

		//
		reply.send({ data: Validation, error: null, statusCode: HttpStatus.OK });
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
		if (!hasAPIResourcePermission<GtfsValidationPermission>(request, {
			action: Permissions.validations.actions.read,
			resource_key: 'agency_ids',
			scope: Permissions.validations.scope,
			value: Validation.gtfs_agency.agency_id,
		})) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action');
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

		if (validationData.notification_sent) {
			throw new HttpException(HttpStatus.BAD_REQUEST, 'Notification has already been sent');
		}

		//
		// Check if the user has permission to request approval for this Validation

		const hasPermissionRequestApproval = hasAPIResourcePermission<GtfsValidationPermission>(request, {
			action: Permissions.validations.actions.request_approval,
			resource_key: 'agency_ids',
			scope: Permissions.validations.scope,
			value: validationData.gtfs_agency.agency_id,
		});

		if (!hasPermissionRequestApproval) throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action');

		//
		// Get the TML contact emails for this Agency

		const agencyData = await fetchData<Agency>(getAppConfig('auth', 'frontend_url') + '/api/agencies/' + validationData.gtfs_agency.agency_id, 'GET', undefined, {
			Cookie: `session_token=${request.cookies.session_token}`,
		});

		if (!agencyData?.data || agencyData?.error) {
			throw new HttpException(agencyData.statusCode, agencyData.error);
		}

		//
		// Send the approval request email

		await sendPlanApprovalRequestEmail({
			props: {
				solicited_by: request.me.first_name + ' ' + request.me.last_name,
				validation: validationData,
			},
			to: agencyData.data.contact_emails_pta || [],
		});

		//
		// Update the Validation document and send it to caller

		const updatedValidation = await gtfsValidations.updateById(validationData._id, { notification_sent: true });

		reply.send({ data: updatedValidation, error: null, statusCode: HttpStatus.OK });

		//
	}
}
