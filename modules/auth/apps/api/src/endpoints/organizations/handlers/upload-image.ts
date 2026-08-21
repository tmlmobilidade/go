/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';

/**
 * Upload organization logos - Uploads organization logos to the database
 * @param request The request object containing the organization ID in the params and the image files in the body
 * @param reply The reply object used to send the response
 */
export async function uploadImageHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<{ logo_dark?: string, logo_light?: string }>) {
	const { id } = request.params;

	const organization = await goDb.core.organizations.findById(id);

	if (!organization) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Organization not found');
	}

	const updateFields: Partial<{ logo_dark: string, logo_light: string }> = {};
	const uploadedFiles: { logo_dark?: string, logo_light?: string } = {};

	// Process all uploaded files
	for await (const file of request.files()) {
		const buffer = await file.toBuffer();
		const size = buffer.buffer.byteLength;

		const result = await storageProvider.upload(buffer, {
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
					await storageProvider.delete(organization.logo_dark);
				} catch (error) {
					throw new error();
					continue;
				}
			}
			updateFields.logo_dark = result._id;
			uploadedFiles.logo_dark = result._id;
		} else if (file.fieldname === 'light') {
			// Delete old light logo if it exists
			if (organization.logo_light) {
				try {
					await storageProvider.delete(organization.logo_light);
				} catch (error) {
					throw new error();
					continue;
				}
			}
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
