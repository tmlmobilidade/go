/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';

/**
 * Gets organization logo from the database.
 * @param request The request object containing the organization ID in the params.
 * @param reply The reply object used to send the response.
 */
export async function getImageHandler(request: FastifyRequest<{ Params: { id: string, theme: 'dark' | 'light' } }>, reply: FastifyReply<string>) {
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
	// Determine which logo to get based on theme

	const fileIdForTheme = request.params.theme === 'light' ? foundOrganization.logo_light : foundOrganization.logo_dark;

	if (!fileIdForTheme) {
		return sendErrorApiResponse(reply, {
			error: `Logo not found for theme: ${request.params.theme}`,
			status_code: '404',
		});
	}

	//
	// Fetch logo files if they exist

	const fileDataForTheme = await storageProvider.findById(fileIdForTheme);

	if (!fileDataForTheme) {
		return sendErrorApiResponse(reply, {
			error: `File not found for theme: ${request.params.theme}`,
			status_code: '404',
		});
	}

	//
	// Send the response with file URL

	return sendSuccessApiResponse(reply, fileDataForTheme.url);
}
