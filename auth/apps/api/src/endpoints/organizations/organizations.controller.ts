/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { organizations } from '@tmlmobilidade/interfaces';
import { HttpException, HttpStatus } from '@tmlmobilidade/lib';
import { type Organization, UpdateOrganizationDto, UpdateOrganizationSchema } from '@tmlmobilidade/types';

/* * */

export class OrganizationsController {
	//

	/**
	 * Returns all Organizations sorted by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Organization[]>) {
		const allOrganizations = await organizations.findMany({}, { sort: { _id: 1 } });
		reply.send({ data: allOrganizations, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Returns an Organization by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Organization>) {
		const organizationData = await organizations.findById(request.params.id);
		if (!organizationData) throw new HttpException(HttpStatus.NOT_FOUND, 'Organization not found');
		reply.send({ data: organizationData, error: null, statusCode: HttpStatus.OK });
	}

	/**
	* Updates an Organization in the database
	* @param request The request object
	* @param reply The reply object
	*/
	static async update(request: FastifyRequest<{ Body: UpdateOrganizationDto, Params: { id: string } }>, reply: FastifyReply<Organization>) {
		const validatedOrganization = UpdateOrganizationSchema.strip().safeParse(request.body);
		if (!validatedOrganization.success) throw new HttpException(HttpStatus.BAD_REQUEST, 'Dados inválidos', validatedOrganization.error);

		//
		// Set the updated_by field to the current user's id
		request.body.updated_by = request.me._id;

		//
		const updatedOrganizationData = await organizations.updateById(request.params.id, validatedOrganization.data);
		reply.send({ data: updatedOrganizationData, error: null, statusCode: HttpStatus.OK });
	}

	//
}
