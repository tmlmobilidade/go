/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';

/**
 * Deletes an Organization and its logo files from the database and storage.
 * @param request The request object
 * @param reply The reply object
 */
export async function deleteOrganizationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	//

	//
	// Find the organization by ID

	const foundOrganization = await goDb.core.organizations.findById(request.params.id);

	if (!foundOrganization) {
		return sendErrorApiResponse(reply, {
			error: `Organization with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	//
	// Delete the associated logo files, if they exist

	if (foundOrganization.logo_dark) {
		await storageProvider.delete(foundOrganization.logo_dark);
	}

	if (foundOrganization.logo_light) {
		await storageProvider.delete(foundOrganization.logo_light);
	}

	//
	// Delete the organization from the database

	await goDb.core.organizations.deleteById(request.params.id);

	return sendSuccessApiResponse(reply, undefined);
}
