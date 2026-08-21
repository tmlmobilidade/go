/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';

/**
 * Delete an organization logo from the database and storage.
 * @param request The request object containing the organization ID in the params.
 * @param reply The reply object used to send the response.
 */
export async function deleteImageHandler(request: FastifyRequest<{ Params: { id: string, theme: 'dark' | 'light' } }>, reply: FastifyReply<void>) {
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
