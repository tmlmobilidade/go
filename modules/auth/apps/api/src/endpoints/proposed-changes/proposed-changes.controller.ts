/* eslint-disable @typescript-eslint/no-explicit-any */
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { enrichUserRefs, proposedChanges } from '@tmlmobilidade/interfaces';
import { ProposedChange, UpdateProposedChangeDto } from '@tmlmobilidade/types';

/**
 * This is an example controller that is using the proposed changes interface.
 */
export class ProposedChangesController {
	/**
	 * Creates a new Proposed Change
	 * @param request Fastify request containing Proposed Change data in body
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest, reply: FastifyReply<ProposedChange<any>>) {
		const data = request.body as ProposedChange<any>;
		const result = await proposedChanges.insertOne({ ...data, created_by: request.me._id, updated_by: request.me._id });

		reply.send({ data: result, error: null, statusCode: HTTP_STATUS.CREATED });
	}

	/**
	 * Deletes an Proposed Change by ID
	 * @param request Fastify request containing Proposed Change ID in params
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;
		await proposedChanges.deleteById(id);

		reply.send({ data: null, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves all proposed changes, sorted by creation date descending
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<ProposedChange<any>[]>) {
		const data = await proposedChanges.findMany({}, {
			sort: { created_at: -1 },
		});

		reply.send({ data: await enrichUserRefs(data), error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves a single Proposed Change by ID
	 * @param request Fastify request containing Proposed Change ID in params
	 * @param reply Fastify reply
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<ProposedChange<any>>) {
		const { id } = request.params;
		const proposedChange = await proposedChanges.findById(id);

		if (!proposedChange) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Proposed Change not found');

		reply.send({ data: await enrichUserRefs(proposedChange), error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Updates an existing Proposed Change by ID
	 * @param request Fastify request containing Proposed Change ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdateProposedChangeDto<any>, Params: { id: string } }>, reply: FastifyReply<ProposedChange<any>>) {
		const { id } = request.params;
		const data = await proposedChanges.updateById(id, request.body);

		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}
}
