/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { files, organizations } from '@tmlmobilidade/interfaces';
import { HttpException, HttpStatus } from '@tmlmobilidade/lib';
import { type Organization, UpdateOrganizationDto, UpdateOrganizationSchema } from '@tmlmobilidade/types';

/* * */

export class OrganizationsController {
	/**
	 * Create a new organization - Inserts a new organization into the database
	 * @param {FastifyRequest} request - The request object containing the organization data in the body
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async create(request: FastifyRequest<{ Body: Omit<Organization, '_id' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by'> }>, reply: FastifyReply<Organization>) {
		const result = await organizations.insertOne(request.body);

		// Send the created alert with a 201 status code
		reply.send({ data: result, error: null, statusCode: HttpStatus.CREATED }).status(HttpStatus.CREATED);
	}

	/**
	 * Delete an organization logo - Deletes an organization logo from the database
	 * @param {FastifyRequest} request - The request object containing the organization ID in the params
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async deleteImage(request: FastifyRequest<{ Params: { id: string, theme: 'dark' | 'light' } }>, reply: FastifyReply<void>) {
		const { id, theme } = request.params;

		const organization = await organizations.findById(id);

		if (!organization) {
			reply.status(HttpStatus.NOT_FOUND).send({ message: 'Organization not found' });
			return;
		}

		const logoField = theme === 'dark' ? organization.logo_dark : organization.logo_light;

		if (!logoField) {
			reply.status(HttpStatus.NOT_FOUND).send({ message: `Logo not found for theme: ${theme}` });
			return;
		}
		await files.deleteById(logoField);

		const updateField = theme === 'dark' ? { logo_dark: null } : { logo_light: null };

		await organizations.updateById(id, updateField);

		reply.send({ data: undefined, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Returns all Organizations sorted by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Organization[]>) {
		const allOrganizations = await organizations.findMany({}, { sort: { _id: 1 } });
		for (const org of allOrganizations) {
			org.logo_dark = org.logo_dark ? (await files.findById(org.logo_dark))?.url : undefined;
			org.logo_light = org.logo_light ? (await files.findById(org.logo_light))?.url : undefined;
		}

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

		organizationData.logo_dark = organizationData.logo_dark ? (await files.findById(organizationData.logo_dark))?.url : undefined;
		organizationData.logo_light = organizationData.logo_light ? (await files.findById(organizationData.logo_light))?.url : undefined;

		reply.send({ data: organizationData, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Get an organization image - Retrieves an organization image from the database
	 * @param {FastifyRequest} request - The request object containing the organization ID in the params
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async getImage(request: FastifyRequest<{ Params: { id: string, theme: 'dark' | 'light' } }>, reply: FastifyReply<string>) {
		const { id, theme } = request.params;

		const organization = await organizations.findById(id);

		if (!organization) {
			throw new HttpException(HttpStatus.NOT_FOUND, 'Organization not found');
		}

		const logoField = theme === 'dark' ? organization.logo_dark : organization.logo_light;

		if (!logoField) {
			throw new HttpException(HttpStatus.NOT_FOUND, `Logo not found for theme: ${theme}`);
		}

		const file = await files.findById(logoField);

		if (!file) {
			throw new HttpException(HttpStatus.NOT_FOUND, 'File not found');
		}

		reply.send({ data: file.url, error: null, statusCode: HttpStatus.OK });
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
	 * Upload organization logos - Uploads organization logos to the database
	 * @param {FastifyRequest} request - The request object containing the organization ID in the params and the image files in the body
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async uploadImage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<{ logo_dark?: string, logo_light?: string }>) {
		const { id } = request.params;

		const organization = await organizations.findById(id);

		if (!organization) {
			throw new HttpException(HttpStatus.NOT_FOUND, 'Organization not found');
		}

		const updateFields: Partial<{ logo_dark: string, logo_light: string }> = {};
		const uploadedFiles: { logo_dark?: string, logo_light?: string } = {};

		// Process all uploaded files
		for await (const file of request.files()) {
			const buffer = await file.toBuffer();
			const size = buffer.buffer.byteLength;

			const result = await files.upload(buffer, {
				created_by: request.me._id,
				name: file.filename,
				resource_id: id,
				scope: 'organizations',
				size: size,
				type: file.mimetype,
				updated_by: request.me._id,
			});

			// Determine which logo to update based on fieldname
			if (file.fieldname === 'dark') {
				// Delete old dark logo if it exists
				if (organization.logo_dark) {
					try {
						await files.deleteById(organization.logo_dark);
					}
					catch (error) {
						console.error('Error deleting old dark logo:', error);
					}
				}
				updateFields.logo_dark = result._id;
				uploadedFiles.logo_dark = result._id;
			}
			else if (file.fieldname === 'light') {
				// Delete old light logo if it exists
				if (organization.logo_light) {
					try {
						await files.deleteById(organization.logo_light);
					}
					catch (error) {
						console.error('Error deleting old light logo:', error);
					}
				}
				updateFields.logo_light = result._id;
				uploadedFiles.logo_light = result._id;
			}
		}

		if (Object.keys(updateFields).length === 0) {
			throw new HttpException(HttpStatus.BAD_REQUEST, 'No valid files provided');
		}

		// Update organization with new logo IDs
		await organizations.updateById(id, updateFields);

		reply.send({ data: uploadedFiles, error: null, statusCode: HttpStatus.OK });
	}

	//
}
