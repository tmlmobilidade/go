import { MultipartValue } from '@fastify/multipart';
import { rabbitMQ } from '@tmlmobilidade/connectors';
import { files, TransactionManager, validations } from '@tmlmobilidade/interfaces';
import { HttpStatus } from '@tmlmobilidade/lib';
import { CreateValidationDto, GtfsAgency, GtfsFeedInfo, Permission, Validation, ValidationPermission } from '@tmlmobilidade/types';
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * This is an example controller that is using the Validations interface.
 */
export class ValidationsController {
	/**
	 * Creates a new Validation
	 * @param request Fastify request containing Validation data and operation Validation file in multipart form
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest, reply: FastifyReply) {
		try {
			const data = await request.file();

			if (!data) {
				reply.status(HttpStatus.BAD_REQUEST).send({ message: 'No file provided' });
				return;
			}

			const fields = data.fields as Record<string, MultipartValue>;

			// Convert form fields to Validation data
			const ValidationData: CreateValidationDto = {
				feeder_status: fields.feeder_status.value as 'error' | 'processing' | 'success' | 'waiting',
				file_id: '',
				gtfs_agency: JSON.parse(fields.gtfs_agency.value as string) as GtfsAgency,
				gtfs_feed_info: JSON.parse(fields.gtfs_feed_info.value as string) as GtfsFeedInfo,
			};

			const buffer = await data.toBuffer();
			const size = buffer.buffer.byteLength;

			const transactionManager = new TransactionManager([validations, files]);

			// Start transaction
			const result = await transactionManager.withTransaction(async (collections, transactions) => {
				const [validationsCollection, filesCollection] = collections;

				// Get the appropriate transaction for each collection
				const validationsTransaction = transactions.get(validationsCollection);
				const filesTransaction = transactions.get(filesCollection);

				// 1. Create the Validation
				const ValidationResult = await validationsCollection.insertOne(ValidationData, { options: { session: validationsTransaction.getSession() } });

				// 2. Upload the operation Validation file
				const fileResult = await (filesCollection as typeof files).upload(buffer, {
					created_by: 'system', // TODO: Change to user id
					name: data.filename,
					resource_id: ValidationResult.insertedId.toString(),
					scope: 'validations',
					size: size,
					type: data.mimetype,
					updated_by: 'system', // TODO: Change to user id
				}, { session: filesTransaction.getSession() });

				// 3. Update the Validation with the file reference
				await validationsCollection.updateById(ValidationResult.insertedId.toString(), {
					file_id: fileResult.insertedId.toString(),
				} as Partial<Validation>, { session: validationsTransaction.getSession() });

				await rabbitMQ.publish(
					'gtfs-validation',
					JSON.stringify({
						file_id: fileResult.insertedId.toString(),
						validation_id: ValidationResult.insertedId.toString(),
					}),
					{ persistent: true },
				);

				return {
					...ValidationResult,
					file_id: fileResult.insertedId.toString(),
				};
			});

			reply.send({
				data: result,
				message: 'Validation created with operation Validation file',
			});
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Deletes an Validation by ID
	 * @param request Fastify request containing Validation ID in params
	 * @param reply Fastify reply
	 */
	static async delete(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		try {
			const { id } = request.params;
			await validations.deleteById(id);

			reply.send({ message: `Validation with id: ${id} deleted` });
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Retrieves all Validations, sorted by creation date descending
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply) {
		try {
			const permissions = request.permissions as Permission<ValidationPermission>;

			// Filter validations by all keys
			if (permissions?.resource) {
				const filters = {
					...(permissions.resource.agency_ids && { 'gtfs_agency.agency_id': { $in: permissions.resource.agency_ids } }),
				};

				console.log(filters);

				const filteredValidations = await validations.findMany(
					filters,
					undefined,
					undefined,
					{ created_at: -1 },
				);

				return reply.send(filteredValidations);
			}

			// Send all validations
			return reply.send(await validations.findMany({}, undefined, undefined, { created_at: -1 }));
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Retrieves a single Validation by ID
	 * @param request Fastify request containing Validation ID in params
	 * @param reply Fastify reply
	 */
	static async getById(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		try {
			const { id } = request.params;

			const Validation = await validations.findById(id);

			if (!Validation) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Validation not found' });
				return;
			}

			reply.send(Validation);
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Retrieves the file for a Validation by ID
	 * @param request Fastify request containing Validation ID in params
	 * @param reply Fastify reply
	 */
	static async getFile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			const { id } = request.params;
			const Validation = await validations.findById(id);

			if (!Validation) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Validation not found' });
				return;
			}

			const file = await files.findById(Validation.file_id);

			if (!file) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'File not found' });
				return;
			}

			reply.send(file);
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Updates an existing Validation by ID
	 * @param request Fastify request containing Validation ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		try {
			const { id } = request.params;
			const ValidationData = request.body as Partial<Validation>;

			await validations.updateById(id, ValidationData);

			reply.send({
				data: ValidationData,
				message: `Validation with id: ${id} updated`,
			});
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}
}
