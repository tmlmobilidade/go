/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type Organization } from '@tmlmobilidade/go-types-core';

/**
 * Delete an organization logo from the database and storage.
 * @param request The request object containing the organization ID in the params.
 * @param reply The reply object used to send the response.
 */
export async function deleteImageHandler(request: FastifyRequest<{ Params: { id: string, theme: 'dark' | 'light' } }>, reply: FastifyReply<Organization>) {
	//

	//
	// Find the organization by ID

	const foundOrganization = await goDb.core.organizations.findById(request.params.id);

	if (!foundOrganization) {
		return sendErrorApiResponse(reply, {
			error: 'Organization not found',
			status_code: '404',
		});
	}

	//
	// Determine which logo to delete based on theme

	const fileIdForTheme = request.params.theme === 'light' ? foundOrganization.logo_light : foundOrganization.logo_dark;

	if (!fileIdForTheme) {
		return sendErrorApiResponse(reply, {
			error: `Logo not found for theme: ${request.params.theme}`,
			status_code: '404',
		});
	}

	//
	// Delete the logo file from storage

	try {
		await storageProvider.delete(fileIdForTheme);
	} catch (error) {
		console.error(error);
	}

	//
	// Update the organization to remove the logo reference

	if (request.params.theme === 'light') {
		const updateResult = await goDb.core.organizations.updateById(request.params.id, { logo_light: null });
		return sendSuccessApiResponse(reply, updateResult);
	}

	const updateResult = await goDb.core.organizations.updateById(request.params.id, { logo_dark: null });
	return sendSuccessApiResponse(reply, updateResult);
}
