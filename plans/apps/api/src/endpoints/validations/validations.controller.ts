/* * */

import { MultipartValue } from '@fastify/multipart';
import { rabbitMQ } from '@tmlmobilidade/connectors';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { files, TransactionManager, validations } from '@tmlmobilidade/interfaces';
import { ALLOW_ALL_FLAG, HttpException, HttpStatus, Permissions } from '@tmlmobilidade/lib';
import { type CreateValidationDto, type File as FileType, type GtfsAgency, type GtfsFeedInfo, type Permission, type Validation, type ValidationPermission } from '@tmlmobilidade/types';
import { hasAPIResourcePermission } from '@tmlmobilidade/utils';
import { createWriteStream } from 'fs';
import { readFile, unlink } from 'fs/promises';
import { pipeline } from 'node:stream/promises';
import { tmpdir } from 'os';
import { join } from 'path';

/* * */

export class ValidationsController {
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
		if (!hasAPIResourcePermission<ValidationPermission>(request, {
			action: Permissions.validations.actions.create,
			resource_key: 'agency_ids',
			scope: Permissions.validations.scope,
			value: fields['agency_id'].value,
		})) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action');
		}

		//

		// Convert form fields to Validation data
		const validationData: CreateValidationDto = {
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
			buffer = await readFile(tempFilePath);
			size = buffer.length;
		}
		catch (streamError) {
			throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Error processing file stream', { cause: streamError });
		}

		const transactionManager = new TransactionManager([validations, files] as const);

		// Start transaction
		const result = await transactionManager.withTransaction(async (collections, transactions) => {
			const [validationsCollection, filesCollection] = collections;

			// Get the appropriate transaction for each collection
			const validationsTransaction = transactions.get(validationsCollection);
			const filesTransaction = transactions.get(filesCollection);

			// 1. Create the Validation
			const ValidationResult = await validationsCollection.insertOne(validationData, { options: { session: validationsTransaction.getSession() } });

			// 2. Upload the operation Validation file
			const fileResult = await filesCollection.upload(buffer, {
				created_by: request.me.email,
				name: data.filename,
				resource_id: ValidationResult._id.toString(),
				scope: 'validations',
				size: size,
				type: data.mimetype,
				updated_by: request.me.email,
			}, { session: filesTransaction.getSession() });

			// 3. Update the Validation with the file reference
			await validationsCollection.updateById(ValidationResult._id, { file_id: fileResult._id }, { session: validationsTransaction.getSession() });

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
				await unlink(tempFilePath);
			}
			catch (cleanupError) {
				console.warn('Failed to cleanup temporary file:', tempFilePath, cleanupError);
			}
		}

		return reply.send({ data: result, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Retrieves all Validations, sorted by creation date descending
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Validation[]>) {
		const permissions = request.permissions as Permission<ValidationPermission>;

		// Filter validations by all keys
		if (permissions?.resource) {
			const filters = {
				...(permissions.resource.agency_ids && !permissions.resource.agency_ids.includes(ALLOW_ALL_FLAG) && { 'gtfs_agency.agency_id': { $in: permissions.resource.agency_ids } }),
			};

			console.log(filters);

			const filteredValidations = await validations.findMany(
				filters,
				{ sort: { created_at: -1 } },
			);

			return reply.send({ data: filteredValidations, error: null, statusCode: HttpStatus.OK });
		}

		// Send all validations
		const allValidations = await validations.findMany({}, { sort: { created_at: -1 } });
		return reply.send({ data: allValidations, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Retrieves a single Validation by ID
	 * @param request Fastify request containing Validation ID in params
	 * @param reply Fastify reply
	 */
	static async getById(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply<Validation>,
	) {
		const { id } = request.params;

		const Validation = await validations.findById(id);

		if (!Validation) {
			throw new HttpException(HttpStatus.NOT_FOUND, 'Validation not found');
		}

		//

		//
		// Check if the user has permission to read the validation
		if (!hasAPIResourcePermission<ValidationPermission>(request, {
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
		const Validation = await validations.findById(id);

		if (!Validation) {
			reply.status(HttpStatus.NOT_FOUND).send({ message: 'Validation not found' });
			return;
		}

		//

		//
		// Check if the user has permission to read the validation
		if (!hasAPIResourcePermission<ValidationPermission>(request, {
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

	//
}
