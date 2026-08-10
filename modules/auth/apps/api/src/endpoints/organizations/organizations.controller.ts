/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { CreateOrganizationSchema, type Organization, type UpdateOrganizationDto, UpdateOrganizationSchema } from '@tmlmobilidade/types';

/* * */

function isStorageNotFoundError(error: unknown) {
	return error instanceof Error && (error.name === 'NotFoundError' || ('code' in error && error.code === 'STORAGE_NOT_FOUND'));
}

async function deleteReplacedLogo(logoId: null | string, replacementId: string) {
	if (!logoId) return;

	try {
		await storageProvider.delete(logoId);
	} catch (error) {
		if (isStorageNotFoundError(error)) return;
		await storageProvider.delete(replacementId).catch(() => {});
		throw error;
	}
}

async function getLogoUrl(logoId: null | string) {
	if (!logoId) return null;

	try {
		return (await storageProvider.findById(logoId))?.url ?? null;
	} catch (error) {
		if (isStorageNotFoundError(error)) return null;
		throw error;
	}
}

export class OrganizationsController {
	//

	/**
	 * Inserts a new organization into the database.
	 * @param request The request object containing the organization data in the body.
	 * @param reply The reply object used to send the response.
	 */
	static async create(request: FastifyRequest<{ Body: Omit<Organization, '_id' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by'> }>, reply: FastifyReply<Organization>) {
		// Validate the request body
		const validatedOrganization = CreateOrganizationSchema.safeParse(request.body);
		if (!validatedOrganization.success) {
			throw new HttpException(HTTP_STATUS.BAD_REQUEST, validatedOrganization.error.message);
		}
		// Set the updated_by field to the current user's id
		validatedOrganization.data.updated_by = request.me._id;
		// Update the organization in the database
		const result = await goDb.core.organizations.insertOne(validatedOrganization.data);
		reply.send({ data: result, error: null, statusCode: HTTP_STATUS.CREATED }).status(HTTP_STATUS.CREATED);
	}

	/**
	 * Deletes an Organization from the database.
	 * @param request The request object containing the organization ID in the params.
	 * @param reply The reply object used to send the response.
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		// Find the organization by ID
		const organization = await goDb.core.organizations.findById(request.params.id);
		if (!organization) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Organization not found');
		}
		// Delete associated logo files if they exist
		if (organization.logo_dark) {
			await storageProvider.delete(organization.logo_dark);
		}
		if (organization.logo_light) {
			await storageProvider.delete(organization.logo_light);
		}
		// Delete the organization from the database
		await goDb.core.organizations.deleteById(request.params.id);
		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Delete an organization logo from the database and storage.
	 * @param request The request object containing the organization ID in the params.
	 * @param reply The reply object used to send the response.
	 */
	static async deleteImage(request: FastifyRequest<{ Params: { id: string, theme: 'dark' | 'light' } }>, reply: FastifyReply<void>) {
		// Find the organization by ID
		const organization = await goDb.core.organizations.findById(request.params.id);
		if (!organization) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Organization not found');
		}

		// Determine which logo to delete based on theme
		const logoField = request.params.theme === 'dark' ? organization.logo_dark : organization.logo_light;
		if (!logoField) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, `Logo not found for theme: ${request.params.theme}`);
		}

		// Delete the logo file from storage
		await storageProvider.delete(logoField);
		// Update the organization to remove the logo reference
		const updatedField = request.params.theme === 'dark' ? { logo_dark: null } : { logo_light: null };
		await goDb.core.organizations.updateById(request.params.id, updatedField);
		// Send the response
		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns all Organizations sorted by ID.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Organization[]>) {
		const allOrganizations = await goDb.core.organizations.findMany({}, { sort: { _id: 1 } });
		reply.send({ data: allOrganizations, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns an Organization by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Organization>) {
		const organizationData = await goDb.core.organizations.findById(request.params.id);
		if (!organizationData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Organization not found');
		}
		reply.send({ data: organizationData, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Gets organization logo from the database.
	 * @param request The request object containing the organization ID in the params.
	 * @param reply The reply object used to send the response.
	 */
	static async getLogo(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<{ logo_dark?: string, logo_light?: string }>) {
		// Find the organization by ID
		const organization = await goDb.core.organizations.findById(request.params.id);
		if (!organization) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Organization not found');
		}
		// Fetch logo files if they exist. A stale database ID should not block the detail page.
		const logoDark = await getLogoUrl(organization.logo_dark);
		const logoLight = await getLogoUrl(organization.logo_light);
		// Send the response with logo URLs
		reply.send({ data: { logo_dark: logoDark, logo_light: logoLight }, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Toggles the lock status of an organization by ID.
	 * @param request Fastify request containing organization ID in params.
	 * @param reply Fastify reply.
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Organization>) {
		await goDb.core.organizations.toggleLockById(request.params.id);
		const foundOrganization = await goDb.core.organizations.findById(request.params.id);
		if (!foundOrganization) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Organization not found');
		}
		reply.send({ data: foundOrganization, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Updates an Organization in the database.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async update(request: FastifyRequest<{ Body: UpdateOrganizationDto, Params: { id: string } }>, reply: FastifyReply<Organization>) {
		// Validate the request body
		const validatedOrganization = UpdateOrganizationSchema.safeParse(request.body);
		if (!validatedOrganization.success) {
			throw new HttpException(HTTP_STATUS.BAD_REQUEST, validatedOrganization.error.message);
		}
		// Set the updated_by field to the current user's id
		request.body.updated_by = request.me._id;
		// Update the organization in the database
		const updatedOrganizationData = await goDb.core.organizations.updateById(request.params.id, validatedOrganization.data);
		reply.send({ data: updatedOrganizationData, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Upload organization logos - Uploads organization logos to the database
	 * @param request - The request object containing the organization ID in the params and the image files in the body
	 * @param reply - The reply object used to send the response
	 */
	static async uploadImage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<{ logo_dark?: string, logo_light?: string }>) {
		const { id } = request.params;

		const organization = await goDb.core.organizations.findById(id);

		if (!organization) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Organization not found');
		}

		const updateFields: Partial<{ logo_dark: string, logo_light: string }> = {};
		const uploadedFiles: { logo_dark?: string, logo_light?: string } = {};

		// Process all uploaded files
		for await (const file of request.files()) {
			if (file.fieldname !== 'dark' && file.fieldname !== 'light') {
				throw new HttpException(HTTP_STATUS.BAD_REQUEST, `Invalid organization logo field: ${file.fieldname}`);
			}

			const buffer = await file.toBuffer();

			const result = await storageProvider.upload(buffer, {
				created_by: request.me._id,
				name: file.filename,
				resource_id: id,
				scope: 'organizations',
				size: buffer.byteLength,
				type: file.mimetype,
				updated_by: request.me._id,
			});

			// Determine which logo to update based on fieldname
			if (file.fieldname === 'dark') {
				await deleteReplacedLogo(organization.logo_dark, result._id);
				updateFields.logo_dark = result._id;
				uploadedFiles.logo_dark = result._id;
			} else if (file.fieldname === 'light') {
				await deleteReplacedLogo(organization.logo_light, result._id);
				updateFields.logo_light = result._id;
				uploadedFiles.logo_light = result._id;
			}
		}

		if (Object.keys(updateFields).length === 0) {
			throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'No valid files provided');
		}

		// Update organization with new logo IDs
		await goDb.core.organizations.updateById(id, updateFields);

		reply.send({ data: uploadedFiles, error: null, statusCode: HTTP_STATUS.OK });
	}

	//
}
