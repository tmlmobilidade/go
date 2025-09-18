/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { files, organizations } from '@tmlmobilidade/interfaces';
import { HttpException, HttpStatus } from '@tmlmobilidade/lib';
import { type Organization, UpdateOrganizationDto, UpdateOrganizationSchema } from '@tmlmobilidade/types';

/* * */

export class OrganizationsController {
	//

	/**
	 * Delete an organization logo - Deletes an organization logo from the database
	 * @param {FastifyRequest} request - The request object containing the organization ID in the params
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async deleteImage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;

		const organization = await organizations.findById(id);

		if (!organization) {
			reply.status(HttpStatus.NOT_FOUND).send({ message: 'Organization not found' });
			return;
		}

		if (!organization.logo) {
			reply.status(HttpStatus.NOT_FOUND).send({ message: 'Image not found' });
			return;
		}

		await files.deleteById(organization.logo);
		await organizations.updateById(id, { logo: undefined });

		reply.send({ data: undefined, error: null, statusCode: HttpStatus.OK });
	}

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

	/**
	 * Upload an organization logo - Uploads an organization logo to the database
	 * @param {FastifyRequest} request - The request object containing the organization ID in the params and the image file in the body
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async uploadImage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<string>) {
		const { id } = request.params;

		const organization = await organizations.findById(id);

		if (!organization) throw new HttpException(HttpStatus.NOT_FOUND, 'Organization not found');

		const data = await request.file();

		if (!data) throw new HttpException(HttpStatus.NOT_FOUND, 'File not found');

		const buffer = await data.toBuffer();
		const size = buffer.buffer.byteLength;

		const result = await files.upload(buffer, {
			created_by: request.me._id,
			name: data.filename,
			resource_id: id,
			scope: 'alerts',
			size: size,
			type: data.mimetype,
			updated_by: request.me._id,
		});

		// Delete the old image if it exists
		if (organization.logo) {
			try {
				await files.deleteById(organization.logo);
			}
			catch (error) {
				console.error(error);
			}
		}

		await organizations.updateById(id, { logo: result.url });

		reply.send({ data: result.url, error: null, statusCode: HttpStatus.OK });
	}

	//
}
