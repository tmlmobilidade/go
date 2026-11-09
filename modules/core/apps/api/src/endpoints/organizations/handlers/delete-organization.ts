/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';

/**
 * Deletes an Organization from the database.
 * @param request The request object containing the organization ID in the params.
 * @param reply The reply object used to send the response.
 */
export async function deleteOrganizationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	// Find the organization by ID
	const organization = await goDb.core.organizations.findById(request.params.id);
	if (!organization) {
		return sendErrorApiResponse(reply, { error: 'Organization not found', status_code: '404' });
	}
	// Delete associated logo files if they exist
	if (organization.logo_dark) {
		try {
			await storageProvider.delete(organization.logo_dark);
		} catch {
			return sendErrorApiResponse(reply, { error: 'Failed to delete organization logo', status_code: '500' });
		}
	}
	if (organization.logo_light) {
		try {
			await storageProvider.delete(organization.logo_light);
		} catch {
			return sendErrorApiResponse(reply, { error: 'Failed to delete organization logo', status_code: '500' });
		}
	}
	// Delete the organization from the database
	await goDb.core.organizations.deleteById(request.params.id);
	return sendSuccessApiResponse(reply, undefined);
}
