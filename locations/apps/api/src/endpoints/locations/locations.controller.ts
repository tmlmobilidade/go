import { localities, municipalities, parishes } from '@tmlmobilidade/interfaces';
import { HttpStatus } from '@tmlmobilidade/lib';
import { Locality, Municipality, Parish } from '@tmlmobilidade/types';
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * This is an example controller that is using the alerts interface.
 */
export class LocationsController {
	/**
	 * Retrieves all localities, sorted by creation date descending
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAllLocalities(request: FastifyRequest, reply: FastifyReply) {
		try {
			reply.send(await localities.findMany({}, undefined, undefined, { created_at: -1 }));
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Retrieves all municipalities, sorted by creation date descending
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAllMunicipalities(request: FastifyRequest, reply: FastifyReply) {
		try {
			reply.send(await municipalities.findMany({}, undefined, undefined, { created_at: -1 }));
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Retrieves all parishes, sorted by creation date descending
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAllParishes(request: FastifyRequest, reply: FastifyReply) {
		try {
			reply.send(await parishes.findMany({}, undefined, undefined, { created_at: -1 }));
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Retrieves a single locality by ID
	 * @param request Fastify request containing alert ID in params
	 * @param reply Fastify reply
	 */
	static async getLocalityById(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		try {
			const { id } = request.params;

			const locality = await localities.findById(id);

			if (!locality) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Alert not found' });
				return;
			}

			reply.send(locality);
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Retrieves a single municipality by ID
	 * @param request Fastify request containing alert ID in params
	 * @param reply Fastify reply
	 */
	static async getMunicipalityById(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		try {
			const { id } = request.params;

			const municipality = await municipalities.findById(id);

			if (!municipality) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Alert not found' });
				return;
			}

			reply.send(municipality);
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Retrieves a single parish by ID
	 * @param request Fastify request containing alert ID in params
	 * @param reply Fastify reply
	 */
	static async getParishById(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		try {
			const { id } = request.params;

			const parish = await parishes.findById(id);

			if (!parish) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Alert not found' });
				return;
			}

			reply.send(parish);
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}
}
