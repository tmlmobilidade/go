/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { Organization } from '@tmlmobilidade/go-types-core';

/**
 * Update organization logos.
 * @param request The request object containing the organization ID in the params and the image files in the body
 * @param reply The reply object used to send the response
 */
export async function updateImageHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<{ logo_dark?: string, logo_light?: string }>) {
	//

	//
	// Find the organization in the database

	const foundOrganization = await goDb.core.organizations.findById(request.params.id);

	if (!foundOrganization) {
		return sendErrorApiResponse(reply, {
			error: 'Organization not found',
			status_code: '404',
		});
	}

	//
	// Upload the files to the storage

	const updateFields: Partial<Organization> = {};

	for await (const file of request.files()) {
		// Decode the file to a buffer
		const decodedFile = await file.toBuffer();
		// Upload the file to the storage
		const result = await storageProvider.upload(decodedFile, {
			created_by: request.me._id,
			name: file.filename,
			resource_id: request.params.id,
			scope: 'organizations',
			size: decodedFile.buffer.byteLength,
			type: file.mimetype,
			updated_by: request.me._id,
		});
		// If the file is a light logo,
		// upload the file to the storage and update
		// the organization with the new logo ID
		if (file.fieldname === 'light') {
			// Delete old light logo if it exists
			if (foundOrganization.logo_light) {
				try {
					await storageProvider.delete(foundOrganization.logo_light);
				} catch (error) {
					console.info('Failed to delete old light logo', error);
				}
			}
			// Update the organization with the new logo ID
			updateFields.logo_light = result._id;
		}
		// If the file is a dark logo,
		// upload the file to the storage and update
		// the organization with the new logo ID
		if (file.fieldname === 'dark') {
			// Delete old dark logo if it exists
			if (foundOrganization.logo_dark) {
				try {
					await storageProvider.delete(foundOrganization.logo_dark);
				} catch (error) {
					console.info('Failed to delete old dark logo', error);
				}
			}
			// Update the organization with the new logo ID
			updateFields.logo_dark = result._id;
		}
	}

	//
	// If no valid files were provided, return an error

	if (Object.keys(updateFields).length === 0) {
		return sendErrorApiResponse(reply, {
			error: 'No valid files provided',
			status_code: '400',
		});
	}

	//
	// Update organization with new logo IDs

	const updateResult = await goDb.core.organizations.updateById(request.params.id, updateFields);

	return sendSuccessApiResponse(reply, updateResult);
}
